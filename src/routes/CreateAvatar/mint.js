import { PrivateKey, Poseidon, PublicKey } from "o1js";
import {
  MinaNFT,
  MapData,
  MinaNFTNameService,
  accountBalanceMina,
  makeString,
  api,
} from "minanft";
import { getFileData } from "../../blockchain/file";

const { REACT_APP_PINATA_JWT, REACT_APP_JWT } = process.env;

export async function mintNFT(address, auth, token) {
  if (address === undefined || address === "") {
    console.error("Address is undefined");
    return;
  }
  if (token === undefined || token.name === undefined || token.name === "") {
    console.error("Token name is undefined");
    return;
  }
  const JWT = auth === undefined || auth === "" ? REACT_APP_JWT : auth;
  const blockchainInstance = "testworld2";
  const includeFiles = false;
  const pinataJWT = REACT_APP_PINATA_JWT;
  MinaNFT.minaInit(blockchainInstance);

  const name = token.name;
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
    reserved.signature === ""
  ) {
    console.error("Name is not reserved");
    return {
      success: false,
      error: "Name is not reserved",
      reason: reserved.reason,
    };
  }

  const nft = new MinaNFT({ name, owner });

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
      text: token.description,
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

  const imageData = await getFileData(token.main.image, pinataJWT);
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
      pinataJWT,
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
          token.calculateroot === true
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

  const data = nft.exportToString({
    increaseVersion: false,
    includePrivateData: true,
  });
  console.log("data", data);

  const uri = nft.exportToString({
    increaseVersion: true,
    includePrivateData: false,
  });

  const result = await minanft.mint({
    uri,
    signature: reserved.signature,
    privateKey: nftPrivateKey.toBase58(),
  });

  console.log("mint job result", result);

  const jobId = result.jobId;
  if (jobId === undefined) {
    console.error("JobId is undefined");
    return {
      success: false,
      error: "JobId is undefined",
      reason: result.error,
    };
  }

  const json = nft.exportToString({
    increaseVersion: true,
    includePrivateData: true,
  });

  return {
    success: true,
    jobId,
    json,
  };
}

export async function waitForMint(jobId, auth) {
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
  console.log("txData", txData);
  if (txData?.result?.result === undefined || txData.result?.result === "") {
    console.error("txData is undefined");
    return {
      success: false,
      error: "Mint error",
      reason: txData.error,
    };
  }

  return {
    success: true,
    hash: txData.result.result,
  };
}
