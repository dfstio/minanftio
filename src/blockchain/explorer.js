export function explorerAccount(chain = "devnet") {
  if (chain === "devnet") return "https://minascan.io/devnet/account/";
  else return "https://zekoscan.io/devnet/account/";
}

export function explorerTransaction(chain = "devnet") {
  if (chain === "devnet") return "https://minascan.io/devnet/tx/";
  else return "https://zekoscan.io/devnet/tx/";
}

export function chainId() {
  return "devnet";
}
