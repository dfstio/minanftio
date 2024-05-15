import api from "../serverless/api";

const { ARWEAVE_IV, ARWEAVE_KEY } = process.env;

export async function decrypt() {
  try {
    const result = await api.storage();
    console.log("result", result);
    return result?.result;
  } catch (error) {
    console.error(`Error`, error);
    return error;
  }
}
