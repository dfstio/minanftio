/* Api methods to call /functions */
import Notify from "bnc-notify";
import logger from "./logger";
//const logm = logger.info.child({ winstonModule: 'api' });
const { REACT_APP_RELAY_KEY, REACT_APP_BLOCKNATIVE_KEY, REACT_APP_CHAIN_ID } =
  process.env;

const notify = Notify({
  dappId: REACT_APP_BLOCKNATIVE_KEY, // [String] The API key created by step one above
  networkId: parseInt(REACT_APP_CHAIN_ID), // [Integer] The Ethereum network ID your Dapp uses.
});

/*
const add = (address, amount, description) => {
  const data = {"address": address, "amount": amount, "description": description };
  if(DEBUG) console.log("add api: ", data);
  return fetch('/api/add-background', {
    body: JSON.stringify(data),
    method: 'POST'
  }).then(response => {
    return response;
  })
}

*/

const hash = (address) => {
  const data = {
    address: address,
    winstonMeta: logger.meta,
  };
  //if(DEBUG) console.log("sell api: ", data);
  return fetch("/api/hash", {
    body: JSON.stringify(data),
    method: "POST",
  }).then((response) => {
    return response.json();
  });
};

const sell = (tokenId, sellData, email, address) => {
  const data = {
    tokenId: tokenId,
    data: sellData,
    email: email,
    address: address,
    winstonMeta: logger.meta,
  };
  //if(DEBUG) console.log("sell api: ", data);
  return fetch("/api/sell", {
    body: JSON.stringify(data),
    method: "POST",
  }).then((response) => {
    return response.json();
  });
};

const winston = (info) => {
  //if(DEBUG) console.log("winston api: ", info);
  if (info.level === "debug") return;
  return fetch("/api/winston", {
    body: JSON.stringify(info),
    method: "POST",
  }).then((response) => {
    return response.json();
  });
};

const content = (tokenId, contentData) => {
  const data = {
    tokenId: tokenId,
    data: contentData,
    key: REACT_APP_RELAY_KEY,
    winstonMeta: logger.meta,
  };
  //if(DEBUG) console.log("content api: ", data);
  return fetch("/api/content", {
    body: JSON.stringify(data),
    method: "POST",
  }).then((response) => {
    return response.json();
  });
};

const mint = (to, newTokenURI, unlockableContentKey, onEscrow, dynamicUri) => {
  const data = {
    data: { to, newTokenURI, unlockableContentKey, onEscrow, dynamicUri },
    key: REACT_APP_RELAY_KEY,
    winstonMeta: logger.meta,
  };
  //if(DEBUG) console.log("mint api: ", data);
  return fetch("/api/mint", {
    body: JSON.stringify(data),
    method: "POST",
  }).then((response) => {
    return response.json();
  });
};

const unlockable = (tokenId, address) => {
  const data = {
    tokenId: tokenId,
    address: address,
    winstonMeta: logger.meta,
  };
  //if(DEBUG) console.log("unlockable api: ", data);
  return fetch("/api/unlockable-background", {
    body: JSON.stringify(data),
    method: "POST",
  }).then((response) => {
    return response;
  });
};

export default {
  sell: sell,
  unlockable: unlockable,
  content: content,
  mint: mint,
  winston: winston,
};
