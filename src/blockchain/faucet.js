import axios from "axios";

export async function faucet(address) {
  if (address === undefined || address === "")
    return { isCalculated: false, hash: "", reason: "address is undefined" };
  try {
    const response = await axios.post(process.env.REACT_APP_HASH_URL, {
      auth: process.env.REACT_APP_BOTAPIAUTH,
      publicKey: address,
      faucet: "true",
    });
    if (response && response.data) return response.data;
    else return { isCalculated: false, hash: "", reason: "no response" };
  } catch (error) {
    return { isCalculated: false, hash: "", reason: error.toString() };
  }
}
