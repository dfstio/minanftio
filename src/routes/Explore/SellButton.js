import React, { useState, useEffect } from "react";
import { Button, Modal, Form, InputNumber, Timeline } from "antd";
import { footerAgreement, footerAgreementLink } from "../../util/config";
import { useDispatch, useSelector } from "react-redux";
import { updateAddress } from "../../appRedux/actions";
import { sellNFT } from "../../nft/sell";
import { loadLibraries } from "../../nft/libraries";
import { waitForTransaction } from "../../nft/send";
import { minaLogin } from "../../blockchain/mina";
import { explorerTransaction } from "../../blockchain/explorer";
import { isMobile } from "react-device-detect";
import logger from "../../serverless/logger";

const log = logger.info.child({
  winstonModule: "Explore",
  winstonComponent: "SellButton",
});

const DEBUG = "true" === process.env.REACT_APP_DEBUG;
const noMobileTxs =
  isMobile && process.env.REACT_APP_CHAIN_ID === "mina:mainnet";

const SellButton = ({ item }) => {
  //class SellButton extends React.Component {

  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [delisting, setDelisting] = useState(false);
  const [title, setTitle] = useState("Sell NFT @" + item.name);
  const [price, setPrice] = useState(100);
  const [okDisabled, setOkDisabled] = useState(true);
  const [timeline, setTimeline] = useState([]);
  const [pending, setPending] = useState(undefined);
  const [libraries, setLibraries] = useState(undefined);
  const [reload, setReload] = useState(false);
  const address = useSelector(({ blockchain }) => blockchain.address);
  const dispatch = useDispatch();

  const showModal = () => {
    setTimeline([]);
    setPending(undefined);
    setLoading(false);
    setReload(false);
    setVisible(true);
    setLibraries(loadLibraries());
  };

  const showText = async (text, color) => {
    setTimeline((prev) => {
      const newTimeline = prev;
      newTimeline.push({ text, color });
      return newTimeline;
    });
    if (color === "red" || color === "yellow") {
      const data = {
        text,
        name: item.name,
        address,
        wf: "showText",
        color,
      };
      console.error("Sell error", data);
      log.error("Sell error", data);
    }
  };

  const showPending = async (text) => {
    setPending(text);
  };

  useEffect(() => {
    function checkOkButton() {
      const newOkDisabled = Number(price) < 1 || Number(price) > 500;
      if (newOkDisabled !== okDisabled) setOkDisabled(newOkDisabled);
      //if( DEBUG) if(DEBUG) console.log("Sell okDisabled: ", newOkDisabled, price, accepted);
    }
    checkOkButton();
  }, [price]);

  const sell = async () => {
    await handleButton(price);
  };

  const delist = async () => {
    await handleButton(0);
  };

  const handleButton = async (price) => {
    if (loading || delisting) return;
    setPending("Preparing transaction...");
    if (price === 0) setDelisting(true);
    else setLoading(true);

    if (noMobileTxs) {
      await showText(
        "zkApp transactions on the mobile devices will be supported in the next versions of the Auro Wallet. Stay tuned! At the moment, please use desktop Chrome browser with Auro Wallet extension",
        "red"
      );
      setPending(undefined);
      setLoading(false);
      setDelisting(false);
      return;
    }

    try {
      const newAddress = await minaLogin();
      dispatch(updateAddress(newAddress));
      if (newAddress === "" || newAddress === undefined) {
        setVisible(false);
        return;
      }
      if (item.status === "pending" && item.hash !== undefined) {
        const pendingTxInfo = (
          <span>
            There is a pending transaction for this NFT:{" "}
            <a href={explorerTransaction() + item.hash} target="_blank">
              {item.hash}
            </a>
            <br />
            It is recommended to wait for the previous transactions to be
            included in the block.
          </span>
        );
        await showText(pendingTxInfo, "yellow");
      }
      let sellResult = await sellNFT({
        name: item.name,
        price: Number(price) * 1_000_000_000,
        owner: newAddress,
        address: item.address,
        showText,
        showPending,
        libraries: libraries ?? loadLibraries(),
      });
      if (sellResult.success === false || sellResult.jobId === undefined) {
        showText("Error: " + sellResult.error ?? "", "red");
        setPending(undefined);
        setLoading(false);
        setDelisting(false);
        return;
      }
      setReload(true);
      if (DEBUG) console.log("SellButton sellResult", sellResult);
      const jobId = sellResult.jobId;
      await showText("Cloud proving job started", "green");
      const jobInfo = (
        <span>
          Proving transaction, cloud prove job id:{" "}
          <a href={"https://zkcloudworker.com/job/" + jobId} target="_blank">
            {jobId}
          </a>
          <br />
          You can close this form and check the transaction status later.
        </span>
      );

      setPending(jobInfo);
      const txResult = await waitForTransaction(jobId);
      if (DEBUG) console.log("SellButton tx sellResult", txResult);
      if (
        txResult.success &&
        txResult.hash !== undefined &&
        txResult.hash !== "" &&
        txResult.hash.toLowerCase().includes("error") === false
      ) {
        const jobInfo = (
          <span>
            Sucessfully proved transaction, cloud prove job id:{" "}
            <a href={"https://zkcloudworker.com/job/" + jobId} target="_blank">
              {jobId}
            </a>
            <br />
          </span>
        );
        await showText(jobInfo, "green");
        const txInfo = (
          <span>
            Sell transaction successfully sent with hash:{" "}
            <a href={explorerTransaction() + txResult.hash} target="_blank">
              {txResult.hash}
            </a>
            <br />
            You can close this form and wait for the transaction to be included
            in the block.
          </span>
        );
        await showText(txInfo, "green");
        log.info("Sell is successful", {
          name: item.name,
          price,
          hash: txResult.hash,
        });
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
      setDelisting(false);
    } catch (error) {
      console.error("SellButton error", error);
      showText(error?.message ? error.message : error, "red");
      setPending(undefined);
      setLoading(false);
      setDelisting(false);
    }
  };

  const handleCancel = () => {
    setVisible(false);
    if (reload) window.location.reload(false);
  };

  const handleChange = (values) => {
    if (DEBUG) console.log("Sell values changed", values);
    if (values.price !== undefined) setPrice(values.price);
  };

  return (
    <div>
      <Button type="primary" onClick={showModal}>
        Sell
      </Button>
      <Modal
        title={title}
        open={visible}
        confirmLoading={loading}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          onValuesChange={handleChange}
          layout="vertical"
          name="form_in_modal"
          initialValues={{
            price: 100,
          }}
        >
          <Form.Item
            name="price"
            label="Price"
            rules={[
              {
                validator: (_, value) =>
                  value >= 1 || value <= 500
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error(
                          `Price should be higher than 1 MINA and less than 500 MINA`
                        )
                      ),
              },

              {
                required: true,
                message: "Please input the the price between 1 and 500 MINA",
              },
            ]}
          >
            <InputNumber min={1} max={500} addonAfter="MINA" />
          </Form.Item>
          <Form.Item>
            <div
              className="gx-mt-0"
              style={{
                whiteSpace: "pre-wrap",
              }}
            >
              <span>
                By clicking the Sell button, you are confirming your agreement
                with our
              </span>
              <span>
                <a href={footerAgreementLink} target="_blank">
                  {footerAgreement}
                </a>
                <br />
                MinaNFT commission on this sale is 10%.{" "}
              </span>
            </div>
          </Form.Item>

          <Form.Item name="sell">
            <Button
              type="primary"
              onClick={sell}
              disabled={okDisabled}
              loading={loading}
            >
              Sell
            </Button>
            {item.price !== "0" && (
              <Button
                type="primary"
                onClick={delist}
                disabled={okDisabled}
                loading={delisting}
              >
                Delist
              </Button>
            )}
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

export default SellButton;
