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

import logger from "../../serverless/logger";
import { verify, waitForProof } from "../../nft/verify";
import { getJSON } from "../../blockchain/file";
import fileSaver from "file-saver";
import { sleep } from "../../blockchain/mina";
import { loadLibraries } from "../../nft/libraries";

const logm = logger.info.child({ winstonModule: "Corporate" });
const { REACT_APP_DEBUG } = process.env;

const { TextArea } = Input;
const Dragger = Upload.Dragger;

const DEBUG = "true" === process.env.REACT_APP_DEBUG;

const columns = [
  {
    title: "Key",
    dataIndex: "key",
    key: "key",
  },
  {
    title: "Value",
    dataIndex: "value",
    key: "value",
  },
];

const Verify = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [counter, setCounter] = useState(0);
  const [name, setName] = useState("");
  const [fileName, setFileName] = useState(undefined);
  const [nftAddress, setNftAddress] = useState("");
  const [json, setJson] = useState(undefined);
  const [table, setTable] = useState([]);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [pending, setPending] = useState(undefined);
  const [proving, setProving] = useState(false);
  const [libraries, setLibraries] = useState(loadLibraries());

  const log = logm.child({ winstonComponent: "ProveAttributes" });

  function prepareTable(token) {
    return token.keys ?? [];
  }

  const checkCanCreate = () => {
    let newButtonDisabled = false;
    if (newButtonDisabled !== buttonDisabled)
      setButtonDisabled(newButtonDisabled);
  };

  const beforeUpload = (file) => {
    return false;
  };

  const onValuesChange = async (values) => {
    if (DEBUG) if (DEBUG) console.log("onValuesChange", values);
    if (values.json !== undefined) {
      const json = await getJSON(values.json.file);
      if (json !== undefined) {
        if (json.name !== undefined) setName(json.name);
        if (json.address !== undefined) setNftAddress(json.address);
        setJson(json);
        setFileName(values.json.file.name);
        const table = prepareTable(json);
        if (DEBUG) console.log("table", table);
        setTable(table);
      }
    }
    setCounter(counter + 1);
    checkCanCreate();
  };

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

  async function verifyButton() {
    if (DEBUG) console.log("Verify button clicked");
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
    if (DEBUG) console.log("rowSelection", selectedRowKeys);
    if (DEBUG) console.log("table", table);

    try {
      const jobResult = await verify(
        json,
        selectedRowKeys,
        libraries,
        showText,
        showPending
      );
      if (DEBUG) console.log("Verify job result", jobResult);
      const jobId = jobResult?.jobId;
      if (jobResult?.success === true && jobId !== undefined) {
        await showText("Cloud proof verification job started", "green");
        const jobInfo = (
          <span>
            Verifying Proof of NFT, cloud proof verification job id: {jobId}
          </span>
        );

        setPending(jobInfo);
      } else {
        if (jobResult?.error === "NFT on-chain state does not match proof data")
          await showText(`Proof verification result: proof is invalid`, "red");
        else
          await showText("Error staring cloud proof verification job", "red");
        setPending(undefined);
        setLoading(false);
        return;
      }
      const result = await waitForProof(jobId, json, selectedRowKeys, table);
      if (
        result?.success === true &&
        result?.verificationResult !== undefined
      ) {
        if (result?.verificationResult === "true")
          await showText(
            `Proof successfully verified, the verification result: proof is valid`,
            "green"
          );
        else
          await showText(
            `Proof verification result: proof is invalid: ${result?.verificationResult}`,
            "red"
          );
        setPending(undefined);
      } else {
        await showText("Error: cannot verify proof", "red");
        setPending(undefined);
      }

      setLoading(false);
    } catch (error) {
      if (DEBUG) console.log("Proof verification error", error);
      await showText("Error: cannot verify proof", "red");
      setPending(undefined);
    }

    setLoading(false);
  }

  const onFinish = async (values) => {
    if (DEBUG) console.log("onFinish", values);
  };

  return (
    <>
      <div className="gx-main-content">
        <Row>
          <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
            <Card
              className="gx-card"
              key="billingCard"
              title="Verify the Proof of NFT"
            >
              <Form
                form={form}
                key="billingForm"
                labelCol={{
                  span: 24,
                }}
                wrapperCol={{
                  span: 24,
                }}
                layout="horizontal"
                initialValues={{ auth: "" }}
                onFinish={onFinish}
                onValuesChange={onValuesChange}
              >
                <div>
                  <Row>
                    <Col xxl={8} xl={8} lg={8} md={24} sm={24} xs={24}>
                      <Form.Item
                        name="json"
                        rules={[
                          {
                            required: true,
                            message:
                              "Please upload the JSON file with the proof here",
                          },
                        ]}
                      >
                        <Dragger
                          name="jsondata"
                          listType="picture-card"
                          className="avatar-uploader"
                          accept="application/json"
                          showUploadList={false}
                          multiple={false}
                          maxCount={1}
                          beforeUpload={beforeUpload}
                        >
                          {fileName && <span>{fileName} </span>}
                          {!fileName && (
                            <span>
                              Click or drag the JSON file
                              <br />
                              with the proof
                              <br />
                              to this area
                            </span>
                          )}
                        </Dragger>
                        {/*
                        <Upload
                          name="jsondata"
                          listType="picture-card"
                          className="avatar-uploader"
                          accept="application/json"
                          showUploadList={true}
                          multiple={false}
                          maxCount={1}
                          beforeUpload={beforeUpload}
                        >
                          {" "}
                          <div>
                            <PlusOutlined />
                            <div className="ant-upload-text">JSON file</div>
                          </div>
                        </Upload>
                        */}
                      </Form.Item>
                    </Col>
                    <Col xxl={16} xl={16} lg={16} md={24} sm={24} xs={24}>
                      <Form.Item hidden={name === ""}>
                        NFT name: {name}
                        <br />
                        <br />
                        NFT address: {nftAddress}
                      </Form.Item>
                    </Col>
                  </Row>
                  {json && !proving && (
                    <Row>
                      <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
                        <Form.Item>
                          <Table dataSource={table} columns={columns} />
                        </Form.Item>
                      </Col>
                    </Row>
                  )}
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
                                key={"timelineVerify" + index}
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
                        disabled={!json}
                        loading={loading}
                        onClick={verifyButton}
                        key="verifyButton"
                      >
                        Verify Proof
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

export default Verify;
