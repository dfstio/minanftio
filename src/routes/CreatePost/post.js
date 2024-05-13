import { PrivateKey, Poseidon, PublicKey, Field } from "o1js";
import {
  MinaNFT,
  MapData,
  MinaNFTNameService,
  accountBalanceMina,
  makeString,
  api,
  MINANFT_NAME_SERVICE,
} from "minanft";
import { getFileData, getJSON } from "../../blockchain/file";
import { minaInit } from "../../blockchain/init";
import { decrypt } from "../../blockchain/decrypt";

const { REACT_APP_PINATA_JWT, REACT_APP_JWT } = process.env;
const arconfig = await decrypt();

export async function post(address, auth, token) {
  console.log("token", token);
  if (address === undefined || address === "") {
    console.error("Address is undefined");
    return undefined;
  }
  if (token === undefined || token.name === undefined || token.name === "") {
    console.error("Token name is undefined");
    return undefined;
  }

  if (token.json === undefined || token.json === "") {
    console.error("Token json is undefined");
    return undefined;
  }

  const jsonData = await getJSON(token.json);
  if (jsonData === undefined) {
    console.error("Cannot get json data");
    return undefined;
  }
  if (jsonData.address === undefined || jsonData.address === "") {
    console.error("Json address is undefined");
    return undefined;
  }
  console.log("jsonData", jsonData);

  const JWT = auth === undefined || auth === "" ? REACT_APP_JWT : auth;
  const pinataJWT = REACT_APP_PINATA_JWT;
  const arweaveKey = arconfig;
  await minaInit();

  const name = token.name;
  if (name === undefined || name === "") {
    console.error("Name is undefined");
    return undefined;
  }
  const ownerPublicKey = PublicKey.fromBase58(address);
  const owner = Poseidon.hash(ownerPublicKey.toFields());
  if (Field.fromJSON(jsonData.owner).toJSON() !== owner.toJSON()) {
    console.error("Json owner address is not equal to owner address");
    return undefined;
  }
  const nftPublicKey = PublicKey.fromBase58(jsonData.address);
  const nameServiceAddress = PublicKey.fromBase58(MINANFT_NAME_SERVICE);

  const mintedNFT = new MinaNFT({
    name: jsonData.name,
    address: nftPublicKey,
    nameService: nameServiceAddress,
  });

  await mintedNFT.loadMetadata(JSON.stringify(jsonData));
  const loadedJson = mintedNFT.toJSON();
  console.log(`json:`, JSON.stringify(loadedJson, null, 2));

  const checkNft = await mintedNFT.checkState();
  if (checkNft === false) {
    console.error("NFT checkState error");
    return;
  }

  const nft = new MapData();
  nft.update({ key: "name", value: name });
  nft.update({ key: "post", value: "true" });
  nft.update({ key: "time", value: Date.now().toString() });

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

  if (
    token.main !== undefined &&
    token.main.image !== undefined &&
    token.main.image !== ""
  ) {
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
    nft.updateFileData({ key: `image`, type: "image", fileData: imageData });
  }

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
      fileData: fileData,
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

  console.log("post: ", name, nft.toJSON());

  mintedNFT.updateMap({ key: name, map: nft });
  const commitData = await mintedNFT.prepareCommitData({
    ownerPublicKey,
    pinataJWT: token.storagetype === "Arweave" ? undefined : pinataJWT,
    arweaveKey,
    nameServiceAddress,
  });

  const json = mintedNFT.toJSON({
    increaseVersion: true,
    includePrivateData: true,
  });

  const version = mintedNFT.version.add(1).toJSON();

  return {
    success: true,
    commitData,
    json,
    version,
  };
}

export async function commit(commitData, address, nftName, postName, auth) {
  console.log("commit", address, nftName, postName, auth);
  const JWT = auth === undefined || auth === "" ? REACT_APP_JWT : auth;
  if (address === undefined || address === "") {
    console.error("Address is undefined");
    return undefined;
  }
  if (commitData === undefined || commitData === "") {
    console.error("Commit data is undefined");
    return undefined;
  }
  const minanft = new api(JWT);
  const result = await minanft.post({
    commitData,
    ownerPublicKey: address,
    nftName,
    postName,
  });

  console.log("post job result", result);

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

export async function waitForPost(jobId, auth) {
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
