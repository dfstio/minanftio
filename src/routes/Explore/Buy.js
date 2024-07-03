import React, { useState } from "react";
import { Button, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { updateAddress } from "../../appRedux/actions";
import { minaLogin } from "../../blockchain/mina";
import IntlMessages from "util/IntlMessages";
import { buyNFT } from "../../mint/buy";
import { waitForTransaction } from "../../mint/send";

import logger from "../../serverless/logger";
const logm = logger.info.child({
  winstonModule: "Algolia",
  winstonComponent: "Buy",
});

const DEBUG = "true" === process.env.REACT_APP_DEBUG;

const BuyButton = ({ item }) => {
  const [working, setWorking] = useState(false);
  const address = useSelector(({ blockchain }) => blockchain.address);
  const dispatch = useDispatch();

  const log = logm.child({ wf: "BuyButton", item, address });

  async function buy() {
    if (DEBUG) console.log("SellButton onClick", item);
    setWorking(true);
    const newAddress = await minaLogin();
    dispatch(updateAddress(newAddress));
    if (newAddress === "" || newAddress === undefined) {
      setWorking(false);
      return;
    }
    let buyResult = await buyNFT({
      name: item.name,
      price: Number(item.price),
      buyer: newAddress,
      address: item.address,
    });
    if (DEBUG) console.log("BuyButton buyResult", buyResult);
    const jobId = buyResult.jobId;
    buyResult = await waitForTransaction(jobId);
    if (DEBUG) console.log("BuyButton tx buyResult", buyResult);
    setWorking(false);
  }

  return (
    <Button type="primary" onClick={buy} loading={working}>
      <IntlMessages id="sidebar.algolia.buy" />
    </Button>
  );
};

export default BuyButton;
