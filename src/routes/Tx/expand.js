import { Descriptions } from "antd";

export function expandTx(item) {
  /* tx is a TransactionJson object 
  export interface TransactionJson {
    txId: string;
    status: string;
    name: string;
    operation: string;
    address: string;
    expiry: number;
    timeReceived: number;
    chain: string;
    contractAddress: string;
    blockNumber?: number;
    blockHash?: string;
    ipfs: string;
    metadataRootKind: string;
    metadataRootData: string;
  }
  */

  const TransactionJsonFields = {
    name: "Transaction data",
    values: [
      { name: "txId", type: "string", description: "Transaction ID" },
      { name: "status", type: "string", description: "Status" },
      { name: "name", type: "string", description: "NFT name" },
      { name: "operation", type: "string", description: "Operation" },
      {
        name: "address",
        type: "string",
        description: "NFT owner's address",
        url: `https://zekoscan.io/devnet/account/${item?.address}`,
      },
      { name: "expiry", type: "number", description: "Expiry date" },
      { name: "timeReceived", type: "time", description: "Time created" },
      {
        name: "chain",
        type: "string",
        description: "Chain",
        url: `https://zekoscan.io/devnet/home`,
      },
      {
        name: "contractAddress",
        type: "string",
        description: "Contract address",
        url: `https://zekoscan.io/devnet/account/${item?.contractAddress}/txs?type=zk-acc`,
      },
      {
        name: "blockNumber",
        type: "number",
        description: "Block number",
        optional: true,
      },
      {
        name: "blockHash",
        type: "string",
        description: "Block hash",
        optional: true,
      },
      {
        name: "transaction",
        type: "object",
        description: "Transaction",
        optional: true,
      },
      {
        name: "ipfs",
        type: "string",
        description: "Off-chain NFT state",
        url: `https://gateway.pinata.cloud/ipfs/${item?.ipfs}`,
      },
      {
        name: "metadataRootKind",
        type: "string",
        description: "Metadata root (kind)",
      },
      {
        name: "metadataRootData",
        type: "string",
        description: "Metadata root (data)",
      },
    ],
  };

  const elements = [];

  for (const field of TransactionJsonFields.values) {
    const key = field.name;
    if (item[key] !== undefined) {
      switch (field.type) {
        case "string":
          if (field.url !== undefined) {
            elements.push(
              <Descriptions.Item label={field.description}>
                {/*eslint-disable-next-line react/jsx-no-target-blank*/}
                <a href={field.url} target="_blank">
                  {item[key]?.toString() ?? ""}
                </a>
              </Descriptions.Item>
            );
          } else {
            elements.push(
              <Descriptions.Item label={field.description}>
                {item[key]?.toString() ?? ""}
              </Descriptions.Item>
            );
          }
          break;
        case "number":
          elements.push(
            <Descriptions.Item label={field.description}>
              {item[key]?.toString() ?? ""}
            </Descriptions.Item>
          );
          break;
        case "time":
          elements.push(
            <Descriptions.Item label={field.description}>
              {Date(item[key])?.toLocaleString() ?? ""}
            </Descriptions.Item>
          );
          break;
        default:
      }
    }
  }
}
