import axios from "axios";
import algoliasearch from "algoliasearch";
import { chainId } from "../blockchain/explorer";

const {
  REACT_APP_ALGOLIA_KEY,
  REACT_APP_ALGOLIA_PROJECT,
  REACT_APP_ALGOLIA_INDEX,
  REACT_APP_CONTRACT_ADDRESS,
} = process.env;
const searchClient = algoliasearch(
  REACT_APP_ALGOLIA_PROJECT,
  REACT_APP_ALGOLIA_KEY
);
const searchIndex = searchClient.initIndex(REACT_APP_ALGOLIA_INDEX);
const DEBUG = "true" === process.env.REACT_APP_DEBUG;

async function getNFT(name) {
  let objectID = chainId() + "." + REACT_APP_CONTRACT_ADDRESS + "." + name;
  if (DEBUG) console.log("getNFT Token objectID", objectID);
  try {
    let nft = await searchIndex.getObject(objectID);
    if (DEBUG) console.log("NFT");
    return nft;
  } catch (error) {
    return undefined;
  }
}

/**
 * Gets the address (publicKey) of the NFT using serverless api call
 * @param name The name of the NFT
 */
export async function lookupName(name, owner) {
  /* Promise<{
  success: boolean;
  error?: string;
  address?: string;
  reason?: string;
  found?: boolean;
  chain?: string;
  contract?: string;
}>
*/
  const result = await apiHub("lookupName", {
    transactions: [],
    developer: "@dfst",
    name: "lookupName",
    task: "lookupName",
    args: [name[0] === "@" ? name : "@" + name],
  });
  try {
    const data = result.data;
    const { found, name, publicKey, chain, contract } = data;
    if (found === true) {
      if (owner && publicKey !== owner) {
        return {
          success: result.success,
          error: result.error,
          address: publicKey,
          found: found,
          chain: chain,
          contract: contract,
        };
      } else {
        const nft = await getNFT(name);
        const alreadyMinted =
          nft && nft.status && nft.status !== "failed" ? true : false;
        return {
          success: result.success,
          error: result.error,
          address: publicKey,
          found: found,
          chain: chain,
          contract: contract,
          alreadyMinted,
        };
      }
    } else {
      return {
        success: result.success,
        error: result.error,
        reason: "not found",
        found: found,
      };
    }
  } catch (error) {
    return {
      success: result.success,
      error: error?.toString() ?? result.error,
      reason: result.error,
    };
  }
}

/**
 * Reserves the name of the NFT using serverless api call
 * @param data The data for the reserveName call
 * @param data.name The name of the NFT
 * @param data.publicKey The public key of the NFT
 * @param data.chain The blockchain
 * @param data.contract The contract
 * @param data.version The version of signature ("v1" or "v2")
 * @param data.developer The developer of the NFT
 * @param data.repo The repo of the NFT
 */
export async function reserveName(data) {
  /*: {
  name: string;
  publicKey: string;
  chain: blockchain;
  contract: string;
  version?: string;
  developer?: string;
  repo?: string;
}): Promise<{
  success: boolean;
  error?: string;
  price: object;
  isReserved: boolean;
  signature?: string;
  expiry?: string;
  reason?: string;
}> */
  const result = await apiHub("reserveName", {
    transactions: [],
    developer: "@dfst",
    name: "reserveName",
    task: "reserveName",
    args: [JSON.stringify(data, null, 2)],
  });
  if (DEBUG) console.log("reserveName", result);
  const reserved = result.data === undefined ? { success: false } : result.data;
  const price = reserved.price ? JSON.parse(reserved.price) : {};
  return {
    success: result.success,
    error: result.error,
    price: price,
    isReserved: reserved.success ?? false,
    signature: reserved.signature,
    expiry: reserved.expiry,
    reason: reserved.reason ?? reserved.toString(),
  };
}

/**
 * Calls the serverless API
 * @param command the command of the API
 * @param data the data of the API
 * */
async function apiHub(command, data) {
  /*: Promise<{ success: boolean, data?: any, error?: any }>
   */
  const auth = process.env.REACT_APP_MINANFT_AUTH;
  if (auth === undefined) throw new Error("MINANFT_AUTH is undefined");
  const endpoint = process.env.REACT_APP_MINANFT_API;
  if (endpoint === undefined) throw new Error("MINANFT_API is undefined");
  const jwtToken = process.env.REACT_APP_MINANFT_JWT;
  if (jwtToken === undefined) throw new Error("MINANFT_JWT is undefined");
  const apiData = {
    auth,
    command: command,
    jwtToken,
    data: data,
  };

  try {
    const response = await axios.post(endpoint, apiData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("catch api", error);
    return { success: false, error: error };
  }
}

function isError(data) {
  if (data === "error") return true;
  if (data?.jobStatus === "failed") return true;
  if (typeof data === "string" && data.toLowerCase().startsWith("error"))
    return true;
  return false;
}
