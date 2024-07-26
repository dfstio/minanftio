/* eslint-disable react/jsx-no-target-blank */
import React, { useState, useEffect } from "react";
import {
  Button,
  message,
  Row,
  Col,
  Form,
  Input,
  Radio,
  Card,
  Upload,
  Select,
  Table,
  Timeline,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import IntlMessages from "util/IntlMessages";
import {
  LoadingOutlined,
  PlusOutlined,
  InboxOutlined,
} from "@ant-design/icons";

import { transferNFT } from "../../nft/transfer";
import { updateAddress } from "../../appRedux/actions";
import { loadLibraries } from "../../nft/libraries";
import { waitForTransaction } from "../../nft/send";
import { minaLogin } from "../../blockchain/mina";
import { explorerTransaction } from "../../blockchain/explorer";
import { getJSON } from "../../blockchain/file";
import { sleep } from "../../blockchain/mina";
import logger from "../../serverless/logger";
const log = logger.info.child({
  winstonModule: "Transfer",
  winstonComponent: "Transfer",
});

const { REACT_APP_DEBUG, REACT_APP_PINATA_JWT } = process.env;

const { TextArea } = Input;
const Dragger = Upload.Dragger;
const { Option } = Select;

const DEBUG = "true" === process.env.REACT_APP_DEBUG;

const Transfer = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [counter, setCounter] = useState(0);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [timeline, setTimeline] = useState([]);
  const [pending, setPending] = useState(undefined);
  const [proving, setProving] = useState(false);
  const [libraries, setLibraries] = useState(loadLibraries());
  const [nftAddress, setNftAddress] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const address = useSelector(({ blockchain }) => blockchain.address);
  const dispatch = useDispatch();

  const checkCanCreate = () => {
    let newButtonDisabled = false;
    if (newButtonDisabled !== buttonDisabled)
      setButtonDisabled(newButtonDisabled);
  };

  const beforeUpload = (file) => {
    return false;
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
        wf: "showText",
        color,
      };
      console.error("Transfer error", data);
      log.error("Transfer error", data);
    }
  };

  const showPending = async (text) => {
    setPending(text);
  };

  async function transferButton() {
    if (DEBUG) console.log("Transfer button clicked");
    const o1jsInfo = (
      <span>
        Loading{" "}
        <a href={"https://docs.minaprotocol.com/zkapps/o1js"} target="_blank">
          o1js
        </a>{" "}
        library...
      </span>
    );
    await showPending(o1jsInfo);
    setProving(true);
    setLoading(true);
    await sleep(500);

    try {
      const newAddress = await minaLogin();
      dispatch(updateAddress(newAddress));
      if (newAddress === "" || newAddress === undefined) {
        setLoading(false);
        return;
      }

      if (DEBUG)
        console.log("TransferButton", {
          owner: newAddress,
          newOwner,
          showText,
          showPending,
        });
      let updateResult = await transferNFT({
        owner: newAddress,
        newOwner,
        address: nftAddress,
        showText,
        showPending,
        libraries: libraries ?? loadLibraries(),
        developer: "DFST",
        repo: "minanft_io",
        pinataJWT: REACT_APP_PINATA_JWT,
      });
      const jobId = updateResult.jobId;
      if (DEBUG) console.log("Transfer result", updateResult);
      if (updateResult?.success === true && jobId !== undefined) {
        await showText("Cloud proving job started", "green");
        const blob = new Blob([updateResult.json], {
          type: "application/json",
        });

        const jobInfo = (
          <span>
            Proving transaction, cloud prove job id:{" "}
            <a href={"https://zkcloudworker.com/job/" + jobId} target="_blank">
              {jobId}
            </a>
            <br />
            You can close this page and check the transaction status later.
          </span>
        );

        setPending(jobInfo);
      } else {
        console.error("Error transferring NFT token: ", updateResult);
        showText(
          `Error transferring NFT: ${updateResult?.error ?? ""} ${
            updateResult?.reason ?? ""
          }`,
          "red"
        );
        setPending(undefined);
        setLoading(false);
        return;
      }

      const txResult = await waitForTransaction(jobId);
      if (DEBUG) console.log("TransferButton tx updateResult", txResult);
      if (
        txResult.success &&
        txResult.hash !== undefined &&
        txResult.hash !== "" &&
        txResult.hash.toLowerCase().includes("error") === false
      ) {
        const jobInfo = (
          <span>
            Successfully proved transaction, cloud prove job id:{" "}
            <a href={"https://zkcloudworker.com/job/" + jobId} target="_blank">
              {jobId}
            </a>
            <br />
          </span>
        );
        await showText(jobInfo, "green");
        const txInfo = (
          <span>
            Transfer transaction successfully sent with hash:{" "}
            <a href={explorerTransaction() + txResult.hash} target="_blank">
              {txResult.hash}
            </a>
            <br />
            You can close this form and wait for the transaction to be included
            in the block.
          </span>
        );
        await showText(txInfo, "green");
        log.info("Transfer is successful", {
          address: nftAddress,
          newOwner,
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
    } catch (error) {
      console.error("TransferButton error", error);
      showText(error?.message ? error.message : error, "red");
      setPending(undefined);
      setLoading(false);
    }
  }

  const onFinish = async (values) => {
    if (DEBUG) console.log("onFinish", values);
  };

  return (
    <>
      <div className="gx-main-content">
        <Row>
          <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
            <Card className="gx-card" key="billingCard" title="Transfer NFT">
              <Form
                form={form}
                key="updateForm"
                labelCol={{
                  span: 24,
                }}
                wrapperCol={{
                  span: 24,
                }}
                layout="horizontal"
                initialValues={{ auth: "" }}
                onFinish={onFinish}
              >
                <div>
                  <Form.Item
                    label="NFT address. Get it by the clicking on the NFT address and copying the address"
                    name="nftAddress"
                    rules={[
                      {
                        required: true,
                        message: "",
                      },
                    ]}
                    placeholder="NFT address"
                  >
                    <Input onChange={(e) => setNftAddress(e.target.value)} />
                  </Form.Item>
                  <Form.Item
                    label="To"
                    name="newOwner"
                    rules={[
                      {
                        required: true,
                        message: "",
                      },
                    ]}
                    placeholder="Recipient address"
                  >
                    <Input onChange={(e) => setNewOwner(e.target.value)} />
                  </Form.Item>

                  {proving && (
                    <Row>
                      <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
                        <Form.Item
                          name="info"
                          className="currency-sell-form_last-form-item"
                          hidden={
                            timeline.length === 0 && pending === undefined
                          }
                        >
                          <Timeline
                            pending={pending}
                            reverse={false}
                            hidden={
                              timeline.length === 0 && pending === undefined
                            }
                          >
                            {timeline.map((item, index) => (
                              <Timeline.Item
                                color={item.color}
                                key={"timelineProve" + index}
                              >
                                {item.text}
                              </Timeline.Item>
                            ))}
                          </Timeline>
                        </Form.Item>
                      </Col>
                    </Row>
                  )}

                  <Row>
                    <Form.Item>
                      <Button
                        type="primary"
                        disabled={newOwner === "" || nftAddress === ""}
                        loading={loading}
                        onClick={transferButton}
                        key="transferButton"
                      >
                        Transfer
                      </Button>
                    </Form.Item>
                  </Row>
                </div>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default Transfer;
