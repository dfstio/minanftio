import { serializeTransaction } from "./transaction";
import { sendBuyTransaction } from "./send";
import { chainId } from "../blockchain/explorer";

export async function buyNFT(params) {
  console.time("ready to sign");
  console.log("Buy NFT", params);

  const { price, buyer, name } = params;

  const chain = chainId();

  if (buyer === undefined) {
    console.error("Buyer address is undefined");
    return {
      success: false,
      error: "Buyer address is undefined",
    };
  }
  console.log("Buyer", buyer);

  if (name === undefined || name === "") {
    console.error("NFT name is undefined");
    return {
      success: false,
      error: "NFT name is undefined",
    };
  }
  const { PublicKey, UInt64, Mina } = await import("o1js");
  const {
    MinaNFT,
    NameContractV2,
    BuyParams,
    initBlockchain,
    MINANFT_NAME_SERVICE_V2,
    fetchMinaAccount,
    serializeFields,
  } = await import("minanft");

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
  console.log("contractAddress", contractAddress);

  const address = PublicKey.fromBase58(params.address);
  const net = await initBlockchain(chain);
  console.log("network id", Mina.getNetworkId());
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

  const tx = await Mina.transaction({ sender, fee, memo }, async () => {
    await zkApp.buy(buyParams);
  });

  const serializedTransaction = serializeTransaction(tx);
  const transaction = tx.toJSON();
  console.log("Transaction", tx.toPretty());
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
  const txResult = await window.mina?.sendTransaction(payload);
  console.log("Transaction result", txResult);
  console.time("sent transaction");
  const signedData = txResult?.signedData;
  if (signedData === undefined) {
    console.log("No signed data");
    return {
      success: false,
      error: "No user signature",
    };
  }

  const jobId = await sendBuyTransaction({
    name,
    serializedTransaction,
    signedData,
    buyParams: serializeFields(BuyParams.toFields(buyParams)),
    contractAddress,
    chain,
  });
  console.timeEnd("sent transaction");
  console.log("Sent transaction, jobId", jobId);
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