import { initBlockchain } from "minanft";

export async function minaInit() {
  return await initBlockchain("devnet");
}
