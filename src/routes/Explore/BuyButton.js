import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Modal,
  Form,
  InputNumber,
  Input,
  Radio,
  Checkbox,
} from "antd";
import { footerAgreement, footerAgreementLink } from "../../util/config";
import { useDispatch, useSelector } from "react-redux";
import { updateAddress } from "../../appRedux/actions";
import { buyNFT } from "../../mint/buy";
import { waitForTransaction } from "../../mint/send";
import { minaLogin } from "../../blockchain/mina";
import { explorerTransaction } from "../../blockchain/explorer";

const DEBUG = "true" === process.env.REACT_APP_DEBUG;

const BuyButton = ({ item }) => {
  //class SellButton extends React.Component {

  const [modalText, setModalText] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("Buy NFT @" + item.name);
  const [price, setPrice] = useState(100);
  const [okDisabled, setOkDisabled] = useState(true);
  const address = useSelector(({ blockchain }) => blockchain.address);
  const dispatch = useDispatch();

  const showText = async (text) => {
    setModalText(text);
  };

  const showModal = async () => {
    setModalText("Preparing buy transaction...");
    setLoading(true);
    setVisible(true);

    const newAddress = await minaLogin();
    dispatch(updateAddress(newAddress));
    if (newAddress === "" || newAddress === undefined) {
      setVisible(false);
      return;
    }
    let buyResult = await buyNFT({
      name: item.name,
      price: Number(item.price),
      buyer: newAddress,
      address: item.address,
      showText,
    });
    if (buyResult.success === false || buyResult.jobId === undefined) {
      setModalText("Error: " + buyResult.error ?? "");
      return;
    }
    console.log("SellButton sellResult", buyResult);
    const jobId = buyResult.jobId;
    const jobInfo = (
      <span>
        Proving transaction, cloud prove job id:{" "}
        <a href={"https://minarollupscan.com/"} target="_blank">
          {jobId}
        </a>
        <br />
        You can close this form and check the transaction status later.
      </span>
    );

    setModalText(jobInfo);
    const txResult = await waitForTransaction(jobId);
    console.log("BuyButton tx sellResult", txResult);
    if (
      txResult.success &&
      txResult.hash !== undefined &&
      txResult.hash !== "" &&
      txResult.hash.toLowerCase().includes("error") === false
    ) {
      const txInfo = (
        <span>
          Buy transaction successfully sent with hash:{" "}
          <a href={explorerTransaction() + txResult.hash} target="_blank">
            {txResult.hash}
          </a>
          <br />
          You can close this form and wait for the transaction to be included in
          the block.
        </span>
      );
      setModalText(txInfo);
    } else {
      const txError = (
        <span>
          Error {txResult.hash ? ": " + txResult.hash : " sending transaction"}
          <br />
          Please try again later, after all the previous transactions are
          included in the block.
        </span>
      );
      setModalText("Error: " + txResult.error ?? "");
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleChange = (values) => {
    if (DEBUG) console.log("Sell values changed", values);
    if (values.price !== undefined) setPrice(values.price);
  };

  return (
    <div>
      <Button type="primary" onClick={showModal}>
        Buy
      </Button>
      <Modal
        title={title}
        visible={visible}
        confirmLoading={loading}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          onValuesChange={handleChange}
          layout="vertical"
          name="form_in_modal"
        >
          <Form.Item>
            <div
              className="gx-mt-0"
              style={{
                whiteSpace: "pre-wrap",
              }}
            >
              <span>
                Price: {item.price / 1_000_000_000} MINA
                <br />
                <br />
                By signing the transaction, you are confirming your agreement
                with our
              </span>
              <span>
                <a href={footerAgreementLink} target="_blank">
                  {footerAgreement}
                </a>
              </span>
            </div>
          </Form.Item>
          <p>{modalText}</p>
        </Form>
      </Modal>
    </div>
  );
};

export default BuyButton;
