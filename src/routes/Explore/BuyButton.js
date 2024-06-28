import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Timeline } from "antd";
import { footerAgreement, footerAgreementLink } from "../../util/config";
import { useDispatch, useSelector } from "react-redux";
import { updateAddress } from "../../appRedux/actions";
import { buyNFT } from "../../nft/buy";
import { waitForTransaction } from "../../nft/send";
import { minaLogin } from "../../blockchain/mina";
import { explorerTransaction } from "../../blockchain/explorer";

const DEBUG = "true" === process.env.REACT_APP_DEBUG;

const BuyButton = ({ item }) => {
  //class SellButton extends React.Component {

  const [modalText, setModalText] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("Buy NFT @" + item.name);
  const [timeline, setTimeline] = useState([]);
  const [pending, setPending] = useState(undefined);
  const dispatch = useDispatch();

  const showText = async (text, color) => {
    setTimeline((prev) => {
      const newTimeline = prev;
      newTimeline.push({ text, color });
      return newTimeline;
    });
  };

  const showPending = async (text) => {
    setPending(text);
  };

  const showModal = async () => {
    setTimeline([]);
    setPending("Preparing buy transaction...");
    setLoading(true);
    setVisible(true);
    try {
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
        showPending,
      });
      if (buyResult.success === false || buyResult.jobId === undefined) {
        showText("Error: " + buyResult.error ?? "", "red");
        setPending(undefined);
        return;
      }
      console.log("SellButton sellResult", buyResult);
      const jobId = buyResult.jobId;
      await showText("Cloud proving job started", "green");
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

      setPending(jobInfo);
      const txResult = await waitForTransaction(jobId);
      console.log("BuyButton tx sellResult", txResult);
      if (
        txResult.success &&
        txResult.hash !== undefined &&
        txResult.hash !== "" &&
        txResult.hash.toLowerCase().includes("error") === false
      ) {
        const jobInfo = (
          <span>
            Sucessfully proved transaction, cloud prove job id:{" "}
            <a href={"https://minarollupscan.com/"} target="_blank">
              {jobId}
            </a>
            <br />
          </span>
        );
        await showText(jobInfo, "green");
        const txInfo = (
          <span>
            Buy transaction successfully sent with hash:{" "}
            <a href={explorerTransaction() + txResult.hash} target="_blank">
              {txResult.hash}
            </a>
            <br />
            You can close this form and wait for the transaction to be included
            in the block.
          </span>
        );
        await showText(txInfo, "green");
        setPending(undefined);
      } else {
        const txError = (
          <span>
            Error{" "}
            {txResult.hash ? ": " + txResult.hash : " sending transaction"}
            <br />
            Please try again later, after all the previous transactions are
            included in the block.
          </span>
        );
        await showText(txError, "red");
        setPending(undefined);
      }
      setLoading(false);
    } catch (error) {
      console.error("BuyButton error", error);
      showText(error?.message ? error.message : error, "red");
      setPending(undefined);
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setVisible(false);
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
        <Form layout="vertical" name="form_in_modal">
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
          <Form.Item
            name="info"
            className="currency-sell-form_last-form-item"
            hidden={timeline.length === 0 && pending === undefined}
          >
            <Timeline
              pending={pending}
              reverse={false}
              hidden={timeline.length === 0 && pending === undefined}
            >
              {timeline.map((item) => (
                <Timeline.Item color={item.color}>{item.text}</Timeline.Item>
              ))}
            </Timeline>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BuyButton;