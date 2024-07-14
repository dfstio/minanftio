import { serializeTransaction } from "./transaction";
import { sendBuyTransaction } from "./send";
import { chainId } from "../blockchain/explorer";
import { getNonce } from "./nonce";
import logger from "../serverless/logger";
const changeNonce = process.env.REACT_APP_CHAIN_ID === "mina:mainnet";
const log = logger.info.child({
  winstonModule: "BuyButton",
  winstonComponent: "buy function",
});
const DEBUG = "true" === process.env.REACT_APP_DEBUG;

export async function buyNFT(params) {
  console.time("ready to sign");
  if (DEBUG) console.log("Buy NFT", params);

  const { price, buyer, name, showText, showPending } = params;

  const chain = chainId();

  if (buyer === undefined) {
    console.error("Buyer address is undefined");
    return {
      success: false,
      error: "Buyer address is undefined",
    };
  }
  if (DEBUG) console.log("Buyer", buyer);

  if (name === undefined || name === "") {
    console.error("NFT name is undefined");
    return {
      success: false,
      error: "NFT name is undefined",
    };
  }
  const o1jsInfo = (
    <span>
      Loading{" "}
      <a href={"https://docs.minaprotocol.com/zkapps/o1js"} target="_blank">
        o1js
      </a>{" "}
      library...
    </span>
  );
  await showPending(o1jsInfo);
  const { PublicKey, UInt64, Mina } = await import("o1js");
  const {
    MinaNFT,
    NameContractV2,
    BuyParams,
    initBlockchain,
    MINANFT_NAME_SERVICE_V2,
    fetchMinaAccount,
    serializeFields,
    accountBalanceMina,
  } = await import("minanft");

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
  await showPending("Getting current NFT state from the Mina blockchain...");
  const contractAddress = MINANFT_NAME_SERVICE_V2;
  if (contractAddress === undefined) {
    console.error("Contract address is undefined");
    return {
      success: false,
      error: "Contract address is undefined",
    };
  }

  if (chain === undefined) {
    console.error("Chain is undefined");
    return {
      success: false,
      error: "Chain is undefined",
    };
  }

  console.time("prepared data");
  if (DEBUG) console.log("contractAddress", contractAddress);

  const address = PublicKey.fromBase58(params.address);
  const net = await initBlockchain(chain);
  if (DEBUG) console.log("network id", Mina.getNetworkId());
  const sender = PublicKey.fromBase58(buyer);

  console.timeEnd("prepared data");

  const zkAppAddress = PublicKey.fromBase58(MINANFT_NAME_SERVICE_V2);
  const zkApp = new NameContractV2(zkAppAddress);
  const tokenId = zkApp.deriveTokenId();
  const fee = Number((await MinaNFT.fee()).toBigInt());
  const memo = ("buy NFT @" + name).substring(0, 30);
  await fetchMinaAccount({ publicKey: sender });
  await fetchMinaAccount({ publicKey: zkAppAddress });
  await fetchMinaAccount({ publicKey: address, tokenId });
  console.time("prepared tx");

  if (!Mina.hasAccount(sender)) {
    console.error("Account not found", sender.toBase58());
    await showText(
      `Account ${sender.toBase58()} not found. Please try again later, after all the previous transactions are included in the block.`,
      "red"
    );
    await showPending(undefined);
    return {
      success: false,
      error: "Account not found",
    };
  }
  if (!Mina.hasAccount(zkAppAddress)) {
    console.error("Account not found");
    await showText(
      `Contract account ${zkAppAddress.toBase58()} not found. Please check your internet connection.`,

      "red"
    );
    await showPending(undefined);
    return {
      success: false,
      error: "Account not found",
    };
  }
  if (!Mina.hasAccount(address, tokenId)) {
    console.error("Account not found");
    await showText(
      `NFT account ${address.toBase58()} not found. Please check your internet connection and try again later, after all the previous transactions are included in the block.`,
      "red"
    );
    await showPending(undefined);
    return {
      success: false,
      error: "Account not found",
    };
  }
  const blockberryNoncePromise = changeNonce
    ? getNonce(sender.toBase58())
    : undefined;
  const requiredBalance = (Number(price) + fee) / 1_000_000_000;
  const balance = await accountBalanceMina(sender);
  if (requiredBalance > balance) {
    await showText(
      `Insufficient balance of the sender: ${balance} MINA. Required: ${requiredBalance} MINA`,
      "red"
    );
    await showPending(undefined);
    return {
      success: false,
      error: `Insufficient balance of the sender: ${balance} MINA. Required: ${requiredBalance} MINA`,
    };
  }
  await showText(
    "Sucessfully fetched NFT state from the Mina blockchain",
    "green"
  );
  await showPending("Preparing transaction...");

  /*
      export class SellParams extends Struct({
        address: PublicKey,
        price: UInt64,
      }) {}
  */

  const buyParams = new BuyParams({
    address,
    price: UInt64.from(price),
  });

  const senderNonce = Number(Mina.getAccount(sender).nonce.toBigint());
  const blockberryNonce = changeNonce ? await blockberryNoncePromise : 0;
  const nonce = Math.max(senderNonce, blockberryNonce + 1);
  if (nonce > senderNonce)
    log.info(
      `Nonce changed from ${senderNonce} to ${nonce} for ${sender.toBase58()} for NFT ${name}`
    );

  const tx = await Mina.transaction({ sender, fee, memo, nonce }, async () => {
    await zkApp.buy(buyParams);
  });

  const serializedTransaction = serializeTransaction(tx);
  const transaction = tx.toJSON();
  if (DEBUG) console.log("Transaction", tx.toPretty());
  const payload = {
    transaction,
    onlySign: true,
    feePayer: {
      fee: fee,
      memo: memo,
    },
  };
  console.timeEnd("prepared tx");
  console.timeEnd("ready to sign");
  await showText("Transaction prepared", "green");
  await showPending("Please sign the transaction...");
  const txResult = await window.mina?.sendTransaction(payload);
  if (DEBUG) console.log("Transaction result", txResult);
  console.time("sent transaction");
  const signedData = txResult?.signedData;
  if (signedData === undefined) {
    if (DEBUG) console.log("No signed data");
    await showText("No user signature received", "red");
    await showPending(undefined);
    return {
      success: false,
      error: "No user signature",
    };
  }

  await showText("User signature received", "green");
  await showPending("Starting cloud proving job...");
  const jobId = await sendBuyTransaction({
    name,
    serializedTransaction,
    signedData,
    buyParams: serializeFields(BuyParams.toFields(buyParams)),
    contractAddress,
    chain,
  });
  console.timeEnd("sent transaction");
  if (DEBUG) console.log("Sent transaction, jobId", jobId);
  if (jobId === undefined) {
    console.error("JobId is undefined");
    return {
      success: false,
      error: "JobId is undefined",
    };
  }

  return {
    success: true,
    jobId,
  };
}
