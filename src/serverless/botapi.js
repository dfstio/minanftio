/* Api methods to call /functions */
import Notify from "bnc-notify";
import logger from "./logger";
//const logm = logger.info.child({ winstonModule: 'botapi' });
const { REACT_APP_RELAY_KEY, DEBUG } = process.env;

const mint = (jwtToken, ipfs) => {
  const data = {
    jwtToken,
    data: { ipfs },
    key: REACT_APP_RELAY_KEY,
    //winstonMeta: logger.meta,
  };
  if (DEBUG) console.log("mint api: ", data);
  return fetch("/api/botmint", {
    body: JSON.stringify(data),
    method: "POST",
  }).then((response) => {
    return response.json();
  });
};

export default {
  mint: mint,
};
