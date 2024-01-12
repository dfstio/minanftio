import React, { useEffect, useCallback } from "react";
import { isMobile } from "react-device-detect";
import { useDispatch, useSelector } from "react-redux";
import { message } from "antd";
import {
  updateAddress,
  updateVirtuosoBalance,
  updatePublicKey,
} from "../appRedux/actions";
import {
  minaLogin,
  initAccount,
  getVirtuosoBalance,
  //getVirtuosoPublicKey,
  convertAddress,
  getAddress,
  initVirtuoso,
} from "./mina";

const {
  URL,
  REACT_APP_NETWORK_EXPLORER,
  REACT_APP_NETWORK_HEXCHAIN_ID,
  REACT_APP_NETWORK_NAME,
} = process.env;
const DEBUG = "true" === process.env.REACT_APP_DEBUG;

const MinaAccount = () => {
  const address = useSelector(({ blockchain }) => blockchain.address);
  const username = useSelector(({ blockchain }) => blockchain.username);
  const dispatch = useDispatch();

  let metamaskText = "CONNECT WITH AURO";
  let usernameText = "";
  let topup = "";
  let blockExplorer = "";

  useEffect(() => {
    async function fetchAddress() {
      const newAddress = await getAddress();
      dispatch(updateAddress(newAddress));
      //const newVirtuosoBalance = await getVirtuosoBalance(newAddress);
      //const newPublicKey = await getVirtuosoPublicKey(newAddress);
      //dispatch(updateVirtuosoBalance(newVirtuosoBalance));
      //dispatch(updatePublicKey(newPublicKey));
      //if(DEBUG) console.log(`useEffect Address ${newAddress} virtuosoBalance ${newVirtuosoBalance} publicKey ${newPublicKey}`);
    }
    fetchAddress();
  }, [dispatch]);

  if (DEBUG) console.log(`Address ${address} ${username}`);

  let result = (
    <ul className="gx-login-list">
      <li
        onClick={async () => {
          if (DEBUG) console.log("Connect to MetaMask clicked");
          const newAddress = await minaLogin();
          dispatch(updateAddress(newAddress));
        }}
      >
        {metamaskText}
      </li>
    </ul>
  );

  if (address !== undefined && address !== "") {
    metamaskText = address.slice(0, 6) + "..." + address.slice(51, 55);
    usernameText = username ? username : "";
    blockExplorer = "https://minascan.io/testworld/account/" + address;
    result = (
      <ul className="gx-login-list">
        <li
          onClick={async () => {
            window.open(blockExplorer);
          }}
        >
          {metamaskText}
        </li>
        <li>{username}</li>
      </ul>
    );
  }
  return result;
};

export default MinaAccount;
