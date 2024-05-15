import logger from "../serverless/logger";
import api from "../serverless/api";
const logm = logger.debug.child({ winstonModule: "payment" });

const { ARWEAVE_IV, ARWEAVE_KEY } = process.env;

export async function decrypt() {
  try {
    const result = await api.storage();
    console.log("result", result);
    return result?.result;
  } catch (error) {
    logm.error("decrypt : error: ", error);
    return error;
  }
}
