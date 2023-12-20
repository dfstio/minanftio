import { PrivateKey, Poseidon, PublicKey } from "o1js";
import {
  MinaNFT,
  MapData,
  MinaNFTNameService,
  accountBalanceMina,
  makeString,
  api,
} from "minanft";

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
    nft.update({ key: token.public_key1, value: token.public_value1 ?? "" });

  if (token.public_key2 !== undefined && token.public_key2 !== "")
    nft.update({ key: token.public_key2, value: token.public_value2 ?? "" });

  if (token.private_key1 !== undefined && token.private_key1 !== "")
    nft.update({
      key: token.private_key1,
      value: token.private_value1 ?? "",
      isPrivate: true,
    });

  if (token.private_key2 !== undefined && token.private_key2 !== "")
    nft.update({
      key: token.private_key2,
      value: token.private_value2 ?? "",
      isPrivate: true,
    });

  /*
  nft.update({ key: `twitter`, value: `@builder` });
  nft.update({ key: `secret`, value: `mysecretvalue`, isPrivate: true });
  if (includeFiles)
    await nft.updateImage({
      filename: "./images/image.jpg",
      pinataJWT,
    });

    await nft.updateFile({
      key: "sea",
      filename: "./images/sea.png",
      pinataJWT,
    });

  const map = new MapData();
  map.update({ key: `level2-1`, value: `value21` });
  map.update({ key: `level2-2`, value: `value22` });
  map.updateText({
    key: `level2-3`,
    text: `This is text on level 2. Can be very long`,
  });
  
    await map.updateFile({
      key: "woman",
      filename: "./images/woman.png",
      pinataJWT,
    });
    
  const mapLevel3 = new MapData();
  mapLevel3.update({ key: `level3-1`, value: `value31` });
  mapLevel3.update({ key: `level3-2`, value: `value32`, isPrivate: true });
  mapLevel3.update({ key: `level3-3`, value: `value33` });
  map.updateMap({ key: `level2-4`, map: mapLevel3 });
  nft.updateMap({ key: `level 2 and 3 data`, map });
  */

  const data = nft.exportToString({
    increaseVersion: false,
    includePrivateData: true,
  });
  console.log("data", data);
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

  const uri = nft.exportToString({
    increaseVersion: true,
    includePrivateData: false,
  });

  const result = await minanft.mint({
    uri,
    signature: reserved.signature,
    privateKey: nftPrivateKey.toBase58(),
  });

  console.log("mint result", result);

  const jobId = result.jobId;
  if (jobId === undefined) {
    console.error("JobId is undefined");
    return;
  }

  const txData = await minanft.waitForProofResult({ jobId });
  console.log("txData", txData);
}
