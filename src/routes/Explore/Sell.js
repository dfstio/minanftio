import React, { useState } from "react";
import { Button, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { updateAddress } from "../../appRedux/actions";
import { minaLogin } from "../../blockchain/mina";
import IntlMessages from "util/IntlMessages";
import { sellNFT } from "../../mint/sell";
import { waitForTransaction } from "../../mint/send";

import logger from "../../serverless/logger";
const logm = logger.info.child({
  winstonModule: "Algolia",
  winstonComponent: "Buy",
});

const DEBUG = "true" === process.env.REACT_APP_DEBUG;

const SellButton = ({ item }) => {
  const [working, setWorking] = useState(false);
  const address = useSelector(({ blockchain }) => blockchain.address);
  const dispatch = useDispatch();

  async function sell() {
    if (DEBUG) console.log("SellButton onClick", item);
    setWorking(true);
    const newAddress = await minaLogin();
    dispatch(updateAddress(newAddress));
    if (newAddress === "" || newAddress === undefined) {
      setWorking(false);
      return;
    }
    let sellResult = await sellNFT({
      name: item.name,
      price: Number(item.price ?? 100000000000) + 10000000000,
      owner: newAddress,
      address: item.address,
    });
    if (DEBUG) console.log("SellButton sellResult", sellResult);
    const jobId = sellResult.jobId;
    sellResult = await waitForTransaction(jobId);
    if (DEBUG) console.log("SellButton tx sellResult", sellResult);
    setWorking(false);
  }

  const log = logm.child({ wf: "SellButton", item, address });

  return (
    <Button type="primary" onClick={sell} loading={working}>
      <IntlMessages id="sidebar.algolia.sell" />
    </Button>
  );
};

export default SellButton;
