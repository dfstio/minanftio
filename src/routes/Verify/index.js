import React from "react";
import { Button, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { updateAddress, updatePublicKey } from "../../appRedux/actions";
import { minaLogin } from "../../blockchain/mina";
import { PrivateKey, Poseidon, PublicKey } from "o1js";
import {
  MinaNFT,
  MapData,
  MinaNFTNameService,
  accountBalanceMina,
  makeString,
  api,
} from "minanft";

import IntlMessages from "util/IntlMessages";

import logger from "../../serverless/logger";
import { minaInit } from "../../blockchain/init";

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
    if (address === undefined || address === "") {
      console.error("Address is undefined");
      return;
    }
    const includeFiles = false;
    const pinataJWT = REACT_APP_PINATA_JWT;
    minaInit();

    const name = "@test_" + makeString(10);
    const ownerPublicKey = PublicKey.fromBase58(address);
    const nftPrivateKey = PrivateKey.random();
    const nftPublicKey = nftPrivateKey.toPublicKey();
    const owner = Poseidon.hash(ownerPublicKey.toFields());

    const nft = new MinaNFT({ name, owner });
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
    const data = nft.toJSON({
      increaseVersion: false,
      includePrivateData: true,
    });
    console.log("data", data);
    const minanft = new api(REACT_APP_JWT);
    const reserved = await minanft.reserveName({
      name,
      publicKey: nftPublicKey.toBase58(),
    });
    console.log("Reserved:", reserved);

    const uri = nft.toJSON({
      increaseVersion: true,
      includePrivateData: false,
    });

    const result = await minanft.mint({
      uri,
      signature: reserved.signature,
      privateKey: nftPrivateKey.toBase58(),
    });
    console.log("mint result", result);
    const jobId = result.jobId;
    if (jobId === undefined) {
      console.error("JobId is undefined");
      return;
    }

    const txData = await minanft.waitForJobResult({ jobId });
    console.log("txData", txData);
  }

  async function mintNFTLocal() {
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
