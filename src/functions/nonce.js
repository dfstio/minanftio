const { BLOCKBERRY_API } = process.env;

exports.handler = async (event, context) => {
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

    const zkAppTxs = getZkAppTxsFromBlockberry(account);
    const paymentTxs = getPaymentTxsFromBlockberry(account);

    const zkNonce = (await zkAppTxs)?.data[0]?.nonce ?? 0;
    const paymentNonce = (await paymentTxs)?.data[0]?.nonce ?? 0;
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
      `https://api.blockberry.one/mina-mainnet/v1/zkapps/accounts/${account}/txs?size=1&orderBy=DESC&sortBy=AGE`,
      options
    );
    const result = await response.json();
    console.log("zkAppTxs", result);
    return result;
  } catch (err) {
    console.error(err);
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
      "https://api.blockberry.one/mina-mainnet/v1/accounts/" +
        account +
        "/txs?page=0&size=1&orderBy=DESC&sortBy=AGE&direction=OUT",
      options
    );
    const result = await response.json();
    console.log("paymentTxs", result);
    return result;
  } catch (err) {
    console.error(err);
    return undefined;
  }
}
