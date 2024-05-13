import { message } from "antd";
import { isMobile } from "react-device-detect";
//import { chainId } from "./explorer";
import logger from "../serverless/logger";
const logm = logger.debug.child({ winstonModule: "mina" });

export async function initAccount(
  handleEvents,
  handleChainChanged,
  handleAccountsChanged
) {
  console.log("initAccount called");
  const address = await getAddress();
  return address;
}

export async function getAddress(force = false) {
  console.log("getAddress called");
  let address = "";
  try {
    if (window.mina !== undefined) {
      const network = await window.mina.requestNetwork();
      let account = await window.mina.getAccounts();
      console.log("getAddress account", account, network);

      if (account.length > 0 /*&& network?.chainId === chainId()*/) {
        address = account[0];
      }
    }
  } catch (error) {
    // if user reject, requestAccounts will throw an error with code and message filed
    console.log("getAddress", error.message, error.code);
  }
  console.log("getAddress address", address);
  return address;
}

export async function getVirtuosoBalance(address) {
  let virtuosoBalance = 0;
  return virtuosoBalance;
}

export async function isModerator(address) {
  let moderator = false;

  return moderator;
}

export async function getSignature(message) {
  let signature = "";
  const log = logm.child({
    getSignatureMessage: message,
    wf: "getSignature",
  });

  try {
    const address = await getAddress();
    if (address === "") return "";
    const signResult = await window.mina
      .signJsonMessage({
        message,
      })
      .catch((err) => console.log(err));

    log.debug("getSignature:", { signResult, address });
    return signResult;
  } catch (error) {
    log.error("catch", error);
  }

  return signature;
}

export async function getFieldsSignature(message) {
  let signature = "";
  const log = logm.child({
    getSignatureMessage: message,
    wf: "getSignature",
  });

  try {
    const address = await getAddress();
    if (address === "") return "";
    const signResult = await window.mina
      .signFields({
        message,
      })
      .catch((err) => console.log(err));

    log.debug("getFieldsSignature:", { signResult, address });
    return signResult;
  } catch (error) {
    log.error("catch", error);
  }

  return signature;
}

export async function minaLogin(openlink = true) {
  let address = "";
  const log = logm.child({ openlink, wf: "minaLogin" });
  log.debug("called: ", { mina: window.mina });
  console.log("mina login start");

  try {
    if (window.mina !== undefined) {
      //await initVirtuoso();
      let network = await window.mina
        .requestNetwork()
        .catch((err) => console.log(err));
      console.log("mina login network", network);
      /*
      if (network?.chainId !== chainId()) {
        const switchNetwork = await window.mina
          .switchChain({ chainId: chainId() })
          .catch((err) => console.log(err));
        console.log("mina login switch network", switchNetwork);
        let network = await window.mina
          .requestNetwork()
          .catch((err) => console.log(err));
      }
      */
      console.log("mina login network", network);

      const account = await window.mina.requestAccounts();
      log.debug("account", { account, network });
      console.log("mina login account", account, network);

      if (account.length > 0 /* && network?.chainId === chainId()*/)
        address = account[0];
    } else {
      if (openlink) {
        const linkURL =
          "https://chrome.google.com/webstore/detail/auro-wallet/cnmamaachppnkjgnildpdmkaakejnhae";
        window.open(linkURL);
      }
    }

    log.debug(`minaLogin: connected with address ${address}`, { address });
  } catch (error) {
    log.error("catch", error);
  }
  console.log("mina login", address);
  return address;
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
