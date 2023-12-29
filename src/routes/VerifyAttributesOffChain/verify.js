import { api } from "minanft";
import { check } from "../../blockchain/verify";

const { REACT_APP_JWT } = process.env;

export async function verify(auth, json) {
  console.log("verify start", auth, json);
  if ((await check(json)) === false) {
    return {
      success: false,
      error: "JSON Verification error:",
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
