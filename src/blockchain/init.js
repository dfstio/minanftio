import { initBlockchain } from "minanft";
import { chainId } from "./explorer";

export async function minaInit() {
  return await initBlockchain(chainId());
}
