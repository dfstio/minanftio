import React from "react";
import { Button, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { updateAddress } from "../../appRedux/actions";
import { minaLogin } from "../../blockchain/mina";
import IntlMessages from "util/IntlMessages";

import logger from "../../serverless/logger";
const logm = logger.info.child({
  winstonModule: "Algolia",
  winstonComponent: "Buy",
});

const DEBUG = "true" === process.env.REACT_APP_DEBUG;

const BuyButton = ({ item }) => {
  const address = useSelector(({ blockchain }) => blockchain.address);
  const dispatch = useDispatch();

  const log = logm.child({ wf: "BuyButton", item, address });

  return (
    <Button type="primary">
      <IntlMessages id="sidebar.algolia.buy" />
    </Button>
  );
};

export default BuyButton;
