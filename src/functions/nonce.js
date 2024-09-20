const { BLOCKBERRY_API } = process.env;
const chain =
  process.env.REACT_APP_CHAIN_ID === "mina:mainnet" ? "mainnet" : "devnet";

exports.handler = async (event, context) => {
  //console.log("event", event.body);
  // check for POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 400,
      body: "You are not using a http POST method for this endpoint.",
      headers: { Allow: "POST" },
    };
  }

  try {
    // parse form data

    let body = JSON.parse(event.body);
    const account = body.account;
    if (account === undefined || account === null || account === "") {
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: false,
          message: "account is required",
        }),
      };
    }

    if (
      BLOCKBERRY_API === undefined ||
      BLOCKBERRY_API === null ||
      BLOCKBERRY_API === ""
    ) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: false,
          message: "BLOCKBERRY_API is required",
        }),
      };
    }
    console.log("account", account);
    const zkAppTxsPromise = getZkAppTxsFromBlockberry(account);
    const paymentTxs = getPaymentTxsFromBlockberry(account);

    const paymentNonce = (await paymentTxs)?.data[0]?.nonce ?? -1;
    let zkNonce = -1;
    let found = false;
    const zkAppTxs = await zkAppTxsPromise;
    const size = zkAppTxs?.data?.length ?? 0;
    let i = 0;
    while (!found && i < size) {
      if (zkAppTxs?.data[i]?.proverAddress === account) {
        zkNonce = zkAppTxs?.data[i]?.nonce;
        found = true;
      }
      i++;
    }
    const nonce = Math.max(zkNonce, paymentNonce);
    console.log("nonce", { zkNonce, paymentNonce, nonce });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        nonce,
      }),
    };
  } catch (error) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: error,
        success: false,
      }),
    };
  }
};

async function getZkAppTxsFromBlockberry(account) {
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-api-key": BLOCKBERRY_API,
    },
  };
  try {
    const response = await fetch(
      `https://api.blockberry.one/mina-${chain}/v1/zkapps/accounts/${account}/txs?size=10&orderBy=DESC&sortBy=AGE`,
      options
    );
    if (!response.ok) {
      console.error(
        "Cannot fetch zkApp txs for account:",
        account,
        chain,
        response.statusText
      );
      return undefined;
    }
    const result = await response.json();
    //console.log("zkAppTxs", result);
    return result;
  } catch (err) {
    console.error(
      "Cannot fetch zkApp txs for account - catch:",
      account,
      chain,
      err
    );
    return undefined;
  }
}

async function getPaymentTxsFromBlockberry(account) {
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-api-key": BLOCKBERRY_API,
    },
  };

  try {
    const response = await fetch(
      `https://api.blockberry.one/mina-${chain}/v1/accounts/` +
        account +
        "/txs?page=0&size=1&orderBy=DESC&sortBy=AGE&direction=OUT",
      options
    );
    if (!response.ok) {
      console.error(
        "Cannot fetch payment txs for account:",
        account,
        chain,
        response.statusText
      );
      return undefined;
    }
    const result = await response.json();
    //console.log("paymentTxs", result);
    return result;
  } catch (err) {
    console.error(
      "Cannot fetch payment txs for account - catch:",
      account,
      chain,
      err
    );
    return undefined;
  }
}
