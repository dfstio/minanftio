import { RollupNFT, Metadata, Storage, serializeFields } from "minanft";
import { getFileData } from "../../blockchain/file";
import { minaInit } from "../../blockchain/init";
import { payment } from "../../blockchain/payment";
import { decrypt } from "../../blockchain/decrypt";
import { createRollupNFT } from "../../blockchain/zeko";
import { nftPrice } from "../../nft/pricing";

const { REACT_APP_PINATA_JWT, REACT_APP_JWT } = process.env;

export async function mintRollupNFT(address, auth, token, calculateRoot) {
  console.log("mintRollupNFT", token);
  if (address === undefined || address === "") {
    console.error("Address is undefined");
    return;
  }
  if (token === undefined || token.name === undefined || token.name === "") {
    console.error("Token name is undefined");
    return;
  }
  const JWT = auth === undefined || auth === "" ? REACT_APP_JWT : auth;
  //const includeFiles = false;
  const pinataJWT = REACT_APP_PINATA_JWT;
  const arconfig = ""; //await decrypt();
  //console.log("arconfig", arconfig);
  const arweaveKey = arconfig;
  await minaInit();

  const name = token.name;
  /*
  const ownerPublicKey = PublicKey.fromBase58(address);
  const nftPrivateKey = PrivateKey.random();
  const nftPublicKey = nftPrivateKey.toPublicKey();
  const owner = Poseidon.hash(ownerPublicKey.toFields());

  
  const minanft = new api(JWT);
  const reserved = await minanft.reserveName({
    name,
    publicKey: nftPublicKey.toBase58(),
  });
  console.log("Reserved:", reserved);
  if (
    reserved === undefined ||
    reserved.isReserved !== true ||
    reserved.signature === undefined ||
    reserved.signature === "" ||
    reserved.price === undefined ||
    reserved.price.price === undefined
  ) {
    console.error("Name is not reserved");
    return {
      success: false,
      error: "Name is not reserved",
      reason: reserved.reason,
    };
  }
  */
  const price = nftPrice(name)?.price ?? 10;
  const paymentResult = await payment({
    to: process.env.REACT_APP_ADDRESS,
    amount: price,
    memo: "Rollup NFT " + name,
    chain: "zeko",
  });
  if (paymentResult === undefined || paymentResult.hash === undefined) {
    console.error("Payment failed", paymentResult);
    /*
    return {
      success: false,
      error: "Payment failed",
      reason: paymentResult?.message ?? paymentResult?.code ?? "",
    };
    */
  } else console.log("Payment hash", paymentResult.hash);

  const nft = new RollupNFT({ name, address });

  if (token.description !== undefined && token.description !== "") {
    nft.updateText({
      key: `description`,
      text: token.description,
    });
  }

  if (
    token.unlockable_description !== undefined &&
    token.unlockable_description !== ""
  ) {
    nft.updateText({
      key: `privatedescription`,
      text: token.unlockable_description,
      isPrivate: true,
    });
  }

  if (token.public_key1 !== undefined && token.public_key1 !== "")
    nft.update({
      key: token.public_key1.substring(0, 30),
      value: token.public_value1?.substring(0, 30) ?? "",
    });

  if (token.public_key2 !== undefined && token.public_key2 !== "")
    nft.update({
      key: token.public_key2.substring(0, 30),
      value: token.public_value2?.substring(0, 30) ?? "",
    });

  if (token.private_key1 !== undefined && token.private_key1 !== "")
    nft.update({
      key: token.private_key1.substring(0, 30),
      value: token.private_value1?.substring(0, 30) ?? "",
      isPrivate: true,
    });

  if (token.private_key2 !== undefined && token.private_key2 !== "")
    nft.update({
      key: token.private_key2.substring(0, 30),
      value: token.private_value2?.substring(0, 30) ?? "",
      isPrivate: true,
    });

  if (token.category !== undefined && token.category !== "")
    nft.update({
      key: "category",
      value: token.category?.substring(0, 30) ?? "",
    });

  const imageData = await getFileData(
    token.main.image,
    token.storagetype,
    pinataJWT,
    arweaveKey
  );
  if (imageData === undefined) {
    console.error("getFileData error: imageData is undefined");
    return {
      success: false,
      error: "Cannot get image data",
    };
  }
  console.log("imageData", imageData);
  nft.updateFileData({ key: `image`, type: "image", data: imageData });

  async function addFile(file, isPrivate = false, calculateRoot = false) {
    const fileData = await getFileData(
      file,
      token.storagetype,
      pinataJWT,
      arweaveKey,
      isPrivate,
      calculateRoot
    );
    if (fileData === undefined) {
      console.error("getFileData error: fileData is undefined");
      throw new Error("Cannot get file data");
    }
    console.log("fileData", fileData);
    nft.updateFileData({
      key: file.name.substring(0, 30),
      type: "file",
      data: fileData,
      isPrivate: isPrivate ?? false,
    });
  }

  try {
    if (token.main.video !== undefined && token.main.video !== "")
      await addFile(token.main.video);

    let length = token.main.media.length;
    if (length > 0) {
      let i;
      for (i = 0; i < length; i++) {
        await addFile(token.main.media[i].originFileObj);
      }
    }

    length = token.main.attachments.length;
    if (length > 0) {
      let i;
      for (i = 0; i < length; i++) {
        await addFile(token.main.attachments[i].originFileObj);
      }
    }

    length = token.unlockable.media.length;
    if (length > 0) {
      let i;
      for (i = 0; i < length; i++) {
        await addFile(token.unlockable.media[i].originFileObj, true);
      }
    }

    length = token.unlockable.attachments.length;
    if (length > 0) {
      let i;
      for (i = 0; i < length; i++) {
        await addFile(
          token.unlockable.attachments[i].originFileObj,
          true,
          calculateRoot
        );
      }
    }
  } catch (error) {
    console.error("Error while adding files to IPFS", error);
    return {
      success: false,
      error: "Error while adding files to IPFS",
      reason: error.toString(),
    };
  }

  await nft.prepareCommitData({ pinataJWT });

  if (nft.storage === undefined) throw new Error("Storage is undefined");
  if (nft.metadataRoot === undefined) throw new Error("Metadata is undefined");
  const json = JSON.stringify(
    nft.toJSON({
      includePrivateData: true,
    }),
    null,
    2
  );
  console.log("json", json);

  /*
type TransactionType = "add" | "extend" | "update" | "remove";
interface Transaction {
  operation: TransactionType;
  name: string;
  address: string;
  expiry: number;
  metadata?: string;
  storage?: string;
  oldDomain?: string;
  signature?: string;
}
*/

  const transaction = {
    operation: "add",
    name: token.name,
    address,
    expiry: Date.now() + 1000 * 60 * 60 * 24 * 365, // one year
    metadata: serializeFields(Metadata.toFields(nft.metadataRoot)),
    storage: serializeFields(Storage.toFields(nft.storage)),
  };
  const url = `https://minanft.io/nft/i${nft.storage.toIpfsHash()}`;
  console.log("transaction", transaction);
  const contractAddress =
    "B62qo2gLfhzbKpSQw3G7yQaajEJEmxovqm5MBRb774PdJUw6a7XnNFT"; //TODO: get contract address
  const result = await createRollupNFT({
    transaction,
    contractAddress,
  });
  console.log("createRollupNFT result", result);

  if (result?.toLowerCase()?.startsWith("error")) {
    console.error("createRollupNFT error", result);
    return {
      success: false,
      error: "createRollupNFT error",
      reason: result,
    };
  }

  try {
    const { success, txId, error } = JSON.parse(result);
    if (success !== true) {
      console.error("createRollupNFT error", error);
      return {
        success: false,
        error: "createRollupNFT error",
        reason: error,
      };
    }

    if (txId === undefined || txId[0] === undefined) {
      console.error("txId is undefined");
      return {
        success: false,
        error: "txId is undefined",
      };
    }
    return {
      success: true,
      hash: txId[0],
      url,
      json,
    };
  } catch (e) {
    console.error("createRollupNFT error", e);
    return {
      success: false,
      error: "createRollupNFT error",
      reason: e.toString(),
    };
  }
}
