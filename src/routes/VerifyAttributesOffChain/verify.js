import { PublicKey } from "o1js";
import {
  MinaNFT,
  RedactedMinaNFT,
  api,
  MINANFT_NAME_SERVICE,
  MinaNFTContract,
  MinaNFTNameServiceContract,
} from "minanft";
import { MerkleMap, fetchAccount } from "o1js";

const { REACT_APP_JWT } = process.env;

export async function check(json) {
  MinaNFT.minaInit("testworld2");
  let verified = true;
  const data = new MerkleMap();
  const kind = new MerkleMap();
  for (let i = 0; i < json.keys.length; i++) {
    console.log("item", json.keys[i]);
    data.set(
      MinaNFT.stringToField(json.keys[i].key),
      MinaNFT.stringToField(json.keys[i].value)
    );
    kind.set(
      MinaNFT.stringToField(json.keys[i].key),
      MinaNFT.stringToField("string")
    );
  }
  if (
    data.getRoot().toJSON() !== json.proof?.publicInput[2] ||
    kind.getRoot().toJSON() !== json.proof?.publicInput[3]
  ) {
    console.log(
      "redacted metadata check error",
      data.getRoot().toJSON(),
      json.proof?.publicInput[2],
      kind.getRoot().toJSON(),
      json.proof?.publicInput[3]
    );
    verified = false;
  }
  const nameServiceAddress = PublicKey.fromBase58(MINANFT_NAME_SERVICE);
  const zkNames = new MinaNFTNameServiceContract(nameServiceAddress);
  const zkApp = new MinaNFTContract(
    PublicKey.fromBase58(json.address),
    zkNames.token.id
  );
  await fetchAccount({ publicKey: zkApp.address, tokenId: zkNames.token.id });
  const metadata = zkApp.metadata.get();
  if (
    metadata.data.toJSON() !== json.proof?.publicInput[0] ||
    metadata.kind.toJSON() !== json.proof?.publicInput[1]
  ) {
    console.log(
      "metadata check error",
      metadata.data.toJSON(),
      json.proof?.publicInput[0],
      metadata.kind.toJSON(),
      json.proof?.publicInput[1]
    );
    verified = false;
  }

  return verified;
}

export async function verify(auth, json) {
  console.log("verify start", auth, json);
  if ((await check(json)) === false) {
    return {
      success: false,
      error: "JSON Verification error",
      reason: "check failed",
    };
  }
  const JWT = auth === undefined || auth === "" ? REACT_APP_JWT : auth;
  const minanft = new api(JWT);
  const transactions = [JSON.stringify(json.proof)];

  console.log("transactions", transactions.length);
  const result = await minanft.proof({
    transactions,
    developer: "@dfst",
    name: "map-proof",
    task: "verify",
    args: [],
  });

  console.log("verify job result", result);

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
