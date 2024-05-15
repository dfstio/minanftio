const REACT_APP_PINATA_GATEWAY_KEY = process.env.REACT_APP_PINATA_GATEWAY_KEY;

export function storageUrl(storage, big = false, nocache = false) {
  const cacheUrl = "https://res.cloudinary.com/minanft/image/fetch/";
  const cacheSmallUrl =
    "https://res.cloudinary.com/minanft/image/fetch/h_300,q_100,f_auto/";
  const ipfsUrl = "https://salmon-effective-amphibian-898.mypinata.cloud/ipfs/";
  const arweaveUrl = "https://arweave.net/";

  if (storage.length === 0) {
    console.error("Empty storage");
    return "";
  }
  const url2 = storage.slice(2);
  let url = "";
  if (storage[0] === "i")
    url =
      ipfsUrl + url2 + `?pinataGatewayToken=${REACT_APP_PINATA_GATEWAY_KEY}`;
  else if (storage[0] === "a") url = arweaveUrl + url2;
  else {
    return storage;
  }

  if (nocache === true) return url;
  if (big === true) return cacheUrl + url;
  return cacheSmallUrl + url;
}

export function storageUrlFromURL(url) {
  if (url === undefined) {
    console.error("Empty fullUrl");
    return "";
  }
  if (url.includes("https://gateway.pinata.cloud/ipfs/")) {
    return (
      url.replace(
        "https://gateway.pinata.cloud/ipfs/",
        "https://salmon-effective-amphibian-898.mypinata.cloud/ipfs/"
      ) + `?pinataGatewayToken=${REACT_APP_PINATA_GATEWAY_KEY}`
    );
  } else return url;
}
