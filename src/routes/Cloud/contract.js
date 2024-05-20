import { PublicKey, Mina, Field, fetchAccount } from "o1js";
import { SignTestContract, accountBalanceMina, initBlockchain } from "minanft";
import { serializeTransaction } from "./serialize";
import { sendTransaction } from "./send";

export async function contract(value, address) {
  console.log("Contract", { value, address });
  const fieldValue = Field(value);
  await initBlockchain("devnet");

  const sender = PublicKey.fromBase58(address);
  console.log("Sender", sender.toBase58());
  console.log("Sender balance", await accountBalanceMina(sender));
  const contractAddress =
    "B62qk7nXjEzGJdyQFNVs5UauASTQJgiJSBpHJmDcFTiYQrDDTGDsNFT";
  const zkAppPublicKey = PublicKey.fromBase58(contractAddress);

  console.time("transaction created");
  const zkApp = new SignTestContract(zkAppPublicKey);
  await fetchAccount({ publicKey: zkAppPublicKey });
  await fetchAccount({ publicKey: sender });
  const fee = 200_000_000;
  const memo = `value: ${value}`;
  const tx = await Mina.transaction({ sender, fee, memo }, async () => {
    await zkApp.setValue(Field(value));
  });
  console.timeEnd("transaction created");
  console.log("Tx created", tx);

  const transaction = tx.toJSON();
  const serializedTransaction = serializeTransaction(tx);
  const txResult = await window.mina?.sendTransaction({
    transaction,
    onlySign: true,
    feePayer: {
      fee: fee,
      memo: memo,
    },
  });
  const signedData = txResult?.signedData;
  const result = await sendTransaction({
    serializedTransaction,
    signedData,
    contractAddress,
    address,
    value,
  });
  console.log("Result", result);

  return result;
}
