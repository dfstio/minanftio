import { PublicKey, Mina, Field, fetchAccount } from "o1js";
import { SignTestContract, accountBalanceMina, initBlockchain } from "minanft";

export async function contract(value, address) {
  console.log("Contract", { value, address });
  const fieldValue = Field(value);
  await initBlockchain("devnet");

  const sender = PublicKey.fromBase58(address);
  console.log("Sender", sender.toBase58());
  console.log("Sender balance", await accountBalanceMina(sender));
  const zkAppPublicKey = PublicKey.fromBase58(
    "B62qk7nXjEzGJdyQFNVs5UauASTQJgiJSBpHJmDcFTiYQrDDTGDsNFT"
  );

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
  const txResult = await window.mina?.sendTransaction({
    transaction,
    onlySign: true,
    feePayer: {
      fee: fee,
      memo: memo,
    },
  });
  const signedData = txResult?.signedData;
  const signedDataJson = JSON.parse(signedData);
  console.log("SignedDataJson", signedDataJson);

  tx.transaction.feePayer.authorization =
    signedDataJson.zkappCommand.feePayer.authorization;
  console.log("TxSigned", tx);
  console.time("ProvedAndSent");
  console.log("Compiling contract");
  console.time("Compiled");
  await SignTestContract.compile();
  console.timeEnd("Compiled");
  console.time("Proved");
  await tx.prove();
  console.timeEnd("Proved");
  const txSent = await tx.send();
  console.log("TxSent", txSent);
  const hash = txSent?.hash;
  console.timeEnd("ProvedAndSent");
  console.log("Hash", hash);

  return { isCalculated: true, hash: hash };
}
