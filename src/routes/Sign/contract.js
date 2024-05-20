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
import { SignTestContract } from "minanft";

export async function contract(a, b) {
  console.log("Summing", a, b);
  const field1 = Field(a);
  console.log("Field1", field1.toJSON());
  const field2 = Field(b);
  console.log("Field2", field2.toJSON());
  const result = field1.add(field2);
  console.log("Result", result.toJSON());
  const resultNumber = Number(result.toBigInt());
  console.log("ResultNumber", resultNumber);
  console.log("Compiling contract");
  console.time("Compiled");
  await SignTestContract.compile();
  console.timeEnd("Compiled");
  return { isCalculated: true, hash: resultNumber };
}
