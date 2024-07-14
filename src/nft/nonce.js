import api from "../serverless/api";

export async function getNonce(account) {
  try {
    const result = await api.nonce(account);
    console.log("getNonce", result);
    if (result?.success === false) {
      return 0;
    } else {
      return result?.nonce ?? 0;
    }
  } catch (error) {
    console.error(`Error`, error);
    return 0;
  }
}
