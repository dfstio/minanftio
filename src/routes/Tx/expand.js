import { Descriptions } from "antd";

export function expandTx(item = undefined) {
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
      {
        name: "name",
        type: "string",
        description: "NFT name",
        url: item?.ipfs ? `https://minanft.io/nft/i${item?.ipfs}` : undefined,
      },
      { name: "operation", type: "string", description: "Operation" },
      {
        name: "address",
        type: "string",
        description: "NFT owner's address",
        url: `https://zekoscan.io/devnet/account/${item?.address}`,
      },
      { name: "expiry", type: "time", description: "Expiry date" },
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
  if (item === undefined) return { name: TransactionJsonFields.name, elements };

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
          console.log("Time", item[key]);
          console.log("Time", new Date(item[key]).toLocaleString());
          elements.push(
            <Descriptions.Item label={field.description}>
              {new Date(item[key])?.toLocaleString() ?? ""}
            </Descriptions.Item>
          );
          break;
        default:
      }
    }
  }
  return { name: TransactionJsonFields.name, elements };
}

export function expandBlock(item = undefined) {
  /* item is a BlockJson object
  
  export interface BlockJson {
  blockNumber: number;
  blockAddress: string;
  chain: string;
  contractAddress: string;
  blockProducer: string;
  root: string;
  oldRoot: string;
  ipfs: string;
  isValidated: boolean;
  isInvalid: boolean;
  isProved: boolean;
  isFinal: boolean;
  timeCreated: number;
  txsCount: number;
  invalidTxsCount: number;
  txsHash: string;
  previousBlockAddress: string;
  previousValidBlockAddress: string;
  transactions?: BlockTransaction[];
  database: string;
  map: string;
}
  */

  const BlockJsonFields = {
    name: "Block data",
    values: [
      { name: "blockNumber", type: "number", description: "Block number" },
      { name: "blockAddress", type: "string", description: "Block address" },
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
        name: "blockProducer",
        type: "string",
        description: "Block producer",
        url: `https://zekoscan.io/devnet/account/${item?.blockProducer}/txs?type=zk-acc`,
      },
      { name: "root", type: "string", description: "Merkle Map root" },
      {
        name: "oldRoot",
        type: "string",
        description: "Previous Merkle Map root",
      },
      {
        name: "ipfs",
        type: "string",
        description: "Off-chain state",
        url: `https://gateway.pinata.cloud/ipfs/${item?.ipfs}`,
      },
      { name: "isValidated", type: "boolean", description: "Is validated" },
      { name: "isInvalid", type: "boolean", description: "Is invalid" },
      { name: "isProved", type: "boolean", description: "Is proved" },
      { name: "isFinal", type: "boolean", description: "Is final" },
      { name: "timeCreated", type: "time", description: "Time created" },
      {
        name: "txsCount",
        type: "number",
        description: "Number of transactions",
      },
      {
        name: "invalidTxsCount",
        type: "number",
        description: "Number of invalid transactions",
      },
      { name: "txsHash", type: "string", description: "Transactions hash" },
      {
        name: "previousBlockAddress",
        type: "string",
        description: "Previous block address",
        url: `https://zekoscan.io/devnet/account/${item?.previousBlockAddress}/txs?type=zk-acc`,
      },
      {
        name: "previousValidBlockAddress",
        type: "string",
        description: "Previous valid block address",
        url: `https://zekoscan.io/devnet/account/${item?.previousValidBlockAddress}/txs?type=zk-acc`,
      },
      {
        name: "database",
        type: "string",
        description: "Database off-chain state",
        url: `https://gateway.pinata.cloud/ipfs/${item?.database?.slice(2)}`,
      },
      {
        name: "map",
        type: "string",
        description: "Merkle Map off-chain state",
        url: `https://gateway.pinata.cloud/ipfs/${item?.map?.slice(2)}`,
      },
      {
        name: "transactions",
        type: "array",
        description: "Transactions",
        optional: true,
      },
    ],
  };

  const elements = [];
  if (item === undefined) return { name: BlockJsonFields.name, elements };

  for (const field of BlockJsonFields.values) {
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
              {new Date(item[key])?.toLocaleString() ?? ""}
            </Descriptions.Item>
          );
          break;
        default:
      }
    }
  }
  return { name: BlockJsonFields.name, elements };
}

export function expandBlockHistory(item = undefined) {
  /* item is a BlockHistory object

  interface BlockHistory {
    chain: string;
    contractAddress: string;
    blockHash: string;
    blockNumber: number;
    event: string;
    txId: string;
    memo: string;
    time: number;
  }
   */

  const BlockHistoryFields = {
    name: "Block Event",
    values: [
      { name: "chain", type: "string", description: "Chain" },
      {
        name: "contractAddress",
        type: "string",
        description: "Contract address",
        url: `https://zekoscan.io/devnet/account/${item?.contractAddress}/txs?type=zk-acc`,
      },
      { name: "blockHash", type: "string", description: "Block hash" },
      { name: "event", type: "string", description: "Event" },
      {
        name: "txId",
        type: "string",
        description: "Transaction ID",
        url: `https://zekoscan.io/devnet/tx/${item?.txId}?type=zk-tx`,
      },
      { name: "memo", type: "string", description: "Memo" },
      { name: "time", type: "time", description: "Time" },
    ],
  };

  const elements = [];
  if (item === undefined) return { name: BlockHistoryFields.name, elements };

  for (const field of BlockHistoryFields.values) {
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
              {new Date(item[key])?.toLocaleString() ?? ""}
            </Descriptions.Item>
          );
          break;
        default:
      }
    }
  }
  console.log(elements);
  return { name: BlockHistoryFields.name, elements };
}

export function expandTxHistory(item = undefined) {
  /* item is a TransactionHistory object
export interface TransactionHistory {
  chain: string;
  contractAddress: string;
  txId: string;
  status: string;
  blockNumber?: number;
  reason?: string;
  time: number;
}
*/

  const TransactionHistoryFields = {
    name: "Transaction event",
    values: [
      { name: "chain", type: "string", description: "Chain" },
      {
        name: "contractAddress",
        type: "string",
        description: "Contract address",
        url: `https://zekoscan.io/devnet/account/${item?.contractAddress}/txs?type=zk-acc`,
      },
      { name: "txId", type: "string", description: "Transaction ID" },
      { name: "status", type: "string", description: "Status" },
      {
        name: "blockNumber",
        type: "number",
        description: "Block number",
        optional: true,
      },
      { name: "reason", type: "string", description: "Reason", optional: true },
      { name: "time", type: "time", description: "Time" },
    ],
  };

  const elements = [];
  if (item === undefined)
    return { name: TransactionHistoryFields.name, elements };

  for (const field of TransactionHistoryFields.values) {
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
              {new Date(item[key])?.toLocaleString() ?? ""}
            </Descriptions.Item>
          );
          break;
        default:
      }
    }
  }
  return { name: TransactionHistoryFields.name, elements };
}
