import { loadFromIPFS } from "../blockchain/ipfs";

export async function getRollupNFT(rollupId) {
  console.log("getRollupNFT", rollupId);
  if (typeof rollupId !== "string") {
    console.log("getRollupNFT", "Invalid rollupId");
    return undefined;
  }
  if (rollupId[0] !== "i") {
    console.log("getRollupNFT", "Invalid rollupId format");
    return undefined;
  }
  return await loadFromIPFS(rollupId.slice(1));
}
