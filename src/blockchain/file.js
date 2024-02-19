import { MerkleTree, Field, Encoding } from "o1js";
import { FileData, File, calculateMerkleTreeRootFast } from "minanft";
//import { createHash } from "crypto";
import axios from "axios";
import { ARWEAVE } from "minanft";
const CryptoJS = require("crypto-js");

function readFileAsync(file) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = reject;

    reader.readAsArrayBuffer(file);
  });
}

function readJSONAsync(file) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = reject;

    reader.readAsText(file);
  });
}

export async function getJSON(file) {
  let json = undefined;
  try {
    const text = await readJSONAsync(file);
    json = JSON.parse(text);
  } catch (err) {
    console.error("getJSON error", file, err);
  }
  return json;
}

export async function getFileData(
  file,
  storageType,
  pinataJWT,
  arweaveKey,
  isPrivate = false,
  calculateRoot = false
) {
  const binary = await readFileAsync(file);
  let height = 0;
  let root = Field(0);
  let storage = "";
  if (calculateRoot) {
    const bytes = new Uint8Array(binary.byteLength);
    bytes.set(binary);
    const fields = File.fillFields(bytes);
    height = Math.ceil(Math.log2(fields.length + 2)) + 1;
    // First field is the height, second number is the number of fields
    const treeFields = [
      Field.from(height),
      Field.from(fields.length),
      ...fields,
    ];
    const { root: calculatedRoot, leafCount } = calculateMerkleTreeRootFast(
      height,
      treeFields
    );
    root = calculatedRoot;
    //const tree = new MerkleTree(height);
    if (treeFields.length > leafCount)
      throw new Error(`File is too big for this Merkle tree`);

    //tree.fill();
    //root = tree.getRoot();
  }

  const binaryWA = CryptoJS.lib.WordArray.create(binary);
  var sha3_512 = CryptoJS.SHA3(binaryWA, { outputLength: 512 }).toString(
    CryptoJS.enc.Base64
  );
  //  "UBSdn4FVQRB1q6qAT7gjVb6TbNAC+Rqo3PS5GpDSaBzLLI4yHuJB8lQV7GFFvxSZKLo/commzF9LsaUGE4Sv3Q==";

  if (isPrivate !== true) {
    if (storageType === "Arweave") {
      const hash = await pinFile(file, arweaveKey, true);
      if (hash === undefined) {
        console.error("getFileData error: Arweave hash is undefined");
        return undefined;
      }
      storage = `a:${hash}`;
    } else if (storageType === "IPFS") {
      const hash = await pinFile(file, pinataJWT);
      if (hash === undefined) {
        console.error("getFileData error: IPFS hash is undefined");
        return undefined;
      }
      storage = `i:${hash}`;
    } else {
      console.error("getFileData error: unknown storage type");
      return undefined;
    }
  }

  return new FileData({
    fileRoot: root,
    height,
    size: file.size,
    mimeType: file.type.substring(0, 30),
    sha3_512,
    filename: file.name.substring(0, 30),
    storage,
  });
}

export async function pinFile(file, key, useArweave = false) {
  if (useArweave) {
    const arweave = new ARWEAVE(key);
    const binary = await readFileAsync(file);
    const hash = await arweave.pinFile(binary, file.name, file.size, file.type);
    return hash;
  } else {
    const auth = "Bearer " + key;
    const formData = new FormData();
    formData.append("file", file, {
      contentType: file.type,
      knownLength: file.size,
      filename: file.name,
    });

    if (auth === "Bearer ")
      //for running tests
      return `QmaRZUgm2GYCCjsDCa5eJk4rjRogTgY6dCyXRQmnhvFmjj`;

    try {
      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          maxBodyLength: "Infinity",
          headers: {
            "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
            Authorization: auth,
          },
        }
      );
      console.log("pinFile result:", response.data);
      if (response && response.data && response.data.IpfsHash) {
        return response.data.IpfsHash;
      } else {
        console.error("pinFile error", response.data.error);
        return undefined;
      }
    } catch (err) {
      console.error("pinFile error 2 - catch", err);
      return undefined;
    }
  }
}
