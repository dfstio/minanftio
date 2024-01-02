import { api, accountBalanceMina, MinaNFT } from "minanft";
import { PublicKey } from "o1js";

const { REACT_APP_JWT } = process.env;

export async function execute(auth, json) {
  console.log("execute start", auth, json);
  const JWT = auth === undefined || auth === "" ? REACT_APP_JWT : auth;
  if (json === undefined || json === "") {
    console.error("JSON is undefined");
    return {
      success: false,
      error: "JSON is undefined",
    };
  }

  if (json.filename === undefined || json.filename === "") {
    console.error("Command is undefined");
    return {
      success: false,
      error: "Command is undefined",
    };
  }

  if (json.type === undefined || json.type !== "request") {
    console.error("Wrong JSON format");
    return {
      success: false,
      error: "Wrong JSON format",
    };
  }

  switch (json.filename) {
    case "balance":
      return await balance(JWT, json);
    case "reserve":
      return await reserve(JWT, json);
    default:
      console.error("Unknown command");
      return {
        success: false,
        error: "Unknown command",
      };
  }
}

async function balance(JWT, json) {
  try {
    MinaNFT.minaInit("testworld2");
    if (json.data?.publicKey === undefined || json.data?.publicKey === "") {
      console.error("Public key is undefined");
      return {
        success: false,
        error: "Public key is undefined",
      };
    }
    const publicKey = PublicKey.fromBase58(json.data?.publicKey);
    const balance = await accountBalanceMina(publicKey);
    console.log("balance", balance);
    return {
      success: true,
      result: balance,
    };
  } catch (e) {
    console.error("balance error", e);
    return {
      success: false,
      error: "balance error",
      reason: e.toString(),
    };
  }
}

async function reserve(JWT, json) {
  try {
    return {
      success: false,
      error: "reserve error",
    };
  } catch (e) {
    console.error("balance error", e);
    return {
      success: false,
      error: "balance error",
      reason: e.toString(),
    };
  }
}

/*
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
    task: "send",
    args: [json.address],
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

*/

export async function waitForExecution(jobId, auth) {
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
