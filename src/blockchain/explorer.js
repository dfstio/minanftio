const { REACT_APP_CHAIN_ID } = process.env;

export function explorerAccount(chain = "devnet") {
  if (chain === "devnet") return "https://minascan.io/devnet/account/";
  if (chain === "mainnet") return "https://minascan.io/mainnet/account/";
  else return "https://zekoscan.io/devnet/account/";
}

export function explorerTransaction(chain = "devnet") {
  if (chain === "devnet") return "https://minascan.io/devnet/tx/";
  if (chain === "mainnet") return "https://minascan.io/mainnet/tx/";
  else return "https://zekoscan.io/devnet/tx/";
}

export function chainId() {
  if (REACT_APP_CHAIN_ID === undefined)
    console.error("REACT_APP_CHAIN_ID is undefined");
  return REACT_APP_CHAIN_ID;
}
