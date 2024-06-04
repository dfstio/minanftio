import { initBlockchain } from "minanft";
const { REACT_APP_CHAIN_ID } = process.env;

export async function minaInit() {
  if (REACT_APP_CHAIN_ID === undefined)
    console.error("REACT_APP_CHAIN_ID is undefined");
  return await initBlockchain(REACT_APP_CHAIN_ID);
}
