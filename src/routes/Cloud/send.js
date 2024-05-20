import axios from "axios";
import { sleep } from "minanft";

export async function sendTransaction(params) {
  const { serializedTransaction, signedData, contractAddress, address, value } =
    params;
  console.log("sendTransaction", {
    serializedTransaction,
    signedData,
    contractAddress,
  });

  let args = JSON.stringify({
    contractAddress,
  });

  const transaction = JSON.stringify(
    {
      serializedTransaction,
      signedData,
      address,
      value,
    },
    null,
    2
  );

  let answer = await zkCloudWorkerRequest({
    command: "execute",
    transactions: [transaction],
    task: "proveAndSend",
    args,
    metadata: `prove and send`,
    mode: "async",
  });

  console.log(`zkCloudWorker answer:`, answer);
  const jobId = answer.jobId;
  console.log(`jobId:`, jobId);
  let result;
  while (result === undefined || answer.jobStatus !== "failed") {
    await sleep(5000);
    answer = await zkCloudWorkerRequest({
      command: "jobResult",
      jobId,
    });
    console.log(`jobResult api call result:`, answer);
    result = answer.result;
  }
  if (answer.jobStatus === "failed") {
    return { isSent: false, hash: result };
  } else if (result === undefined) {
    return { isSent: false, hash: "job error" };
  } else return { isSent: true, hash: result };
}

async function zkCloudWorkerRequest(params) {
  const { command, task, transactions, args, metadata, mode, jobId } = params;
  const apiData = {
    auth: process.env.REACT_APP_ZKCW_AUTH,
    command: command,
    jwtToken: process.env.REACT_APP_ZKCW_JWT,
    data: {
      task,
      transactions: transactions ?? [],
      args,
      repo: "sign-demo",
      developer: "DFST",
      metadata,
      mode: mode ?? "sync",
      jobId,
    },
    chain: `devnet`,
  };
  const endpoint = process.env.REACT_APP_ZKCW_ENDPOINT + "devnet";

  const response = await axios.post(endpoint, apiData);
  return response.data;
}
