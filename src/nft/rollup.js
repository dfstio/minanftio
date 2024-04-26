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
  if (nft.minaPublicKey === undefined) nft.minaPublicKey = nft.address;
  nft.rollupId = rollupId;
  return nft;
}

/*
{
    "description": "This is my long description of the Rollup NFT. Can be of any length, supports markdown.",
    "image": "https://gateway.pinata.cloud/ipfs/bafybeigkvkjhk7iii7b35u4e6ljpbtf5a6jdmzp3qdrn2odx76pubwvc4i",
    "time": 1714130110482,
    "metadata": {
        "data": "23291091597777334075045259379024136807801571077164875093427240107955004891525",
        "kind": "8033053699595223755302410150093938683738588776868809400255352694232902826867"
    },
    "properties": {
        "name": {
            "data": "@rolluptest",
            "kind": "string"
        },
        "address": {
            "data": "1744314013309764636504208939471112031220646451967268234165085446619894304615",
            "kind": "text",
            "linkedObject": {
                "type": "text",
                "MerkleTreeHeight": 7,
                "size": 55,
                "text": "B62qrjWrAaXV65CZgpfhLdFynbFdyj851cWZPCPvF92mF3ohGDbNAME"
            }
        },
        "description": {
            "data": "6822811798012997404891525879664518139199995665788841618776449802015741863762",
            "kind": "text",
            "linkedObject": {
                "type": "text",
                "MerkleTreeHeight": 8,
                "size": 87,
                "text": "This is my long description of the Rollup NFT. Can be of any length, supports markdown."
            }
        },
        "twitter": {
            "data": "@builder",
            "kind": "string"
        },
        "image": {
            "data": "13859449145025830811875369399724069252973251707339667250775913572147906571686",
            "kind": "image",
            "linkedObject": {
                "fileMerkleTreeRoot": "0",
                "MerkleTreeHeight": 0,
                "size": 287846,
                "mimeType": "image/jpeg",
                "SHA3_512": "qRm+FYlhRb1DHngZ0rIQHXAfMS1yTi6exdbfzrBJ/Dl1WuzCuif1v4UDsH4zY+tBFEVctBnHo2Ojv+0LBuydBw==",
                "filename": "image.jpg",
                "storage": "i:bafybeigkvkjhk7iii7b35u4e6ljpbtf5a6jdmzp3qdrn2odx76pubwvc4i",
                "fileType": "binary",
                "metadata": "0"
            }
        },
        "level 2 and 3 data": {
            "data": "5439509334043063897613427304252668480852929784445717192914088012054381916832",
            "kind": "map",
            "linkedObject": {
                "type": "map",
                "properties": {
                    "level2-1": {
                        "data": "value21",
                        "kind": "string"
                    },
                    "level2-2": {
                        "data": "value22",
                        "kind": "string"
                    },
                    "level2-3": {
                        "data": "17918742563826681862408641965129071963958922660597457205933767099995396120858",
                        "kind": "text",
                        "linkedObject": {
                            "type": "text",
                            "MerkleTreeHeight": 7,
                            "size": 41,
                            "text": "This is text on level 2. Can be very long"
                        }
                    },
                    "level2-4": {
                        "data": "3079195725375464664862089916511624621232171805300008614818111793450019753835",
                        "kind": "map",
                        "linkedObject": {
                            "type": "map",
                            "properties": {
                                "level3-1": {
                                    "data": "value31",
                                    "kind": "string"
                                },
                                "level3-3": {
                                    "data": "value33",
                                    "kind": "string"
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    "name": "@rolluptest",
    "owner": "",
    "address": "B62qrjWrAaXV65CZgpfhLdFynbFdyj851cWZPCPvF92mF3ohGDbNAME",
    "category": "RollupNFT token",
    "minaExplorer": "https://minascan.io/devnet/account/B62qrjWrAaXV65CZgpfhLdFynbFdyj851cWZPCPvF92mF3ohGDbNAME",
    "uri": "https://gateway.pinata.cloud/ipfs/bafkreifof56ydwhqhvz744czppjljzcpcvabscuu2ofylemzvzferlvlka"
}

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
