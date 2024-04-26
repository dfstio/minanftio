import axios from "axios";

export async function loadFromIPFS(hash) {
  try {
    const url =
      "https://salmon-effective-amphibian-898.mypinata.cloud/ipfs/" +
      hash +
      "?pinataGatewayToken=" +
      process.env.REACT_APP_PINATA_GATEWAY_KEY;
    //"https://gateway.pinata.cloud/ipfs/" + hash;
    const result = await axios.get(url);
    return result.data;
  } catch (error) {
    console.error("loadFromIPFS error:", error?.message);
    return undefined;
  }
}
