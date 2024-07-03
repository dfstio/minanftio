import { chainId } from "../blockchain/explorer";
const { REACT_APP_MINANFT_JWT } = process.env;
const DEBUG = "true" === process.env.REACT_APP_DEBUG;

let minanft = undefined;

export async function verify(json, keys, libraries, showText, showPending) {
  if (DEBUG) console.log("verify start", keys, json);
  const JWT = REACT_APP_MINANFT_JWT;
  if (JWT === undefined || JWT === "") {
    console.error("JWT is undefined");
    return {
      success: false,
      error: "JWT is undefined",
    };
  }

  const chain = chainId();
  const lib = await libraries;
  const { PrivateKey, Poseidon, PublicKey, Field } = lib.o1js;
  const {
    RollupNFT,
    RedactedMinaNFT,
    MapData,
    MinaNFTNameService,
    accountBalanceMina,
    makeString,
    api,
    initBlockchain,
  } = lib.minanft;
  minanft = new api(JWT);
  await initBlockchain(chain);
  const o1jsInfoDone = (
    <span>
      Loaded{" "}
      <a href={"https://docs.minaprotocol.com/zkapps/o1js"} target="_blank">
        o1js
      </a>{" "}
      library
    </span>
  );
  await showText(o1jsInfoDone, "green");
  await showPending("Verifying NFT on-chain data...");
  const checked = await check(json, lib);
  if (checked === false) {
    await showText("NFT on-chain state does not match proof data", "red");
    await showPending(undefined);
    return {
      success: false,
      error: "NFT on-chain state does not match proof data",
    };
  }
  await showText("NFT on-chain state matches proof data", "green");
  await showPending("Starting cloud proof verification job...");

  const transactions = [JSON.stringify(json.proof)];

  if (DEBUG) console.log("transactions", transactions.length);
  const result = await minanft.proof({
    transactions,
    developer: "@dfst",
    name: "map-proof",
    task: "verify",
    args: [],
  });
  if (DEBUG) console.log("proof verification job result", result);

  const jobId = result.jobId;
  if (jobId === undefined) {
    console.error("JobId is undefined");
    return {
      success: false,
      error: "JobId is undefined",
      reason: result.error,
    };
  }

  return {
    success: true,
    jobId,
  };
}

export async function waitForProof(jobId) {
  if (jobId === undefined || jobId === "") {
    console.error("JobId is undefined");
    return {
      success: false,
      error: "JobId is undefined",
    };
  }

  const txData = await minanft.waitForJobResult({ jobId });
  if (DEBUG) console.log("Job result", txData);
  if (txData?.result?.result === undefined || txData.result?.result === "") {
    console.error("txData is undefined");
    return {
      success: false,
      error: "Verification error",
      reason: txData.error,
    };
  }
  if (DEBUG) console.log("verificationResult", txData.result.result);

  return {
    success: true,
    verificationResult: txData.result.result,
  };
}

export async function check(json, lib) {
  const { PublicKey, Field, Poseidon, MerkleMap, fetchAccount } = lib.o1js;
  const {
    MinaNFT,
    NameContractV2,
    RollupNFT,
    FileData,
    initBlockchain,
    MINANFT_NAME_SERVICE_V2,
    NFTContractV2,
    MinaNFTNameServiceContract,
  } = lib.minanft;

  if (
    json.proof === undefined ||
    json.proof.publicInput === undefined ||
    json.proof.publicInput.length !== 6 ||
    json.keys === undefined ||
    json.keys.length !== parseInt(json.proof?.publicInput[5])
  ) {
    console.error("JSON proof error", json.proof);
    return false;
  }
  const data = new MerkleMap();
  const kind = new MerkleMap();
  let hash = Field(0);
  const str = MinaNFT.stringToField("string");
  for (let i = 0; i < json.keys.length; i++) {
    if (DEBUG) console.log("item", json.keys[i]);
    const key = MinaNFT.stringToField(json.keys[i].key);
    const value = MinaNFT.stringToField(json.keys[i].value);
    data.set(key, value);
    kind.set(key, str);
    /*
     hash: Poseidon.hash([
        element.key,
        element.value.data,
        element.value.kind,
      ]),
      hash: state1.hash.add(state2.hash),
      */
    hash = hash.add(Poseidon.hash([key, value, str]));
  }
  if (
    data.getRoot().toJSON() !== json.proof?.publicInput[2] ||
    kind.getRoot().toJSON() !== json.proof?.publicInput[3] ||
    hash.toJSON() !== json.proof?.publicInput[4]
  ) {
    if (DEBUG)
      console.log(
        "redacted metadata check error",
        data.getRoot().toJSON(),
        json.proof?.publicInput[2],
        kind.getRoot().toJSON(),
        json.proof?.publicInput[3]
      );
    return false;
  }
  const nameServiceAddress = PublicKey.fromBase58(MINANFT_NAME_SERVICE_V2);
  const zkNames = new NameContractV2(nameServiceAddress);
  const tokenId = zkNames.deriveTokenId();
  const nftAddress = PublicKey.fromBase58(json.address);
  const zkApp = new NFTContractV2(nftAddress, tokenId);
  await fetchAccount({ publicKey: nftAddress, tokenId });
  const metadataParams = zkApp.metadataParams.get();
  const metadata = metadataParams.metadata;
  //const version = zkApp.version.get();
  if (
    metadata.data.toJSON() !== json.proof?.publicInput[0] ||
    metadata.kind.toJSON() !== json.proof?.publicInput[1]
    //version.toJSON() !== json.version.toString()
  ) {
    if (DEBUG)
      console.log(
        "metadata check error",
        metadata.data.toJSON(),
        json.proof?.publicInput[0],
        metadata.kind.toJSON(),
        json.proof?.publicInput[1]
        //version.toJSON(),
        //json.version.toString()
      );
    return false;
  }

  return true;
}
