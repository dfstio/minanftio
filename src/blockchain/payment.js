import { error } from "winston";
import logger from "../serverless/logger";
const logm = logger.debug.child({ winstonModule: "payment" });

export async function payment(params) {
  const { to, amount, memo, chain } = params;
  const log = logm.child({
    params,
    wf: "payment",
  });

  try {
    const paymentResult = await window.mina.sendPayment({ amount, to, memo });
    log.debug("payment:", { paymentResult });
    console.log("paymentResult", paymentResult);
    return paymentResult;
  } catch (error) {
    log.error("paymentResult : error: ", error);
    return error;
  }
}
