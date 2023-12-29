import { PublicKey, Field, Poseidon } from "o1js";
import {
  MinaNFT,
  MINANFT_NAME_SERVICE,
  MinaNFTContract,
  MinaNFTNameServiceContract,
} from "minanft";
import { MerkleMap, fetchAccount } from "o1js";

export async function check(json) {
  MinaNFT.minaInit("testworld2");
  if (
    json.proof === undefined ||
    json.proof.publicInput === undefined ||
    json.proof.publicInput.length !== 6 ||
    json.keys === undefined ||
    json.keys.length !== parseInt(json.proof?.publicInput[5])
  ) {
    console.log("JSON proof error", json.proof);
    return false;
  }
  const data = new MerkleMap();
  const kind = new MerkleMap();
  let hash = Field(0);
  const str = MinaNFT.stringToField("string");
  for (let i = 0; i < json.keys.length; i++) {
    console.log("item", json.keys[i]);
    const key = MinaNFT.stringToField(json.keys[i].key);
    const value = MinaNFT.stringToField(json.keys[i].value);
    data.set(key, value);
    kind.set(key, str);
    /*
     hash: Poseidon.hash([
        element.key,
        element.value.data,
        element.value.kind,
      ]),
      hash: state1.hash.add(state2.hash),
      */
    hash = hash.add(Poseidon.hash([key, value, str]));
  }
  if (
    data.getRoot().toJSON() !== json.proof?.publicInput[2] ||
    kind.getRoot().toJSON() !== json.proof?.publicInput[3] ||
    hash.toJSON() !== json.proof?.publicInput[4]
  ) {
    console.log(
      "redacted metadata check error",
      data.getRoot().toJSON(),
      json.proof?.publicInput[2],
      kind.getRoot().toJSON(),
      json.proof?.publicInput[3]
    );
    return false;
  }
  const nameServiceAddress = PublicKey.fromBase58(MINANFT_NAME_SERVICE);
  const zkNames = new MinaNFTNameServiceContract(nameServiceAddress);
  const zkApp = new MinaNFTContract(
    PublicKey.fromBase58(json.address),
    zkNames.token.id
  );
  await fetchAccount({ publicKey: zkApp.address, tokenId: zkNames.token.id });
  const metadata = zkApp.metadata.get();
  const version = zkApp.version.get();
  if (
    metadata.data.toJSON() !== json.proof?.publicInput[0] ||
    metadata.kind.toJSON() !== json.proof?.publicInput[1] ||
    version.toJSON() !== json.version.toString()
  ) {
    console.log(
      "metadata check error",
      metadata.data.toJSON(),
      json.proof?.publicInput[0],
      metadata.kind.toJSON(),
      json.proof?.publicInput[1],
      version.toJSON(),
      json.version.toString()
    );
    return false;
  }

  return true;
}
