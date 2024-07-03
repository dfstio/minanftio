import { chainId } from "../blockchain/explorer";
const { REACT_APP_MINANFT_JWT } = process.env;
const DEBUG = "true" === process.env.REACT_APP_DEBUG;

let minanft = undefined;

export async function prove(json, keys, libraries, showText, showPending) {
  if (DEBUG) console.log("prove start", keys, json);
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
  await showPending("Preparing proof data...");
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

  const nft = new RollupNFT({
    name: json.name,
    address: PublicKey.fromBase58(json.address),
  });

  await nft.loadMetadata(JSON.stringify(json));
  const loadedJson = nft.toJSON();
  if (DEBUG) console.log(`loadedJson:`, JSON.stringify(loadedJson, null, 2));

  const redactedNFT = new RedactedMinaNFT(nft);
  for (const key of keys) {
    if (DEBUG) console.log(`key:`, key);
    redactedNFT.copyMetadata(key);
  }
  const transactions = await redactedNFT.prepareProofData();
  if (DEBUG) console.log("transactions", transactions.length);
  await showText("Proof data prepared", "green");
  await showPending("Starting cloud proving job...");
  const result = await minanft.proof({
    transactions,
    developer: "@dfst",
    name: "map-proof",
    task: "calculate",
    args: [],
  });

  if (DEBUG) console.log("proof job result", result);

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

export function getKeys(selectedRowKeys, table) {
  const keys = [];
  selectedRowKeys.forEach((key) => {
    const row = table.find((row) => row.key === key);
    if (row !== undefined) keys.push({ key: row.key, value: row.value });
  });
  return keys;
}

export function prepareTable(token) {
  const strings = [];

  function iterateProperties(properties, level = 0) {
    for (const key in properties) {
      if (DEBUG) console.log(`key:`, key, properties[key]);

      switch (properties[key].kind) {
        case "string":
          strings.push({
            key: key,
            value: properties[key].data,
            type: properties[key].isPrivate === true ? "private" : "public",
            id: strings.length,
          });
          break;

        default:
          break;
      }
    }
  }
  try {
    iterateProperties(token.properties);
  } catch (error) {
    console.error(`Error: ${error}`);
  }

  return strings;
}

export async function waitForProof(jobId, json, selectedRowKeys, table) {
  if (jobId === undefined || jobId === "") {
    console.error("JobId is undefined");
    return {
      success: false,
      error: "JobId is undefined",
    };
  }
  const JWT = REACT_APP_MINANFT_JWT;
  if (JWT === undefined || JWT === "") {
    console.error("JWT is undefined");
    return {
      success: false,
      error: "JWT is undefined",
    };
  }
  //const minanft = new api(JWT);
  const txData = await minanft.waitForJobResult({ jobId });
  if (DEBUG) console.log("Job result", txData);
  if (txData?.result?.result === undefined || txData.result?.result === "") {
    console.error("txData is undefined");
    return {
      success: false,
      error: "Proving error",
      reason: txData.error,
    };
  }

  const proof = {
    name: json.name,
    version: json.version,
    address: json.address,
    keys: getKeys(selectedRowKeys, table),
    proof: JSON.parse(txData.result.result),
  };

  if (DEBUG) console.log("proof", proof);

  return {
    success: true,
    proof: JSON.stringify(proof, null, 2),
  };
}
