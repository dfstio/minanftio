import { serializeTransaction } from "./transaction";
import { sendSellTransaction } from "./send";
import { chainId } from "../blockchain/explorer";

export async function sellNFT(params) {
  console.time("ready to sign");
  console.log("Sell NFT", params);

  const { price, owner, name, showText } = params;

  const chain = chainId();

  if (owner === undefined) {
    console.error("Owner address is undefined");
    return {
      success: false,
      error: "Owner address is undefined",
    };
  }
  console.log("Owner", owner);

  if (name === undefined || name === "") {
    console.error("NFT name is undefined");
    return {
      success: false,
      error: "NFT name is undefined",
    };
  }

  await showText("Loading o1js library...");
  const { PublicKey, UInt64, Mina } = await import("o1js");
  const {
    MinaNFT,
    NameContractV2,
    SellParams,
    initBlockchain,
    MINANFT_NAME_SERVICE_V2,
    fetchMinaAccount,
    serializeFields,
  } = await import("minanft");

  await showText("Getting current NFT state from Mina blockchain...");
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
  const sender = PublicKey.fromBase58(owner);

  console.timeEnd("prepared data");

  const zkAppAddress = PublicKey.fromBase58(MINANFT_NAME_SERVICE_V2);
  const zkApp = new NameContractV2(zkAppAddress);
  const tokenId = zkApp.deriveTokenId();
  const fee = Number((await MinaNFT.fee()).toBigInt());
  const memo = ("sell NFT @" + name).substring(0, 30);
  console.log("memo", memo);
  console.log("sender", sender.toBase58());
  console.log("zkAppAddress", zkAppAddress.toBase58());
  console.log("address", address.toBase58());
  console.log("tokenId", tokenId.toJSON());
  await fetchMinaAccount({ publicKey: sender });
  await fetchMinaAccount({ publicKey: zkAppAddress });
  await fetchMinaAccount({ publicKey: address, tokenId });
  await showText("Preparing transaction...");
  /*
  const nft = new NFTContractV2({ address, tokenId });
  const nftOwner = nft.owner.get();
  console.log("nftOwner", nftOwner);
  await sleep(5000);
  console.log("x", nftOwner.x);
  console.log("x1", nftOwner.x.toJSON());
  //console.log("NFT owner", nftOwner.toBase58());
  */
  console.time("prepared tx");

  /*
      export class SellParams extends Struct({
        address: PublicKey,
        price: UInt64,
      }) {}
  */

  const sellParams = new SellParams({
    address,
    price: UInt64.from(price),
  });

  const tx = await Mina.transaction({ sender, fee, memo }, async () => {
    await zkApp.sell(sellParams);
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
  await showText("Please sign the transaction...");
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
  await showText("Proving transaction...");

  const jobId = await sendSellTransaction({
    name,
    serializedTransaction,
    signedData,
    sellParams: serializeFields(SellParams.toFields(sellParams)),
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
