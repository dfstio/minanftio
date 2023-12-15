import api from "../serverless/api";
import { relayFunction } from "../relay/relayclient";
import { message } from "antd";
import { isMobile } from "react-device-detect";

import logger from "../serverless/logger";
const logm = logger.debug.child({ winstonModule: "mina" });

const MINIMUM_BALANCE = 1e17; // to switch to relay

const ethers = require("ethers");
const VirtuosoNFTJSON = require("../contract/NFTVirtuoso.json");

const {
  REACT_APP_CONTRACT_ADDRESS,
  REACT_APP_CHAIN_ID,
  REACT_APP_RPCURL_METAMASK,
  REACT_APP_NETWORK_TOKEN,
  REACT_APP_NETWORK_NAME,
  REACT_APP_NETWORK_HEXCHAIN_ID,
  REACT_APP_NETWORK_EXPLORER,
  REACT_APP_VIRTUOSO_URL,
} = process.env;

var provider =
  window.ethereum && new ethers.providers.Web3Provider(window.ethereum);
var signer = provider && provider.getSigner();
var readVirtuoso =
  provider &&
  new ethers.Contract(REACT_APP_CONTRACT_ADDRESS, VirtuosoNFTJSON, provider);

async function virtuosoFunction(address, name, args) {
  const log = logm.child({ address, name, args, wf: "virtuosoFunction" });
  log.profile(`call executed: ${name} from ${address}`);
  let result = { hash: "", transactionId: "" };

  try {
    signer = provider && provider.getSigner();
    if (signer && address !== "") {
      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      });
      const signerAddress = await signer.getAddress();
      log.debug("called", { chainId, signerAddress });

      if (
        chainId === REACT_APP_NETWORK_HEXCHAIN_ID &&
        address == signerAddress
      ) {
        const balance = await window.ethereum.request({
          method: "eth_getBalance",
          params: [address],
        });
        log.debug("balance", { balance: balance / 1e18 });
        if (balance < MINIMUM_BALANCE) {
          result = await relayFunction(name, args);
          await api.txSent(
            result.hash,
            REACT_APP_CHAIN_ID,
            result.transactionId
          );
        } else {
          //const writeVirtuoso = signer && new ethers.Contract(REACT_APP_CONTRACT_ADDRESS, VirtuosoNFTJSON, signer);
          const virtuosoInterface = new ethers.utils.Interface(VirtuosoNFTJSON);
          const data = virtuosoInterface.encodeFunctionData(name, args);
          //const nonce = await signer.getNonce().then(nonce => nonce.toString());
          const request = {
            from: signerAddress,
            to: REACT_APP_CONTRACT_ADDRESS,
            value: "0x0",
            data: data,
            chainId: parseInt(REACT_APP_CHAIN_ID),
          };
          log.debug("before send");
          result.hash = await window.ethereum.request({
            method: "eth_sendTransaction",
            params: [request],
          });
          log.debug(`sent tx ${result.hash}`);
          await api.txSent(result.hash, REACT_APP_CHAIN_ID);
          log.debug(`txSent ${result.hash}`);
        }
      } else
        log.error(`wrong chain or address calling ${name} from ${address}`);
    } else
      log.error(`no signer or address calling ${name} from ${address}`, {
        signer,
      });
  } catch (error) {
    log.error("catch", { error });
  }

  log.profile(`call executed: ${name} from ${address}`, { result });
  return result;
}

export async function initVirtuoso(handleEvents) {
  const chainId = await window.ethereum.request({ method: "eth_chainId" });
  const log = logm.child({ chainId, wf: "initVirtuoso" });
  log.debug("initVirtuoso called on chain");

  if (chainId === REACT_APP_NETWORK_HEXCHAIN_ID) {
    provider =
      window.ethereum && new ethers.providers.Web3Provider(window.ethereum);
    readVirtuoso =
      provider &&
      new ethers.Contract(
        REACT_APP_CONTRACT_ADDRESS,
        VirtuosoNFTJSON,
        provider
      );
    if (readVirtuoso) {
      readVirtuoso.removeAllListeners();
      //readVirtuoso.on({}, handleEvents);
      log.debug("initVirtuoso success on chain");
    }
  } else
    log.debug("Cannot init virtuoso - wrong chain", {
      REACT_APP_NETWORK_NAME,
      REACT_APP_NETWORK_HEXCHAIN_ID,
    });
}

export async function initAccount(
  handleEvents,
  handleChainChanged,
  handleAccountsChanged
) {
  let address = "";
  try {
    if (window.mina !== undefined) {
      const chainId = await window.mina.requestNetwork();
      let account = await window.mina.mina_accounts();
      console.log("getAddress account", account, chainId);

      if (account.length > 0 && chainId === "Berkeley") {
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

export async function getAddress(force = false) {
  //if(DEBUG) console.log("getAddress called");
  let address = "";
  try {
    if (window.mina !== undefined) {
      const chainId = await window.mina.requestNetwork();
      let account = await window.mina.mina_accounts();
      console.log("getAddress account", account, chainId);

      if (account.length > 0 && chainId === "Berkeley") {
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

export async function metamaskDecrypt(key, address) {
  let result = "";
  if (window.ethereum !== undefined && window.ethereum.isMetaMask === true) {
    try {
      result = await window.ethereum.request({
        method: "eth_decrypt",
        params: [key, address],
      });
    } catch (error) {
      logm.error("metamaskDecrypt error", {
        error,
        address,
        wf: "metamaskDecrypt",
      });
      return "";
    }
  }
  //if(DEBUG) console.log("metamaskDecrypt called", key, address, result);
  return result;
}

export async function getVirtuosoBalance(address) {
  let virtuosoBalance = 0;
  /*
    if( readVirtuoso  && (address !== ""))
    {
           const chainId =  await window.ethereum.request({method: 'eth_chainId'});
           //if(DEBUG) console.log("getVirtuosoBalance called on chain", chainId, "and address", address);

           if(chainId === REACT_APP_NETWORK_HEXCHAIN_ID)
           {
                virtuosoBalance = await readVirtuoso.virtuosoBalances( address);
           };
    };
	  */
  return virtuosoBalance;
}

export async function isModerator(address) {
  let moderator = false;
  if (readVirtuoso && address !== "") {
    const chainId = await window.ethereum.request({
      method: "eth_chainId",
    });
    //if(DEBUG) console.log("isModerator called on chain", chainId, "and address", address);

    if (chainId === REACT_APP_NETWORK_HEXCHAIN_ID) {
      moderator = await readVirtuoso.moderator(address);
    }
  }

  return moderator;
}

export async function getVirtuosoPublicKey(address) {
  let publicKey = "";
  if (readVirtuoso && address !== "") {
    const chainId = await window.ethereum.request({
      method: "eth_chainId",
    });
    //if(DEBUG) console.log("getVirtuosoPublicKey called on chain", chainId, "and address", address);

    if (chainId === REACT_APP_NETWORK_HEXCHAIN_ID) {
      publicKey = await readVirtuoso.publicKeys(address);
    }
  }

  return publicKey;
}

export async function getVirtuosoUnlockableContentKey(tokenId, address) {
  let key = "";
  if (readVirtuoso && address !== "") {
    const chainId = await window.ethereum.request({
      method: "eth_chainId",
    });
    //if(DEBUG) console.log("getVirtuosoUnlockableContentKey called on chain", chainId, "and address", address);

    if (chainId === REACT_APP_NETWORK_HEXCHAIN_ID) {
      key = await readVirtuoso.getUnlockableContentKey(tokenId, address);
    }
  }

  return key;
}

export async function virtuosoSell(
  tokenId,
  ipfsHash,
  operatorAddress,
  unlockableIPFSHash,
  address
) {
  const log = logm.child({
    tokenId,
    ipfsHash,
    operatorAddress,
    unlockableIPFSHash,
    address,
    wf: "virtuosoSell",
  });
  let txresult = "";

  try {
    txresult = await virtuosoFunction(address, "sell", [
      tokenId,
      ipfsHash,
      operatorAddress,
      unlockableIPFSHash,
    ]);
  } catch (error) {
    log.error("catch", { error });
  }
  return txresult;
}

export async function virtuosoMint(
  address,
  ipfsHash,
  unlockableIPFSHash,
  onEscrow,
  dynamicUri
) {
  const log = logm.child({
    address,
    ipfsHash,
    unlockableIPFSHash,
    onEscrow,
    dynamicUri,
    wf: "virtuosoMint",
  });

  let txresult = "";
  try {
    txresult = await virtuosoFunction(address, "mintItem", [
      address,
      ipfsHash,
      unlockableIPFSHash,
      onEscrow,
      dynamicUri,
    ]);
  } catch (error) {
    log.error("catch", { error });
  }
  return txresult;
}

export async function virtuosoRegisterPublicKey(address) {
  const log = logm.child({ address, wf: "virtuosoRegisterPublicKey" });
  let result = { hash: "", publicKey: "" };

  try {
    const publicKey = await window.ethereum.request({
      method: "eth_getEncryptionPublicKey",
      params: [address],
    });
    if (publicKey !== "") {
      result.publicKey = publicKey;
      let tx = await virtuosoFunction(address, "setPublicKey", [publicKey]);
      result.hash = tx.hash;
    }

    log.debug("result", { result });
  } catch (error) {
    log.error("catch", error);
  }
  return result;
}

export async function getSignature(message) {
  let signature = "";
  const log = logm.child({
    getSignatureMessage: message,
    wf: "getSignature",
  });

  try {
    const address = await getAddress();
    if (address == "") return "";
    const signResult = await window.mina.signMessage({
      message,
    });

    log.debug("getSignature:", { signResult, address });
    return signResult;
  } catch (error) {
    log.error("catch", error);
  }

  return signature;
}

export function convertAddress(address) {
  if (address !== "") return ethers.utils.getAddress(address);
  else return address;
}

export async function minaLogin(openlink = true) {
  let address = "";
  const log = logm.child({ openlink, wf: "minaLogin" });
  log.debug("called: ", { mina: window.mina });
  console.log("mina login start");

  try {
    if (window.mina !== undefined) {
      //await initVirtuoso();
      const network = await window.mina
        .requestNetwork()
        .catch((err) => console.log(err));
      const account = await window.mina.requestAccounts();
      log.debug("account", { account, network });
      console.log("mina login account", account, network);

      if (account.length > 0 && network?.chainId === "testworld2")
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
