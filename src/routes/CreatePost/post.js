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

const { REACT_APP_PINATA_JWT, REACT_APP_JWT } = process.env;
const arconfig =
  '{"kty":"RSA","n":"rPaaxZ2wFeYOI26LncgwhN5E1PoHZ1AArWqU8T7UUUBwEfL6820E5huygCaV8JxC8L7DtyV2RLDyE37Ps55N3Rf1jw82iWlY63aQaBfN38_YhzR2O2OMmyz0suqeEids5Y-CLfGq6i63SYEwwVo0L3luANxjIvw2eHr61YVDImN4-gdbP56ZhZqHio2cPa9DJ-_KWtux3Mu1BepFeA33VMXYjFJroEZh67LrfGhKbrxnPVS0RW89JOksCpcEaJtqYdCuatEZFjbiCrH2mQCuU0v3h3pRMfAy6GgUjcVFtVID4W3vtZj6_pgMQC7NczmLsM3A_pSbfuukXeBaBfucNvfxX9wfA5WXrPedJicmPfVzryP3ICTuooh6HCjs1Y7tRvLtcMeiVADK4dDHXAO1m-zA3VoUbQdiDvbma2hg7pjiJ4q-GDiHIqDjn1TrhQOUIJK88e0Tc9Fpp_W1YEWeyvOWTEb8lXwNwuxtypCl08Q62GkDZd3GCpxr4sREz0rKzC2kMPe8QODEHQuxMZML5rKRQBECL27R_TWgMvOkGLQeD8VbqlNh-VUd0inF7lutYT4_rzXNrIAEMPDzlBfIPFKyqvAg4oKk9_nL1Z8853Mp7lGepLMm04y2A6per_ZM8CkVFwaKkHQvXKRtzjFiP1qWyOCPR_IGwArCPc2Y5J0","e":"AQAB","d":"IhS3e3_uTepWV9n07cKf-NZZJsQbiFplv8X0EjMon9f8HTVNCIEvSW4ktoaj3dTUhd547xIVI0TgdkHzCDgFrK6HZsh_HQVijYb_vlsOaG7qgf2u3FXpwzvQ_Z4oRnh5RySHaKkpXdqVqAiqRDcTeFVLfSTv7dlXnFbTLRaEm3aRRGcFrlwAcSh5U65Cno71wx1HOK74dYK4KTG3vYe29__CAyhMZ7jmm4xWRV3BaN970kRp_xKDsE23rWCDcF9LT3nQnGCWOl_XG3dkmVJehzA9VnceH6JuTYgQoLzB1xARjq5cYOKDdn4cT9tJBU7N_SkVwbQjjZc9_Hd0FaC173XexzltfPVkIGpvJ352fsDj4JiiF50lqZhALPvxXxD8dYAR5xRRora5bhMnyvLbWlip7vdSLuGutQgijpnlNS6xQvlAhElcD9zpgyLAkVMiF5_tVU9EhQEDA_AHI3xC6zetAmbD7Y8wbm-qF7VzcOU5rkc5xg65tMl9rDtlEron9MU_vkw8YuoZ4GKEWmbsfqAaFHObBvJfkw--UoFsRACb6A1YOCG-bpCpnbvB3D3WtRUFOu1JobKZPBSdEjTtr5d9mpDjj2uzGISmgJ-tV4TQgMio2FDuyox-mXXnORgJzbaF1OXHh-8WwANHsR6Wp-DXYMsVQYNjOuIpgB7VQ5E","p":"2vRySxpYPS2yFp1wOZQnqbhlKUEknqpMpHmvZ_bdCR8lQGN99rhLDcDxjhmhW-O3gvIOvf-Xeif90_j01VN0ZGXcWElxJ6ueGe3uVHTRzwZAsCFfJANcFKpkjBldmaMFMHG-8YTxJDrpbx0MiUdGEbzBuQhWABENJ_-jwU-Zq6puBf-7a2pHxNtNEhWtLM_0NNId5hQNxF4aaN9vKqqRam5WV5vw7V6LClYQupAS8lUzFkdJXlB_2V2t-c_khfDUKeNQ8z4ZuKCU_0PU-VLQX2hmqzOT85V9X9ThG5zUGh1cl_iDnSIOpRMLMH0TQNYVs-LzJTbpWSeKDc3pcZ-V5Q","q":"yjoiJWh_FI3TdQ38Sq9pqK9LrJHq2Ppd14RXJJwvzim_388zkUYydEKXFuZEBkQx05gekMxnA7bix9ft7VN0jp4PnXoVa3eRykPyUT5J561zDMPFrpxfluwRKs4G07QE6RJpUVZe2NHqVApyucO1qNi3Bwwxw_XD82NH-w1GDSMlBv3djmhzZRrFC0k1aghVe0O3fWtPe0fRaF2POehr8VyHYKPFxP_3IwTs3yz50WII1SDt8c3wRZKVrrVoQxJxZ2arKwtHcN4ISbLoF53r78PCFrCrMXm8e3_UJx9epSpv3etu5LJJ32R_AiKo1aaHkYZvTQXADNa4g0umS8ooWQ","dp":"cl-inGykj0CheILBLrKfjV6PKV-n-2HGK1yNLeecSrmEQgA2unxGaGbTR4FH8rIfGD3NSZ6Lx_m_88xmSFERyagT0-J5Q1m4ep75EhD70ALaI6crBarjnL_tSemuJSUs_sNMFOl29Y_4hFxOQh-DEJzjLP6Xve0qTCyTo9Uq1qtuUZ_mjRO1bbWIqtu73F68mCLyD0-GaX8mmIWukkELOOduHtGMptHuG3YdwvajjwbGaurN_oBaaHcw-_-GxhipG0Bs9sMHuJPZgQYz6BFEW7Izf1awAFukZDzVYhEoEoQn7BKa3af-smgiPi_3sLSkHZV9oYDvn-yxhsh7GylbqQ","dq":"I8gdepj-w1hE7hVHar-W5m396c73yuSh7hxQfv3Tx5rDhIpZCX9uNfwCV97ucl1mo5Xq8pv4LkQR5GJkivWVThbRlH-hgp5pgWx8V7u5v_CExuFs_PRWRZIHh5dkxdi4dbT4RZgOuDaMS8p9ejkSz4lo-SpDM_UscshCWD2FA5YQWyhYJ3Z71IvkCZcuiFBpL6JPuTVfnuSaPOkxCoIBd3dzzLmtqKnRxLR-ZQ7ENTQvc-abs4lI1kaVjZAznoqI3k7gQoGAZowi00eAoY0jzgzJLtKbt-leXEvF8hYu3PKhUJbzzCtvvsM9ZddUIFmS60DqOKqnzJ3BkBm2lvpyIQ","qi":"g8Z8_ZltIPpUPIbIDB0G79XzXLcuNmJ-1mg1PtnLa3Dc7PFf4xiU9_TIoFjNSJAD-imqA6lzQXNuf2sGOihokYA2GcZBKXR1TjvPv_iNQ--H13a1bFVHk7yflocYb4uKkrwIaUrtIRWVjfYcteMpRWVn8byJXJzePlCiR7rrtlzrCF04HCXFiJ3PkryYGY2hCO5WxFtC3Ha2cYPPK4ATQvr3UNK6Qovgy5EjYQMfVEOouDNdFSiQOYia2vAzc2k-ZTyezg4upHfYqYV5zLuJTRDRPii9AQ6Dbm3GoGob4JiRmsm6r_BoZsdaTpXOgrieuUWKZQKEU3H4kgE8KvMoLw"}';

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
  const blockchainInstance = "testworld2";
  const pinataJWT = REACT_APP_PINATA_JWT;
  const arweaveKey = arconfig;
  MinaNFT.minaInit(blockchainInstance);

  const name = token.name;
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

  if (token.category !== undefined && token.category !== "")
    nft.update({
      key: "category",
      value: token.category?.substring(0, 30) ?? "",
    });

  if (token.type !== undefined && token.type !== "")
    nft.update({
      key: "type",
      value: token.type?.substring(0, 30) ?? "",
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

  mintedNFT.updateMap({ key: name, nft });
  const commitData = await mintedNFT.prepareCommitData({
    ownerPublicKey,
    pinataJWT: token.storagetype === "Arweave" ? undefined : pinataJWT,
    arweaveKey,
    nameServiceAddress,
  });

  const json = mintedNFT.exportToString({
    increaseVersion: true,
    includePrivateData: true,
  });

  return {
    success: true,
    commitData,
    json,
  };
}

export async function commit(commitData, address, nftName, postName, auth) {
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
