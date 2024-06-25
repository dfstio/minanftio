import React from "react";
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
  const address = useSelector(({ blockchain }) => blockchain.address);
  const dispatch = useDispatch();

  async function sell() {
    if (DEBUG) console.log("SellButton onClick", item);
    if (address === "") {
      const newAddress = await minaLogin();
      dispatch(updateAddress(newAddress));
    }
    let sellResult = await sellNFT({
      name: item.name,
      price: Number(item.price ?? 100) + 10,
      owner: address,
      address: item.address,
    });
    console.log("SellButton sellResult", sellResult);
    const jobId = sellResult.jobId;
    sellResult = await waitForTransaction(jobId);
    console.log("SellButton tx sellResult", sellResult);
  }

  const log = logm.child({ wf: "SellButton", item, address });

  return (
    <Button type="primary" onClick={sell}>
      <IntlMessages id="sidebar.algolia.sell" />
    </Button>
  );
};

export default SellButton;
