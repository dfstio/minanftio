import { initBlockchain } from "minanft";

export function minaInit() {
  return initBlockchain("devnet");
}
