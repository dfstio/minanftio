import { PublicKey, Field, Poseidon } from "o1js";
import {
  MinaNFT,
  api,
  MINANFT_NAME_SERVICE,
  MinaNFTContract,
  MinaNFTNameServiceContract,
} from "minanft";
import { MerkleMap, fetchAccount } from "o1js";

const { REACT_APP_JWT } = process.env;

export async function check(json) {
  MinaNFT.minaInit("testworld2");
  if (
    json.proof === undefined ||
    json.proof.publicInput === undefined ||
    json.proof.publicInput.length !== 6 ||
    json.keys === undefined ||
    json.keys.length !== json.proof?.publicInput[5]
  ) {
    console.log("JSON proof error", json.proof);
    return false;
  }
  const data = new MerkleMap();
  const kind = new MerkleMap();
  let hash = Field(0);
  const str = MinaNFT.stringToField("string");
  for (let i = 0; i < json.keys.length; i++) {
    console.log("item", json.keys[i]);
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
    console.log(
      "redacted metadata check error",
      data.getRoot().toJSON(),
      json.proof?.publicInput[2],
      kind.getRoot().toJSON(),
      json.proof?.publicInput[3]
    );
    return false;
  }
  const nameServiceAddress = PublicKey.fromBase58(MINANFT_NAME_SERVICE);
  const zkNames = new MinaNFTNameServiceContract(nameServiceAddress);
  const zkApp = new MinaNFTContract(
    PublicKey.fromBase58(json.address),
    zkNames.token.id
  );
  await fetchAccount({ publicKey: zkApp.address, tokenId: zkNames.token.id });
  const metadata = zkApp.metadata.get();
  const version = zkApp.version.get();
  if (
    metadata.data.toJSON() !== json.proof?.publicInput[0] ||
    metadata.kind.toJSON() !== json.proof?.publicInput[1] ||
    version.toJSON() !== json.version.toString()
  ) {
    console.log(
      "metadata check error",
      metadata.data.toJSON(),
      json.proof?.publicInput[0],
      metadata.kind.toJSON(),
      json.proof?.publicInput[1],
      version.toJSON(),
      json.version.toString()
    );
    return false;
  }

  return true;
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
