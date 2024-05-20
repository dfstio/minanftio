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

export function contract(a, b) {
  /*
  class SignTestContract extends SmartContract {
    @method async setValue(value: Field) {
      this.value.set(value);
    }
  }
  */
  console.log("Summing", a, b);
  const field1 = Field(a);
  console.log("Field1", field1.toJSON());
  const field2 = Field(b);
  console.log("Field2", field2.toJSON());
  const result = field1.add(field2);
  console.log("Result", result.toJSON());
  const resultNumber = Number(result.toBigInt());
  console.log("ResultNumber", resultNumber);
  return { isCalculated: true, hash: resultNumber };
}
