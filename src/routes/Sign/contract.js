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
  const signedData = txResult?.signedTx;
  console.log("SignedData", signedData);
  const signedDataJson = JSON.parse(signedData);
  console.log("SignedDataJson", signedDataJson);
  const txSigned = Mina.Transaction.fromJSON(signedDataJson);
  console.log("TxSigned", txSigned.toPretty());
  console.log("Compiling contract");
  console.time("Compiled");
  await SignTestContract.compile();
  console.timeEnd("Compiled");
  await txSigned.prove();
  const txSent = await txSigned.send();
  const hash = txSent?.hash;

  return { isCalculated: true, hash };
}
