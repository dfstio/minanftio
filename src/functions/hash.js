import { Poseidon, PublicKey } from "o1js";
import { MinaNFT, accountBalanceMina } from "minanft";
const logger = require("../serverless/winston");
const logmodule = logger.debug.child({ winstonModule: "hash module" });

exports.handler = async (event, context) => {
  const log = logmodule.child({ winstonFunction: "hash function" });
  // check for POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 400,
      body: "You are not using a http POST method for this endpoint.",
      headers: { Allow: "POST" },
    };
  }
  let hash = "";
  let balance = 0;
  console.log("event", event);

  try {
    // parse form data
    const body = JSON.parse(event.body);
    console.log("body", body, body.address);
    //log.debug("test debug", {body});
    log.debug("hash function call", { body });

    if (
      body.address !== undefined &&
      body.address !== null &&
      body.address !== ""
    ) {
      const publicKey = PublicKey.fromBase58(body.address);
      hash = Poseidon.hash(publicKey.toFields()).toJSON();
      MinaNFT.minaInit("testworld2");
      balance = await accountBalanceMina(body.address);
    }
    console.log("hash", hash);
    console.log("balance", balance);

    await logger.flush();
    // return success
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        hash,
        balance,
      }),
    };
  } catch (error) {
    log.error(error);
    await logger.flush();
    // return error
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({
        success: false,
        hash: hash ?? "",
        balance: balance ?? 0,
        message: error,
      }),
    };
  }
};
