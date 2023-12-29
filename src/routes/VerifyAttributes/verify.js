import { PublicKey } from "o1js";
import { MinaNFT, RedactedMinaNFT, api, MINANFT_NAME_SERVICE } from "minanft";

const { REACT_APP_JWT } = process.env;

export async function verify(auth, json, keys) {
  console.log("prove start", auth, keys, json);
  const JWT = auth === undefined || auth === "" ? REACT_APP_JWT : auth;
  const minanft = new api(JWT);
  const nameServiceAddress = PublicKey.fromBase58(MINANFT_NAME_SERVICE);
  const blockchainInstance = "testworld2";
  MinaNFT.minaInit(blockchainInstance);
  console.log("nameServiceAddress", nameServiceAddress);

  const nft = new MinaNFT({
    name: json.name,
    address: PublicKey.fromBase58(json.address),
    nameService: nameServiceAddress,
  });

  await nft.loadMetadata(JSON.stringify(json));
  const loadedJson = nft.toJSON();
  console.log(`loadedJson:`, JSON.stringify(loadedJson, null, 2));

  const checkNft = await nft.checkState();
  if (checkNft === false) {
    console.error("NFT checkState error");
    return;
  }

  const redactedNFT = new RedactedMinaNFT(nft);
  for (const key of keys) {
    console.log(`key:`, key);
    redactedNFT.copyMetadata(key);
  }
  const transactions = await redactedNFT.prepareProofData();
  console.log("transactions", transactions.length);
  const result = await minanft.proof({
    transactions,
    developer: "@dfst",
    name: "map-proof",
    task: "calculate",
    args: [],
  });

  console.log("proof job result", result);

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

export function prepareTable(token) {
  return token.keys ?? [];
}

export async function waitForProof(jobId, auth) {
  if (jobId === undefined || jobId === "") {
    console.error("JobId is undefined");
    return {
      success: false,
      error: "JobId is undefined",
    };
  }
  const JWT = auth === undefined || auth === "" ? REACT_APP_JWT : auth;
  const minanft = new api(JWT);
  const txData = await minanft.waitForJobResult({ jobId });
  console.log("Job result", txData);
  if (txData?.result?.result === undefined || txData.result?.result === "") {
    console.error("txData is undefined");
    return {
      success: false,
      error: "Verification error",
      reason: txData.error,
    };
  }
  console.log("verificationResult", txData.result.result);

  return {
    success: true,
    verificationResult: txData.result.result,
  };
}
