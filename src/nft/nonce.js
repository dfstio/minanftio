import api from "../serverless/api";

export async function getNonce(account) {
  try {
    const result = await api.nonce(account);
    console.log("getNonce", result);
    if (result?.success === false) {
      return -1;
    } else {
      return result?.nonce ?? -1;
    }
  } catch (error) {
    console.error(`Error`, error);
    return -1;
  }
}
