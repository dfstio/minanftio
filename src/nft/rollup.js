import { loadFromIPFS } from "../blockchain/ipfs";

export async function getRollupNFT(rollupId) {
  console.log("getRollupNFT", rollupId);
  if (typeof rollupId !== "string") {
    console.log("getRollupNFT", "Invalid rollupId");
    return undefined;
  }
  if (rollupId[0] !== "i") {
    console.log("getRollupNFT", "Invalid rollupId format");
    return undefined;
  }
  const nft = await loadFromIPFS(rollupId.slice(1));
  if (nft === undefined) return undefined;
  if (nft.name === undefined)
    nft.name = nft?.properties?.name?.data ?? "RollupNFT";
  if (nft.description === undefined)
    nft.description = nft?.properties?.description?.linkedObject?.text ?? "";
  if (nft.owner === undefined) nft.owner = nft?.properties?.owner?.data ?? "";
  if (nft.address === undefined)
    nft.address = nft?.properties?.address?.linkedObject?.text ?? "";
  if (nft.image === undefined)
    nft.image = `https://gateway.pinata.cloud/ipfs/bafybeigkvkjhk7iii7b35u4e6ljpbtf5a6jdmzp3qdrn2odx76pubwvc4i`;
  if (nft.category === undefined) nft.category = "RollupNFT token";
  if (nft.minaExplorer === undefined)
    nft.minaExplorer = `https://minascan.io/devnet/account/${nft.address}`;
  if (nft.uri === undefined)
    nft.uri = `https://gateway.pinata.cloud/ipfs/${rollupId.slice(1)}`;
  return nft;
}

/*
{
    "name": "@aaa",
    "description": "",
    "image": "https://gateway.pinata.cloud/ipfs/QmRgm7fzGjdwSBrmWdoTErpLhGxqe4vCiLXRYJBqyy54QE",
    "external_url": "https://minanft.io/@aaa",
    "version": "1",
    "time": 1714071195196,
    "creator": "@MinaNFT_bot",
    "address": "B62qkBwWU2LcEwYKZMNVqmoGGXcYPs38yZQsg6CcDAd2fpRmvoWvj9Y",
    "owner": "16203035005595874653842997585814121163678530568311674918424845254241498775544",
    "escrow": "0",
    "metadata": {
        "data": "8623264756727430590648069272248952259190568522052229914092135790161947551650",
        "kind": "15173202587726530450041879696082075726441270863897821272355804454038602253264"
    },
    "properties": {
        "image": {
            "data": "5154618425741697166767336887306350836699283148676425967110513452900154390340",
            "kind": "image",
            "linkedObject": {
                "fileMerkleTreeRoot": "0",
                "MerkleTreeHeight": 0,
                "size": 3162696,
                "mimeType": "image/jpeg",
                "SHA3_512": "T8dR3svk0HRt7UzvPUF//w5d9qJdZLybiPHgYJziWfD5evXYZ+dxCa8pDyjkd8qHF5XR4oI3o9YKbrxKz91ezA==",
                "filename": "image.jpg",
                "storage": "i:QmRgm7fzGjdwSBrmWdoTErpLhGxqe4vCiLXRYJBqyy54QE",
                "fileType": "binary",
                "metadata": "0"
            }
        }
    },
    "url": "https://minanft.io/@aaa",
    "category": "MinaNFT token",
    "type": "nft",
    "contract": "v1",
    "chainId": "devnet",
    "tokenId": "@aaa",
    "updated": 1714071236025,
    "minaExplorer": "https://minascan.io/devnet/account/B62qkBwWU2LcEwYKZMNVqmoGGXcYPs38yZQsg6CcDAd2fpRmvoWvj9Y",
    "minaPublicKey": "B62qkBwWU2LcEwYKZMNVqmoGGXcYPs38yZQsg6CcDAd2fpRmvoWvj9Y",
    "shortdescription": "",
    "markdown": "",
    "uri": "https://gateway.pinata.cloud/ipfs/QmewJqYEA7cbioFoGcXmFeBUmnQU2X7T5xkGWJ1YnprT27",
    "onSale": false,
    "saleID": "",
    "saleStatus": "not on sale",
    "price": 0,
    "currency": "",
    "sale": "",
    "objectID": "@aaa"
}
*/
