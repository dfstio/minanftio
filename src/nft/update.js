import { serializeTransaction } from "./transaction";
import { sendUpdateTransaction } from "./send";
import { chainId } from "../blockchain/explorer";
import { getNonce } from "./nonce";
import logger from "../serverless/logger";
import { NFTContractV2 } from "minanft";
const changeNonce = process.env.REACT_APP_CHAIN_ID === "mina:mainnet";
const log = logger.info.child({
  winstonModule: "UpdateButton",
  winstonComponent: "update function",
});

const DEBUG = "true" === process.env.REACT_APP_DEBUG;

export async function updateNFT(params) {
  console.time("ready to sign");
  if (DEBUG) console.log("Update NFT", params);

  try {
    const {
      keys,
      uri,
      owner,
      name,
      showText,
      showPending,
      libraries,
      updateCode,
      developer,
      repo,
      pinataJWT,
    } = params;

    const chain = chainId();

    if (owner === undefined) {
      console.error("Owner address is undefined");
      return {
        success: false,
        error: "Owner address is undefined",
      };
    }
    if (DEBUG) console.log("Owner", owner);

    if (name === undefined || name === "") {
      console.error("NFT name is undefined");
      return {
        success: false,
        error: "NFT name is undefined",
      };
    }

    if (uri === undefined || uri === "") {
      console.error("NFT json is undefined");
      return {
        success: false,
        error: "NFT json is undefined",
      };
    }

    if (keys === undefined || keys.length === 0) {
      console.error("No keys to add");
      return {
        success: false,
        error: "No keys to add",
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

    const { PublicKey, UInt64, Mina } = lib.o1js;
    const {
      MinaNFT,
      NameContractV2,
      RollupNFT,
      UpdateParams,
      NFTparams,
      MetadataParams,
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

    if (pinataJWT === undefined) {
      console.error("Pinata JWT is undefined");
      return {
        success: false,
        error: "Pinata JWT is undefined",
      };
    }

    console.time("prepared data");
    if (DEBUG) console.log("contractAddress", contractAddress);

    const address = PublicKey.fromBase58(params.address);
    const net = await initBlockchain(chain);
    if (DEBUG) console.log("network id", Mina.getNetworkId());
    const sender = PublicKey.fromBase58(owner);

    console.timeEnd("prepared data");

    const zkAppAddress = PublicKey.fromBase58(MINANFT_NAME_SERVICE_V2);
    const zkApp = new NameContractV2(zkAppAddress);
    const tokenId = zkApp.deriveTokenId();
    const nftApp = new NFTContractV2(address, tokenId);
    const fee = Number((await MinaNFT.fee()).toBigInt());
    const memo = ("update NFT @" + name).substring(0, 30);
    if (DEBUG) console.log("memo", memo);
    if (DEBUG) console.log("sender", sender.toBase58());
    if (DEBUG) console.log("zkAppAddress", zkAppAddress.toBase58());
    if (DEBUG) console.log("address", address.toBase58());
    if (DEBUG) console.log("tokenId", tokenId.toJSON());
    await fetchMinaAccount({ publicKey: sender });
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
    const nft = new RollupNFT({
      name,
      address,
      external_url: net.network.explorerAccountUrl + address.toBase58(),
    });
    await nft.loadMetadata(JSON.stringify(uri));
    const initialMetadata = nft.metadataRoot;
    const stateInitialMetadata = nftApp.metadataParams.get().metadata;
    const nftData = nftApp.data.get();
    const nftParams = NFTparams.unpack(nftData);
    const version = Number(nftParams.version.toBigint()) + 1;

    if (
      initialMetadata.data.toJSON() !== stateInitialMetadata.data.toJSON() ||
      initialMetadata.kind.toJSON() !== stateInitialMetadata.kind.toJSON()
    ) {
      console.error("Metadata mismatch");
      await showText(
        `NFT metadata on the blockchain state does not match the metadata from the json file. Please try again later, after all the previous transactions are included in the block and make sure that you use right json file.`,
        "red"
      );
      await showPending(undefined);
      return {
        success: false,
        error:
          "NFT metadata on the blockchain state does not match the metadata from the json file",
      };
    }
    for (const item of keys) {
      const { key, value, isPrivate } = item;
      nft.update({ key, value, isPrivate });
    }
    const commitPromise = nft.prepareCommitData({ pinataJWT });

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

    console.time("prepared tx");

    /*
      export class MetadataParams extends Struct({
          metadata: Metadata,
          storage: Storage,
        }) {}

        export class UpdateParams extends Struct({
          address: PublicKey,
          metadataParams: MetadataParams,
        }) {}
    */

    const senderNonce = Number(Mina.getAccount(sender).nonce.toBigint());
    const blockberryNonce = changeNonce ? await blockberryNoncePromise : -1;
    const nonce = Math.max(senderNonce, blockberryNonce + 1);
    if (nonce > senderNonce)
      log.info(
        `Nonce changed from ${senderNonce} to ${nonce} for ${sender.toBase58()} for NFT ${name}`
      );

    await commitPromise;

    if (nft.storage === undefined) throw new Error("Storage is undefined");
    if (nft.metadataRoot === undefined)
      throw new Error("Metadata is undefined");
    const json = JSON.stringify(
      nft.toJSON({
        includePrivateData: true,
      }),
      null,
      2
    );

    const updateParams = new UpdateParams({
      address,
      metadataParams: {
        metadata: nft.metadataRoot,
        storage: nft.storage,
      },
    });
    const tx = await Mina.transaction(
      { sender, fee, memo, nonce },
      async () => {
        await zkApp.update(updateParams);
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

    const jobId = await sendUpdateTransaction({
      name,
      serializedTransaction,
      signedData,
      updateParams: serializeFields(UpdateParams.toFields(updateParams)),
      contractAddress,
      chain,
      updateCode,
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
      json,
      version,
    };
  } catch (error) {
    log.error("catch in update NFT", { error, params });
    console.error("update NFT error", error);
    return {
      success: false,
      error: error?.message ?? "Error while updating  NFT",
    };
  }
}
