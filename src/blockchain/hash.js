import axios from "axios";

export async function hash(address) {
  if (address === undefined || address === "")
    return { isCalculated: false, hash: "", reason: "address is undefined" };
  try {
    const response = await axios.post(process.env.REACT_APP_HASH_URL, {
      auth: process.env.BOTAPIAUTH,
      publicKey: address,
    });
    if (response && response.data) return response.data;
    else return { isCalculated: false, hash: "", reason: "no response" };
  } catch (error) {
    return { isCalculated: false, hash: "", reason: error.toString() };
  }
}
