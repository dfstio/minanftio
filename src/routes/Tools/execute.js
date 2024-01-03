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
    case "reservename":
      return await reserve(JWT, json);
    case "mint":
      return await mint(JWT, json);
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
      message: balance,
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
    if (JWT === undefined) throw new Error("JWT token is not set");
    const minanft = new api(JWT);
    if (json.data?.publicKey === undefined || json.data?.publicKey === "") {
      console.error("Public key is undefined");
      return {
        success: false,
        error: "Public key is undefined",
      };
    }
    if (json.data?.name === undefined || json.data?.name === "") {
      console.error("Name is undefined");
      return {
        success: false,
        error: "Name is undefined",
      };
    }
    const reserved = await minanft.reserveName({
      name: json.data.name,
      publicKey: json.data.publicKey,
    });
    console.log("reserved", reserved);
    if (
      reserved !== undefined &&
      reserved.isReserved === true &&
      reserved.signature !== undefined
    ) {
      const reservedJSON = JSON.stringify(
        {
          filename: json.data.name,
          type: "name",
          timestamp: Date.now(),
          data: {
            name: json.data.name,
            account: json.data.account,
            address: json.data.publicKey,
            signature: reserved.signature,
          },
        },
        null,
        2
      );
      console.log("reservedJSON", reservedJSON);
      return {
        success: true,
        result: JSON.stringify(reserved, null, 2),
        json: reservedJSON,
        filename: json.data.name + ".name.json",
        message: "Name reserved",
      };
    } else {
      return {
        success: false,
        error: reserved.error.toString(),
        reason: reserved.reason.toString(),
      };
    }
  } catch (e) {
    console.error("name reservation error", e);
    return {
      success: false,
      error: "name reservation error",
      reason: e.toString(),
    };
  }
}

async function mint(JWT, json) {
  try {
    if (JWT === undefined) throw new Error("JWT token is not set");
    const minanft = new api(JWT);
    if (json.data?.uri === undefined || json.data?.uri === "") {
      console.error("URI is undefined");
      return {
        success: false,
        error: "URI is undefined",
      };
    }
    if (json.data?.signature === undefined || json.data?.signature === "") {
      console.error("Signature is undefined");
      return {
        success: false,
        error: "Signature is undefined",
      };
    }
    if (json.data?.privateKey === undefined || json.data?.privateKey === "") {
      console.error("privateKey is undefined");
      return {
        success: false,
        error: "privateKey is undefined",
      };
    }
    const result = await minanft.mint({
      uri: json.data.uri,
      signature: json.data.signature,
      privateKey: json.data.privateKey,
      useArweave: json.data.useArweave ?? false,
    });
    console.log("api result", result);

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
      result: "Minting started",
    };
  } catch (e) {
    console.error("mint error", e);
    return {
      success: false,
      error: "mint error",
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
      error: "Mint error",
      reason: txData.error,
    };
  }
  console.log("mintResult", txData.result.result);

  return {
    success: true,
    mintResult: txData.result.result,
  };
}

export function getName(json) {
  const name =
    getFormattedDateTime(json.timestamp) + "." + json.filename + ".result.json";
  return name;
}

function getFormattedDateTime(timestamp) {
  const now = new Date(timestamp);

  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");

  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");

  return `${year}.${month}.${day}-${hours}.${minutes}.${seconds}`;
}
