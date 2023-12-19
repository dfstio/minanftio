import React from "react";
import { Button, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { updateAddress, updatePublicKey } from "../../appRedux/actions";
import { minaLogin } from "../../blockchain/mina";
import { PrivateKey, Poseidon } from "o1js";
import {
  MinaNFT,
  MapData,
  MinaNFTNameService,
  accountBalanceMina,
  makeString,
  Memory,
  api,
} from "minanft";

import IntlMessages from "util/IntlMessages";

import logger from "../../serverless/logger";

const logm = logger.info.child({ winstonModule: "Verify" });
const { REACT_APP_DEBUG, REACT_APP_PINATA_JWT, REACT_APP_JWT } = process.env;

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

  async function mintNFTapi() {
    const blockchainInstance = "testworld2";
    const includeFiles = false;
    const pinataJWT = REACT_APP_PINATA_JWT;
    MinaNFT.minaInit(blockchainInstance);

    const ownerPrivateKey = PrivateKey.random();
    const ownerPublicKey = ownerPrivateKey.toPublicKey();
    const owner = Poseidon.hash(ownerPublicKey.toFields());

    const nft = new MinaNFT({ name: `@test_${makeString(20)}`, owner });
    nft.updateText({
      key: `description`,
      text: "This is my long description of the NFT. Can be of any length, supports markdown.",
    });
    nft.update({ key: `twitter`, value: `@builder` });
    nft.update({ key: `secret`, value: `mysecretvalue`, isPrivate: true });
    if (includeFiles)
      await nft.updateImage({
        filename: "./images/image.jpg",
        pinataJWT,
      });
    /*
    await nft.updateFile({
      key: "sea",
      filename: "./images/sea.png",
      pinataJWT,
    });
    */
    const map = new MapData();
    map.update({ key: `level2-1`, value: `value21` });
    map.update({ key: `level2-2`, value: `value22` });
    map.updateText({
      key: `level2-3`,
      text: `This is text on level 2. Can be very long`,
    });
    /*
    await map.updateFile({
      key: "woman",
      filename: "./images/woman.png",
      pinataJWT,
    });
    */
    const mapLevel3 = new MapData();
    mapLevel3.update({ key: `level3-1`, value: `value31` });
    mapLevel3.update({ key: `level3-2`, value: `value32`, isPrivate: true });
    mapLevel3.update({ key: `level3-3`, value: `value33` });
    map.updateMap({ key: `level2-4`, map: mapLevel3 });
    nft.updateMap({ key: `level 2 and 3 data`, map });
    const data = nft.exportToString({
      increaseVersion: false,
      includePrivateData: true,
    });
    console.log("data", data);
    Memory.info(`created`);
    const minanft = new api(REACT_APP_JWT);
    const uri = nft.exportToString({
      increaseVersion: true,
      includePrivateData: false,
    });
    //console.log("uri", uri);
    const result = await minanft.mint({ uri });
    console.log("mint result", result);
    Memory.info(`minted`);
  }

  async function mintNFT() {
    const DEPLOYER = "";
    const NAMES_ORACLE_SK = "";
    const PINATA_JWT = "";
    const keys = MinaNFT.minaInit("local");
    const deployer = keys
      ? keys[0].privateKey
      : PrivateKey.fromBase58(DEPLOYER);
    const oraclePrivateKey = keys
      ? PrivateKey.random()
      : PrivateKey.fromBase58(NAMES_ORACLE_SK);
    //const nameServiceAddress = PublicKey.fromBase58(MINANFT_NAME_SERVICE);

    const ownerPrivateKey = PrivateKey.random();
    const ownerPublicKey = ownerPrivateKey.toPublicKey();
    const owner = Poseidon.hash(ownerPublicKey.toFields());
    const pinataJWT = PINATA_JWT;

    console.log(
      `Deployer balance: ${await accountBalanceMina(deployer.toPublicKey())}`
    );

    const nft = new MinaNFT({ name: `@test` + makeString(10) });
    nft.updateText({
      key: `description`,
      text: "This is my long description of the NFT. Can be of any length, supports markdown.",
    });
    nft.update({ key: `twitter`, value: `@builder` });
    nft.update({ key: `secret`, value: `mysecretvalue`, isPrivate: true });

    /*
    await nft.updateImage({
      filename: "./images/navigator.jpg",
      pinataJWT,
    });
  
    const map = new MapData();
    map.update({ key: `level2-1`, value: `value21` });
    map.update({ key: `level2-2`, value: `value22` });
    map.updateText({
      key: `level2-3`,
      text: `This is text on level 2. Can be very long`,
    });
  
    await map.updateFile({
      key: "woman",
      filename: "./images/woman.png",
      pinataJWT,
    });
  
    
  
    const mapLevel3 = new MapData();
    mapLevel3.update({ key: `level3-1`, value: `value31` });
    mapLevel3.update({ key: `level3-2`, value: `value32`, isPrivate: true });
    mapLevel3.update({ key: `level3-3`, value: `value33` });
    map.updateMap({ key: `level2-4`, map: mapLevel3 });
    nft.updateMap({ key: `level 2 and 3 data`, map });
    */

    console.log(`json:`, JSON.stringify(nft.toJSON(), null, 2));
    console.log("Compiling...");
    await MinaNFT.compile();

    const nameService = new MinaNFTNameService({ oraclePrivateKey });
    let tx = await nameService.deploy(deployer);
    if (tx === undefined) {
      throw new Error("Deploy failed");
    }
    await MinaNFT.wait(tx);

    /*
    const nameService = new MinaNFTNameService({
      oraclePrivateKey,
      address: nameServiceAddress,
    });
    
    */
    tx = await nft.mint({
      deployer,
      owner,
      pinataJWT,
      nameService,
    });
    if (tx === undefined) {
      throw new Error("Mint failed");
    }
    console.log("Waiting for transaction to be included in a block...");
    console.time("Transaction included in a block");
    await MinaNFT.wait(tx);
    console.timeEnd("Transaction included in a block");
  }

  async function connect() {
    log.info("Connect clicked", { address, wf: "connect" });

    const newAddress = await minaLogin();
    console.log("newAddress", newAddress);
    dispatch(updateAddress(newAddress));

    /*
    const network = Mina.Network({
      mina: "https://proxy.testworld.minaexplorer.com/graphql",
    });

    Mina.setActiveInstance(network);

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

    const balanceMina = await accountBalanceMina(publicKey);
    console.log("balanceMina", balanceMina, makeString(12));

    */
    await mintNFTapi();
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
