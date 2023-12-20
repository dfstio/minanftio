import { MerkleTree, Field, Encoding } from "o1js";
import { FileData } from "minanft";
//import { createHash } from "crypto";
import axios from "axios";
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

export async function getFileData(file, pinataJWT, calculateRoot = false) {
  const binary = await readFileAsync(file);
  let height = 0;
  let root = Field(0);
  if (calculateRoot) {
    const bytes = new Uint8Array(binary.byteLength);
    const fields = [];
    bytes.set(binary);
    fields.push(...Encoding.bytesToFields(bytes));

    height = Math.ceil(Math.log2(fields.length + 2)) + 1;
    const tree = new MerkleTree(height);
    if (fields.length > tree.leafCount)
      throw new Error(`File is too big for this Merkle tree`);
    // First field is the height, second number is the number of fields
    tree.fill([Field.from(height), Field.from(fields.length), ...fields]);
    root = tree.getRoot();
  }

  const binaryWA = CryptoJS.lib.WordArray.create(binary);
  var sha3_512 = CryptoJS.SHA3(binaryWA, { outputLength: 512 }).toString(
    CryptoJS.enc.Base64
  );
  //  "UBSdn4FVQRB1q6qAT7gjVb6TbNAC+Rqo3PS5GpDSaBzLLI4yHuJB8lQV7GFFvxSZKLo/commzF9LsaUGE4Sv3Q==";
  const hash = await pinFile(file, pinataJWT);
  if (hash === undefined) {
    console.error("getFileData error: hash is undefined");
    return undefined;
  }
  const storage = `i:${hash}`;

  return new FileData({
    fileRoot: root,
    height,
    size: file.size,
    mimeType: file.type,
    sha3_512,
    filename: file.name,
    storage,
  });
}

export async function pinFile(file, pinataJWT) {
  const auth = "Bearer " + pinataJWT;
  const formData = new FormData();
  formData.append("file", file, {
    contentType: file.type,
    knownLength: file.size,
    filename: file.name,
  });

  if (auth === "Bearer ")
    //for running tests
    return `QmaRZUgm2GYCCjsDCa5eJk4rjRogTgY6dCyXRQmnhvFmjj`;

  /*
    const metadata = JSON.stringify({
      name: 'File name',
    });
    formData.append('pinataMetadata', metadata);
    
    const options = JSON.stringify({
      cidVersion: 0,
    })
    formData.append('pinataOptions', options);
    */

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

/*
  filename: string;
  storage?: string;
  sha3_512_hash?: string;
  size?: number;
  mimeType?: string;
  root?: Field;
  height?: number;
  leavesNumber?: number;
  constructor(filename: string) {
    this.filename = filename;
  }
  public async metadata(): Promise<{
    size: number;
    mimeType: string;
  }> {
    const stat = await fs.stat(this.filename);
    const mimeType = mime.getType(this.filename);
    return {
      size: stat.size,
      mimeType: mimeType ?? "application/octet-stream",
    };
  }

  public async sha3_512(): Promise<string> {
    const file: fs.FileHandle = await fs.open(this.filename);
    const stream = file.createReadStream();
    const hash = createHash("SHA3-512");
    for await (const chunk of stream) {
      hash.update(chunk);
    }
    this.sha3_512_hash = hash.digest("base64");
    stream.close();
    return this.sha3_512_hash;
  }

  public async pin(pinataJWT: string) {
    const metadata = await this.metadata();
    const file: fs.FileHandle = await fs.open(this.filename);
    const stream = file.createReadStream();
    const ipfs = new IPFS(pinataJWT);
    const hash = await ipfs.pinFile(
      stream,
      path.basename(this.filename),
      metadata.size,
      metadata.mimeType
    );
    stream.close();
    if (hash === undefined) throw new Error(`IPFS pin failed`);
    this.storage = `i:${hash}`;
    this.size = metadata.size;
    this.mimeType = metadata.mimeType;
  }

  public async treeData(): Promise<{
    root: Field;
    height: number;
    leavesNumber: number;
  }> {
    const fields: Field[] = [];
    let remainder: Uint8Array = new Uint8Array(0);

    const file: fs.FileHandle = await fs.open(this.filename);
    const stream = file.createReadStream();
    for await (const chunk of stream) {
      const bytes: Uint8Array = new Uint8Array(remainder.length + chunk.length);
      if (remainder.length > 0) bytes.set(remainder);
      bytes.set(chunk as Buffer, remainder.length);
      const chunkSize = Math.floor(bytes.length / 31) * 31;
      fields.push(...Encoding.bytesToFields(bytes.slice(0, chunkSize)));
      remainder = bytes.slice(chunkSize);
    }
    if (remainder.length > 0) fields.push(...Encoding.bytesToFields(remainder));

    const height = Math.ceil(Math.log2(fields.length + 2)) + 1;
    const tree = new MerkleTree(height);
    if (fields.length > tree.leafCount)
      throw new Error(`File is too big for this Merkle tree`);
    // First field is the height, second number is the number of fields
    tree.fill([Field.from(height), Field.from(fields.length), ...fields]);
    this.root = tree.getRoot();
    this.height = height;
    this.leavesNumber = fields.length;
    stream.close();
    return { root: this.root, height, leavesNumber: this.leavesNumber };
  }

  public async data(): Promise<FileData> {
    if (this.storage === undefined) throw new Error(`File: storage not set`);
    if (this.sha3_512_hash === undefined)
      throw new Error(`File: SHA3-512 hash not set`);
    if (this.size === undefined) throw new Error(`File: size not set`);
    if (this.mimeType === undefined) throw new Error(`File: MIME type not set`);
    if (this.root === undefined) throw new Error(`File: root not set`);
    if (this.height === undefined) throw new Error(`File: height not set`);
    if (this.leavesNumber === undefined)
      throw new Error(`File: leavesNumber not set`);
    //const metadata = await this.metadata();
    //const sha3_512 = await this.sha3_512();
    //const treeData = await this.treeData();
    return new FileData({
      fileRoot: this.root,
      height: this.height,
      size: this.size,
      mimeType: this.mimeType.slice(0, 31),
      sha3_512: this.sha3_512_hash,
      filename: path.basename(this.filename).slice(0, 31),
      storage: this.storage,
    });
  }
}
*/
