import { calculateSHA512 } from "./sha512";
import { pinFile } from "./ipfs";
import { serializeTransaction } from "./transaction";
import { sendMintTransaction } from "./send";
import { chainId } from "../blockchain/explorer";
import { reserveName } from "./name";
import { getNonce } from "./nonce";
import logger from "../serverless/logger";
const changeNonce = true; // process.env.REACT_APP_CHAIN_ID === "mina:mainnet";
const log = logger.info.child({
  winstonModule: "Mint",
  winstonComponent: "mint function",
});
const { REACT_APP_CONTRACT_ADDRESS } = process.env;
const DEBUG = "true" === process.env.REACT_APP_DEBUG;
const MOBILE_TEST = true;

/*
export interface ProofOfNFT {
  key: string;
  value: string;
  isPublic: boolean;
}
*/

export async function mintNFT(
  params
  /*: {
  name: string;
  image: File;
  collection: string;
  description: string;
  price: number;
  keys: ProofOfNFT[];
  developer: string;
  repo: string;
  owner: string;
  chain: blockchain;
  pinataJWT: string;
  jwt: string;
}*/
) {
  console.time("ready to sign");
  if (DEBUG) console.log("Mint NFT", params);
  try {
    const {
      name,
      image,
      price,
      collection,
      description,
      keys,
      developer,
      repo,
      owner,
      jwt,
      pinataJWT,
      showText,
      showPending,
      libraries,
    } = params;

    const chain = chainId();

    if (chain === undefined) {
      console.error("Chain is undefined");
      return {
        success: false,
        error: "Chain is undefined",
      };
    }

    if (REACT_APP_CONTRACT_ADDRESS === undefined) {
      console.error("Contract address is undefined");
      return {
        success: false,
        error: "Contract address is undefined",
      };
    }

    if (owner === undefined) {
      console.error("Owner address is undefined");
      return {
        success: false,
        error: "Owner address is undefined",
      };
    }

    if (name === undefined || name === "") {
      console.error("NFT name is undefined");
      return {
        success: false,
        error: "NFT name is undefined",
      };
    }

    if (image === undefined) {
      console.error("Image is undefined");
      return {
        success: false,
        error: "Image is undefined",
      };
    }

    const arweaveKey = undefined;

    if (pinataJWT === undefined) {
      console.error("Pinata JWT is undefined");
      return {
        success: false,
        error: "Pinata JWT is undefined",
      };
    }
    const reservedPromise = reserveName({
      name,
      publicKey: owner,
      chain,
      contract: REACT_APP_CONTRACT_ADDRESS,
      version: "v2",
      developer: "DFST",
      repo: "web-mint-example",
    });

    const ipfsPromise = pinFile({
      file: image,
      keyvalues: {
        name,
        owner,
        contractAddress: REACT_APP_CONTRACT_ADDRESS,
        chain,
        developer,
        repo,
      },
    });

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

    const {
      Field,
      PrivateKey,
      PublicKey,
      UInt64,
      Mina,
      AccountUpdate,
      Signature,
      UInt32,
    } = lib.o1js;
    const {
      MinaNFT,
      NameContractV2,
      RollupNFT,
      FileData,
      initBlockchain,
      MINANFT_NAME_SERVICE_V2,
      VERIFICATION_KEY_V2_JSON,
      wallet,
      fetchMinaAccount,
      serializeFields,
      MintParams,
      accountBalanceMina,
    } = lib.minanft;
    const contractAddress = MINANFT_NAME_SERVICE_V2;
    if (contractAddress === undefined) {
      console.error("Contract address is undefined");
      return {
        success: false,
        error: "Contract address is undefined",
      };
    }

    if (contractAddress !== REACT_APP_CONTRACT_ADDRESS) {
      console.error("Wrong contract address");
      return {
        success: false,
        error: "Wrong contract address",
      };
    }
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

    await showPending("Reserving NFT name...");

    console.time("prepared data");

    if (DEBUG) console.log("contractAddress", contractAddress);

    const nftPrivateKey = PrivateKey.random();
    const address = nftPrivateKey.toPublicKey();
    const sender = PublicKey.fromBase58(owner);
    const net = await initBlockchain(chain);
    if (DEBUG) console.log("network id", Mina.getNetworkId());
    if (MOBILE_TEST) await showText("Calculated keys", "green");

    const balance = await accountBalanceMina(sender);

    const nft = new RollupNFT({
      name,
      address,
      external_url: net.network.explorerAccountUrl + address.toBase58(),
    });
    if (MOBILE_TEST) await showText("Created NFT", "green");

    console.timeEnd("prepared data");

    if (collection !== undefined && collection !== "")
      nft.update({ key: `collection`, value: collection });
    if (MOBILE_TEST) await showText("Updated NFT", "green");

    if (description !== undefined && description !== "")
      nft.updateText({
        key: `description`,
        text: description,
      });

    for (const item of keys) {
      const { key, value, isPrivate } = item;
      nft.update({ key, value, isPrivate });
    }
    if (MOBILE_TEST) await showText("Updated NFT 2", "green");

    console.time("calculated sha3_512");
    const sha3_512 = await calculateSHA512(image);
    if (MOBILE_TEST) await showText("Updated NFT 3", "green");
    console.timeEnd("calculated sha3_512");
    if (DEBUG) console.log("image sha3_512", sha3_512);

    console.time("reserved name");
    const reserved = await reservedPromise;
    if (MOBILE_TEST) await showText("Updated NFT 4", "green");
    console.timeEnd("reserved name");

    if (DEBUG) console.log("Reserved", reserved);
    if (
      reserved === undefined ||
      reserved.isReserved !== true ||
      reserved.signature === undefined ||
      reserved.signature === "" ||
      reserved.expiry === undefined ||
      reserved.price === undefined ||
      reserved.price?.price === undefined
    ) {
      console.error("Name is not reserved");
      await showText(
        `NFT name @${name} is not reserved${
          reserved.reason ? ": " + reserved.reason : ""
        }`,
        "red"
      );
      await showPending(undefined);
      return {
        success: false,
        error: "Name is not reserved",
        reason: reserved.reason,
      };
    }

    await showText(`NFT name @${name} is reserved`, "green");
    const fee = Number((await MinaNFT.fee()).toBigInt());
    const blockberryNoncePromise = changeNonce
      ? getNonce(sender.toBase58())
      : undefined;
    const requiredBalance =
      Number(reserved.price.price) + 1 + fee / 1_000_000_000;
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

    await showPending("Uploading the image to IPFS...");

    const signature = Signature.fromBase58(reserved.signature);
    const expiry = UInt32.from(reserved.expiry);
    if (signature === undefined) {
      console.error("Signature is undefined");
      return {
        success: false,
        error: "Signature is undefined",
      };
    }

    console.time("uploaded image");
    const ipfs = await ipfsPromise;
    console.timeEnd("uploaded image");
    await showText(`Image is uploaded to the IPFS`, "green");
    await showPending(
      "Getting the NFT contract data from the Mina blockchain..."
    );
    if (DEBUG) console.log("image ipfs", ipfs);

    const imageData = new FileData({
      fileRoot: Field(0),
      height: 0,
      filename: image.name.substring(0, 30),
      size: image.size,
      mimeType: image.type.substring(0, 30),
      sha3_512,
      storage: `i:${ipfs}`,
    });

    nft.updateFileData({ key: `image`, type: "image", data: imageData });

    const commitPromise = nft.prepareCommitData({ pinataJWT });

    const zkAppAddress = PublicKey.fromBase58(MINANFT_NAME_SERVICE_V2);
    const zkApp = new NameContractV2(zkAppAddress);

    const memo = ("mint NFT @" + name).substring(0, 30);
    await fetchMinaAccount({ publicKey: sender });
    await fetchMinaAccount({ publicKey: zkAppAddress });
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

    await showText(
      "Successfully fetched the NFT contract state from the Mina blockchain",
      "green"
    );

    await showPending("Preparing mint transaction...");
    console.time("prepared commit data");
    await commitPromise;
    console.timeEnd("prepared commit data");

    console.time("prepared tx");

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
    if (DEBUG) console.log("json", json);
    const verificationKey = {
      hash: Field.fromJSON(VERIFICATION_KEY_V2_JSON[chain].hash),
      data: VERIFICATION_KEY_V2_JSON[chain].data,
    };
    /*
export class MintParams extends Struct({
  name: Field,
  address: PublicKey,
  owner: PublicKey,
  price: UInt64,
  fee: UInt64,
  feeMaster: PublicKey,
  metadataParams: MetadataParams,
  verificationKey: VerificationKey,
  signature: Signature,
  expiry: UInt32,
}) {}
  */
    const mintParams = {
      name: MinaNFT.stringToField(nft.name),
      address,
      owner: sender,
      price: UInt64.from(parseInt(price * 1e9)),
      fee: UInt64.from(reserved.price.price * 1_000_000_000),
      feeMaster: wallet,
      verificationKey,
      signature,
      metadataParams: {
        metadata: nft.metadataRoot,
        storage: nft.storage,
      },
      expiry,
    };

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
        //AccountUpdate.fundNewAccount(sender);
        await zkApp.mint(mintParams);
      }
    );

    tx.sign([nftPrivateKey]);
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
    await showText("Mint transaction is prepared", "green");
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
    const jobId = await sendMintTransaction({
      name,
      serializedTransaction,
      signedData,
      mintParams: serializeFields(MintParams.toFields(mintParams)),
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
      json,
    };
  } catch (error) {
    console.error("Error in mintNFT", error);
    log.error("catch in mintNFT", { error, params });
    return {
      success: false,
      error: error?.message ?? "Error while minting NFT",
    };
  }
}
