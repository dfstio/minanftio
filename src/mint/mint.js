import { calculateSHA512 } from "./sha512";
import { pinFile } from "./ipfs";
import { serializeTransaction } from "./transaction";
import { sendMintTransaction } from "./send";
import {
  Field,
  PrivateKey,
  PublicKey,
  UInt64,
  Mina,
  AccountUpdate,
  Signature,
  UInt32,
} from "o1js";
import {
  MinaNFT,
  NameContractV2,
  RollupNFT,
  FileData,
  initBlockchain,
  MINANFT_NAME_SERVICE_V2,
  VERIFICATION_KEY_V2_JSON,
  wallet,
  fetchMinaAccount,
  api,
  serializeFields,
  MintParams,
} from "minanft";
import { chainId } from "../blockchain/explorer";

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
  console.log("Mint NFT", params);

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
  } = params;

  const chain = chainId();

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

  const ipfsPromise = pinFile({
    file: image,
    keyvalues: {
      name,
      owner,
      contractAddress,
      chain,
      developer,
      repo,
    },
  });

  console.time("prepared data");

  console.log("contractAddress", contractAddress);

  const nftPrivateKey = PrivateKey.random();
  const address = nftPrivateKey.toPublicKey();
  const net = await initBlockchain(chain);
  console.log("network id", Mina.getNetworkId());
  const sender = PublicKey.fromBase58(owner);
  if (pinataJWT === undefined) {
    console.error("Pinata JWT is undefined");
    return {
      success: false,
      error: "Pinata JWT is undefined",
    };
  }
  const arweaveKey = undefined;

  if (jwt === undefined) {
    console.error("JWT is undefined");
    return {
      success: false,
      error: "JWT is undefined",
    };
  }
  const minanft = new api(jwt);
  const reservedPromise = minanft.reserveName({
    name,
    publicKey: owner,
    chain,
    contract: contractAddress,
    version: "v2",
    developer: "DFST",
    repo: "web-mint-example",
  });

  const nft = new RollupNFT({
    name,
    address,
    external_url: net.network.explorerAccountUrl + address.toBase58(),
  });

  console.timeEnd("prepared data");

  if (collection !== undefined && collection !== "")
    nft.update({ key: `collection`, value: collection });

  if (description !== undefined && description !== "")
    nft.updateText({
      key: `description`,
      text: description,
    });

  for (const item of keys) {
    const { key, value, isPrivate } = item;
    nft.update({ key, value, isPrivate });
  }

  console.time("calculated sha3_512");
  const sha3_512 = await calculateSHA512(image);
  console.timeEnd("calculated sha3_512");
  console.log("image sha3_512", sha3_512);

  console.time("reserved name");
  const reserved = await reservedPromise;
  console.timeEnd("reserved name");

  console.log("Reserved", reserved);
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
    return {
      success: false,
      error: "Name is not reserved",
      reason: reserved.reason,
    };
  }

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
  console.log("image ipfs", ipfs);

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
  const fee = Number((await MinaNFT.fee()).toBigInt());
  const memo = ("mint NFT @" + name).substring(0, 30);
  await fetchMinaAccount({ publicKey: sender });
  await fetchMinaAccount({ publicKey: zkAppAddress });
  console.time("prepared commit data");
  await commitPromise;
  console.timeEnd("prepared commit data");
  console.time("prepared tx");

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
  const tx = await Mina.transaction({ sender, fee, memo }, async () => {
    //AccountUpdate.fundNewAccount(sender);
    await zkApp.mint(mintParams);
  });

  tx.sign([nftPrivateKey]);
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

  const jobId = await sendMintTransaction({
    name,
    serializedTransaction,
    signedData,
    mintParams: serializeFields(MintParams.toFields(mintParams)),
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
    json,
  };
}
