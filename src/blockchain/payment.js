import logger from "../serverless/logger";
const logm = logger.debug.child({ winstonModule: "payment" });

export async function payment(params) {
  const { to, amount, memo } = params;
  const log = logm.child({
    params,
    wf: "payment",
  });

  try {
    const paymentResult = await window.mina
      .sendPayment({ amount, to, memo })
      .catch((err) => console.log(err));

    log.debug("payment:", { paymentResult });
    console.log("paymentResult", paymentResult);
    return paymentResult;
  } catch (error) {
    log.error("catch", error);
    return undefined;
  }
}
