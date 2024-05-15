export function explorerAccount(chain = "devnet") {
  return "https://minascan.io/" + chain + "/account/";
}

export function explorerTransaction(chain = "devnet") {
  return "https://minascan.io/" + chain + "/tx/";
}

export function chainId() {
  return "devnet";
}
