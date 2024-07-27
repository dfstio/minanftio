import { message } from "antd";
import { isMobile } from "react-device-detect";
//import { chainId } from "./explorer";
import logger from "../serverless/logger";

const logm = logger.debug.child({ winstonModule: "mina" });

const { REACT_APP_CHAIN_ID } = process.env;
const DEBUG = "true" === process.env.REACT_APP_DEBUG;

export async function initAccount(
  handleEvents,
  handleChainChanged,
  handleAccountsChanged
) {
  if (DEBUG) console.log("initAccount called");
  const address = await getAddress();
  return address;
}

export async function getAddress(force = false) {
  if (DEBUG) console.log("getAddress called");
  let address = "";
  try {
    if (window.mina !== undefined) {
      const network = await window.mina.requestNetwork();
      let account = await window.mina.getAccounts();
      if (DEBUG) console.log("getAddress account", account, network);

      if (account.length > 0 /*&& network?.chainId === chainId()*/) {
        address = account[0];
      }
    }
  } catch (error) {
    // if user reject, requestAccounts will throw an error with code and message filed
    console.error("getAddress", error.message, error.code);
  }
  if (DEBUG) console.log("getAddress address", address);
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
  let logAccount = "";
  let logNetwork = "";
  const logOptions = {
    winstonModule: "Mina",
    winstonComponent: "login",
    isMobile,
    networkID: window.mina?.chainInfo?.networkID,
    isAuro: window.mina?.isAuro,
  };
  const log = logger.info.child(logOptions);

  log.debug("called: ", { mina: window.mina });
  if (DEBUG) console.log("mina login start", { mina: window.mina, logOptions });

  try {
    if (
      window.mina !== undefined &&
      window.mina?.requestNetwork !== undefined &&
      window.mina?.requestAccounts !== undefined &&
      window.mina?.switchChain !== undefined
    ) {
      let account;
      try {
        account = await window.mina.requestAccounts();
      } catch (error) {
        console.error("mina login requestAccounts catch", error);
        log.error("mina login requestAccounts catch", {
          text: error,
          account,
          logAccount,
          logNetwork,
          networkID: window.mina?.chainInfo?.networkID,
        });
        return "";
      }
      logAccount = account;
      let network = await window.mina?.requestNetwork();
      logNetwork = network;
      if (DEBUG) console.log("mina login network", network);
      if (network?.networkID !== REACT_APP_CHAIN_ID) {
        const switchNetwork = await window.mina.switchChain({
          networkID: REACT_APP_CHAIN_ID,
        });

        if (DEBUG) console.log("mina login switch network", switchNetwork);
        network = await window.mina.requestNetwork();
        logNetwork = network;
      }
      if (DEBUG) console.log("mina login network", network);

      log.debug("account", { account, network });
      if (DEBUG) console.log("mina login account", account, network);

      if (account.length > 0 && network?.networkID === REACT_APP_CHAIN_ID)
        address = account[0];
      else {
        console.error("mina login account error", { account, network });
        log.error("mina login account error", { account, network });
        message.error({
          content: `Please use the last Auro Wallet version, connect your wallet and switch to the correct network`,
          key: "minaLogin",
          duration: 60,
        });
      }
    } else {
      if (openlink) {
        const linkURL = isMobile
          ? "https://apps.apple.com/app/auro-wallet/id1574034920"
          : "https://chrome.google.com/webstore/detail/auro-wallet/cnmamaachppnkjgnildpdmkaakejnhae";
        window.open(linkURL);
        log.info(`mina login: open link, mobile: ${isMobile}`);
      } else {
        log.error("mina login: wallet not installed, skipping");
      }
    }

    log.debug(`minaLogin: connected with address ${address}`, { address });
  } catch (error) {
    console.error("mina login catch", error);
    log.error("mina login catch", {
      text: error,
      logAccount,
      logNetwork,
      networkID: window.mina?.chainInfo?.networkID,
    });
    message.error({
      content: `Auro Wallet error: ${error?.message ?? error ?? ""}`,
      key: "minaLogin",
      duration: 60,
    });
  }
  if (DEBUG) console.log("mina login address", address);
  return address;
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
