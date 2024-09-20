import { serializeTransaction } from "./transaction";
import { sendTransferTransaction } from "./send";
import { chainId } from "../blockchain/explorer";
import { getNonce } from "./nonce";
import logger from "../serverless/logger";
import { NFTContractV2 } from "minanft";
import { Encoding } from "o1js";
const changeNonce = true; //process.env.REACT_APP_CHAIN_ID === "mina:mainnet";
const log = logger.info.child({
  winstonModule: "TransferButton",
  winstonComponent: "transfer function",
});

const DEBUG = "true" === process.env.REACT_APP_DEBUG;

export async function transferNFT(params) {
  console.time("ready to sign");
  if (DEBUG) console.log("Transfer NFT", params);

  try {
    const { newOwner, owner, showText, showPending, libraries } = params;

    const chain = chainId();

    if (owner === undefined) {
      console.error("Owner address is undefined");
      return {
        success: false,
        error: "Owner address is undefined",
      };
    }
    if (DEBUG) console.log("Owner", owner);

    if (newOwner === undefined || newOwner === "") {
      console.error("New owner address is undefined");
      return {
        success: false,
        error: "New owner address is undefined",
      };
    }

    if (libraries === undefined) {
      console.error("o1js library is missing");
      return {
        success: false,
        error: "o1js library is missing",
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
    const lib = await libraries;

    const { PublicKey, UInt64, Mina, Encoding } = lib.o1js;
    const {
      MinaNFT,
      NameContractV2,
      TransferParams,
      initBlockchain,
      MINANFT_NAME_SERVICE_V2,
      fetchMinaAccount,
      serializeFields,
      accountBalanceMina,
    } = lib.minanft;
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

    try {
      const newOwnerAddress = PublicKey.fromBase58(newOwner);
    } catch (error) {
      console.error("Invalid new owner address", newOwner);
      await showText("Invalid new owner address", "red");
      await showPending(undefined);
      return {
        success: false,
        error: "Invalid new owner address",
      };
    }

    try {
      const nftAddress = PublicKey.fromBase58(params.address);
    } catch (error) {
      console.error("Invalid NFT address", newOwner);
      await showText("Invalid NFT address", "red");
      await showPending(undefined);
      return {
        success: false,
        error: "Invalid NFT address",
      };
    }

    console.time("prepared data");
    if (DEBUG) console.log("contractAddress", contractAddress);

    const address = PublicKey.fromBase58(params.address);
    const newOwnerAddress = PublicKey.fromBase58(newOwner);
    const net = await initBlockchain(chain);
    if (DEBUG) console.log("network id", Mina.getNetworkId());
    const sender = PublicKey.fromBase58(owner);

    console.timeEnd("prepared data");

    const zkAppAddress = PublicKey.fromBase58(MINANFT_NAME_SERVICE_V2);
    const zkApp = new NameContractV2(zkAppAddress);
    const tokenId = zkApp.deriveTokenId();
    const nftApp = new NFTContractV2(address, tokenId);
    const fee = Number((await MinaNFT.fee()).toBigInt());

    if (DEBUG) console.log("sender", sender.toBase58());
    if (DEBUG) console.log("zkAppAddress", zkAppAddress.toBase58());
    if (DEBUG) console.log("address", address.toBase58());
    if (DEBUG) console.log("tokenId", tokenId.toJSON());
    await fetchMinaAccount({ publicKey: sender });
    await fetchMinaAccount({ publicKey: newOwnerAddress });
    await fetchMinaAccount({ publicKey: zkAppAddress });
    await fetchMinaAccount({ publicKey: address, tokenId });
    if (!Mina.hasAccount(sender)) {
      console.error("Account not found", sender.toBase58());
      await showText(
        `Account ${sender.toBase58()} not found. Please fund your account or try again later, after all the previous transactions are included in the block.`,
        "red"
      );
      await showPending(undefined);
      return {
        success: false,
        error: "Account not found",
      };
    }
    if (!Mina.hasAccount(newOwnerAddress)) {
      console.error("Account not found", newOwnerAddress.toBase58());
      await showText(
        `Account ${newOwnerAddress.toBase58()} not found. As a security measure, the recipient must have an account on the Mina blockchain. Please ask the recipient to create an account and send at least 1 MINA Account Creation fee to it and try again later, after all the previous transactions are included in the block.`,
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

    const nftOwner = nftApp.owner.get();
    const name = Encoding.stringFromFields([nftApp.name.get()]);
    const memo = ("transfer NFT @" + name).substring(0, 30);
    if (DEBUG) console.log("memo", memo);

    if (nftOwner === undefined) {
      console.error("NFT Account not found");
      await showText(
        `NFT account ${address.toBase58()} not found, cannot check the owner data. Please check your internet connection and try again later, after all the previous transactions are included in the block.`,
        "red"
      );
      await showPending(undefined);
      return {
        success: false,
        error: "Account not found",
      };
    }
    if (nftOwner.toBase58() !== sender.toBase58()) {
      console.error("NFT owner does not match the sender");
      await showText(
        `NFT owner address ${nftOwner.toBase58()} does not match your address ${sender.toBase58()}. Please try again later, after all the previous transactions are included in the block.`,
        "red"
      );
      await showPending(undefined);
      return {
        success: false,
        error: "Owner does not match the sender",
      };
    }
    const blockberryNoncePromise = changeNonce
      ? getNonce(sender.toBase58())
      : undefined;
    const requiredBalance = 1 + fee / 1_000_000_000;
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
  const nft = new NFTContractV2({ address, tokenId });
  const nftOwner = nft.owner.get();
  if(DEBUG) console.log("nftOwner", nftOwner);
  await sleep(5000);
  if(DEBUG) console.log("x", nftOwner.x);
  if(DEBUG) console.log("x1", nftOwner.x.toJSON());
  //if(DEBUG) console.log("NFT owner", nftOwner.toBase58());
  */
    console.time("prepared tx");

    const transferParams = new TransferParams({
      address,
      newOwner: newOwnerAddress,
    });

    const senderNonce = Number(Mina.getAccount(sender).nonce.toBigint());
    const blockberryNonce = changeNonce ? await blockberryNoncePromise : -1;
    const nonce = Math.max(senderNonce, blockberryNonce + 1);
    if (nonce > senderNonce)
      log.info(
        `Nonce changed from ${senderNonce} to ${nonce} for ${sender.toBase58()} for NFT ${name}`
      );

    const tx = await Mina.transaction(
      { sender, fee, memo, nonce },
      async () => {
        await zkApp.transferNFT(transferParams);
      }
    );

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

    const jobId = await sendTransferTransaction({
      name,
      serializedTransaction,
      signedData,
      transferParams: serializeFields(TransferParams.toFields(transferParams)),
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
  } catch (error) {
    log.error("catch in transfer NFT", { error, params });
    console.error("transfer NFT error", error);
    return {
      success: false,
      error: error?.message ?? "Error while transferring NFT",
    };
  }
}
