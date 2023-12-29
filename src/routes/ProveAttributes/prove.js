import { PrivateKey, Poseidon, PublicKey, Field } from "o1js";
import {
  MinaNFT,
  RedactedMinaNFT,
  MapData,
  MinaNFTNameService,
  accountBalanceMina,
  makeString,
  api,
  MINANFT_NAME_SERVICE,
} from "minanft";

const { REACT_APP_JWT } = process.env;

export async function prove(auth, json, keys) {
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
      console.log(`key:`, key, properties[key]);

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

export async function waitForProof(jobId, json, selectedRowKeys, table, auth) {
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
      error: "Mint error",
      reason: txData.error,
    };
  }

  const proof = {
    name: json.name,
    version: json.version,
    address: json.address,
    keys: getKeys(selectedRowKeys, table),
    proof: txData.result.result,
  };

  return {
    success: true,
    proof,
  };
}
