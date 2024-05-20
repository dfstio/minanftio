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
import { SignTestContract, accountBalanceMina } from "minanft";

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
  console.log("Compiling contract");
  console.time("Compiled");
  await SignTestContract.compile();
  console.timeEnd("Compiled");
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
  await tx.prove();
  const transaction = tx.toJSON();
  const txResult = await window.mina?.sendTransaction({
    transaction,
    feePayer: {
      fee: fee,
      memo: memo,
    },
  });
  console.log("txResult", txResult);
  const hash = txResult?.hash;

  return { isCalculated: true, hash };
}
