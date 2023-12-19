import React from "react";
import { Button, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { updateAddress, updatePublicKey } from "../../appRedux/actions";
import { minaLogin } from "../../blockchain/mina";
//import { Field, fetchAccount, PublicKey, Mina } from "o1js";
import { makeString } from "minanft";

import IntlMessages from "util/IntlMessages";

import logger from "../../serverless/logger";

const logm = logger.info.child({ winstonModule: "Verify" });
const { REACT_APP_DEBUG } = process.env;

const Verify = () => {
  const address = useSelector(({ blockchain }) => blockchain.address);
  const publicKey = useSelector(({ blockchain }) => blockchain.publicKey);
  const balance = useSelector(({ blockchain }) => blockchain.balance);
  const virtuosoBalance = useSelector(
    ({ blockchain }) => blockchain.virtuosoBalance
  );
  const dispatch = useDispatch();

  const log = logm.child({ winstonComponent: "Verify" });

  let vb = "$0";
  let showWithdaw = false;
  if (virtuosoBalance !== undefined) {
    const vb1 = virtuosoBalance / 100;
    vb = " $" + vb1.toString();
    if (vb1 > 100) showWithdaw = true;
  }

  let pb = " is not registered";
  if (publicKey !== undefined && publicKey !== "") pb = " is " + publicKey;

  async function register() {
    log.info("Register clicked", { address, wf: "register" });

    if (address !== undefined && address !== "") {
      log.profile(`Registered public key of address ${address}`);
      const key = "RegisterPublicKey";
      message.loading({
        content: `Please provide public key in Metamask and confirm transaction`,
        key,
        duration: 60,
      });

      /*
      const result = await virtuosoRegisterPublicKey(address);
      if (result.publicKey !== "" && result.hash !== "") {
        dispatch(updatePublicKey(result.publicKey));
        message.success({
          content: `Public key ${result.publicKey} is written to blockchain with transaction ${result.hash}`,
          key,
          duration: 10,
        });
      } else
        message.error({
          content: `Public key is not provided or written to blockchain`,
          key,
          duration: 10,
        });
      log.profile(`Registered public key of address ${address}`, {
        address,
        result,
        wf: "register",
      });
      */
    }
  }

  async function test() {
    //logger.meta.address = address;
    log.info("Test error clicked", { address, wf: "testerror" });
    try {
      throw new Error({ message: "errortest" });
    } catch (error) {
      // return error
      log.error("catch", { error });
    }
  }

  async function connect() {
    log.info("Connect clicked", { address, wf: "connect" });
    /*
    const { Field, fetchAccount, PublicKey, Mina } = await import("o1js");

    const network = Mina.Network({
      mina: "https://proxy.testworld.minaexplorer.com/graphql",
    });

    Mina.setActiveInstance(network);
    */
    const newAddress = await minaLogin();
    console.log("newAddress", newAddress);
    dispatch(updateAddress(newAddress));
    /*

    const a = Field(7);
    const b = Field(3);
    const c = a.add(b);
    console.log("a", a.toJSON());
    console.log("b", b.toJSON());
    console.log("c", c.toJSON());
    const publicKey = PublicKey.fromBase58(newAddress);
    console.log("publicKey", publicKey.toBase58());
    const acc = await fetchAccount({ publicKey });
    console.log("acc", acc);
    let balance = "0";
    if (Mina.hasAccount(publicKey)) {
      balance = Mina.getBalance(publicKey).toJSON();
      console.log("balance", balance);
    } else {
      console.log("no account");
    }
    */
    //const balanceMina = await accountBalanceMina(publicKey);
    //const { makeString } = await import("minanft");
    const balanceMina = makeString(12);
    console.log("balanceMina", balanceMina);
  }

  return (
    <div>
      <h2 className="title gx-mb-4">
        <IntlMessages id="sidebar.verify" />
      </h2>
      <div className="gx-d-flex justify-content-center">
        <h4>
          You can verify any private file that was sealed to the Mina blockchain
          in the Mina NFT post
        </h4>
      </div>
      <div className="gx-d-flex justify-content-center">
        <Button type="primary" onClick={connect}>
          Connect
        </Button>
      </div>
    </div>
  );
};

export default Verify;
