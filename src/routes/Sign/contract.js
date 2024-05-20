import {
  PublicKey,
  Mina,
  TokenId,
  PrivateKey,
  DynamicProof,
  Proof,
  VerificationKey,
  Void,
  ZkProgram,
  Field,
  SmartContract,
  Struct,
  method,
  AccountUpdate,
  fetchAccount,
  state,
  State,
} from "o1js";
import { SignTestContract, accountBalanceMina, initBlockchain } from "minanft";

export async function contract(value, address) {
  console.log("Contract", { value, address });
  const fieldValue = Field(value);
  console.log("FieldValue", fieldValue.toJSON());
  const field2 = Field(10);
  console.log("Field2", field2.toJSON());
  const result = fieldValue.add(field2);
  console.log("Result", result.toJSON());
  const resultNumber = Number(result.toBigInt());
  console.log("ResultNumber", resultNumber);
  await initBlockchain("devnet");

  const sender = PublicKey.fromBase58(address);
  console.log("Sender", sender.toBase58());
  console.log("Sender balance", await accountBalanceMina(sender));
  const zkAppPublicKey = PublicKey.fromBase58(
    "B62qk7nXjEzGJdyQFNVs5UauASTQJgiJSBpHJmDcFTiYQrDDTGDsNFT"
  );
  const zkApp = new SignTestContract(zkAppPublicKey);
  await fetchAccount({ publicKey: zkAppPublicKey });
  await fetchAccount({ publicKey: sender });
  const fee = 200_000_000;
  const memo = `value: ${value}`;
  const tx = await Mina.transaction({ sender, fee, memo }, async () => {
    await zkApp.setValue(fieldValue);
  });
  console.log("Tx", tx);
  console.log("Tx pretty", tx.toPretty());

  const transaction = tx.toJSON();
  const txResult = await window.mina?.sendTransaction({
    transaction,
    onlySign: true,
    feePayer: {
      fee: fee,
      memo: memo,
    },
  });
  console.log("txResult", txResult);
  const signedData = txResult?.signedData;
  console.log("SignedData", signedData);
  const signedDataJson = JSON.parse(signedData);
  console.log("SignedDataJson", signedDataJson);

  //const txSigned = Mina.Transaction.fromJSON(signedDataJson);
  tx.transaction.feePayer.authorization =
    signedDataJson.zkappCommand.feePayer.authorization;
  console.log("TxSigned", tx.toPretty());
  console.log("TxSigned Pretty ", tx);
  console.log("Compiling contract");
  console.time("Compiled");
  await SignTestContract.compile();
  console.timeEnd("Compiled");
  await tx.prove();
  const txSent = await tx.send();
  console.log("TxSent", txSent);
  const hash = txSent?.hash;
  console.log("Hash", hash);

  return { isCalculated: true, hash: hash };
}
