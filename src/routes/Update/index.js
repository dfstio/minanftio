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

import { updateNFT } from "../../nft/update";
import { prepareTable } from "../../nft/prove";
import { updateAddress } from "../../appRedux/actions";
import { loadLibraries } from "../../nft/libraries";
import { waitForTransaction } from "../../nft/send";
import { minaLogin } from "../../blockchain/mina";
import { explorerTransaction } from "../../blockchain/explorer";
import { getJSON } from "../../blockchain/file";
import fileSaver from "file-saver";
import { sleep } from "../../blockchain/mina";
import logger from "../../serverless/logger";
const log = logger.info.child({
  winstonModule: "Prove",
  winstonComponent: "Prove",
});

const { REACT_APP_DEBUG, REACT_APP_PINATA_JWT } = process.env;

const { TextArea } = Input;
const Dragger = Upload.Dragger;
const { Option } = Select;

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
  {
    title: "Type",
    dataIndex: "type",
    key: "type",
  },
];

const Update = () => {
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
  const [keys, setKeys] = useState([
    { key: "", value: "", isPrivate: true },
    { key: "", value: "", isPrivate: true },
  ]);
  const [updateCode, setUpdateCode] = useState("");
  const address = useSelector(({ blockchain }) => blockchain.address);
  const dispatch = useDispatch();

  const onSelectChange = (newSelectedRowKeys) => {
    if (DEBUG) console.log("selectedRowKeys changed: ", newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  const hasSelected = selectedRowKeys.length > 0;

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
    if (color === "red") {
      const data = {
        text,
        name: json?.name,
        address: json?.address,
        wf: "showText",
      };
      console.error("Update error", data);
      log.error("Update error", data);
    }
  };

  const showPending = async (text) => {
    setPending(text);
  };

  async function updateButton() {
    if (DEBUG) console.log("Update button clicked");
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
    if (DEBUG) console.log("keys", keys);

    try {
      const newAddress = await minaLogin();
      dispatch(updateAddress(newAddress));
      if (newAddress === "" || newAddress === undefined) {
        setLoading(false);
        return;
      }

      if (DEBUG)
        console.log("UpdateButton", {
          name: json.name,
          json,
          owner: newAddress,
          address: json.address,
          keys,
          showText,
          showPending,
          updateCode,
        });
      let updateResult = await updateNFT({
        name: json.name,
        uri: json,
        keys,
        owner: newAddress,
        address: json.address,
        showText,
        showPending,
        updateCode,
        libraries: libraries ?? loadLibraries(),
        developer: "DFST",
        repo: "minanft_io",
        pinataJWT: REACT_APP_PINATA_JWT,
      });
      const jobId = updateResult.jobId;
      if (DEBUG) console.log("Update result", updateResult);
      if (
        updateResult?.success === true &&
        jobId !== undefined &&
        updateResult?.json !== undefined &&
        updateResult?.version !== undefined
      ) {
        await showText("Cloud proving job started", "green");
        const blob = new Blob([updateResult.json], {
          type: "application/json",
        });
        const blobName = name + `.v${updateResult?.version}.json`;
        fileSaver.saveAs(blob, blobName);
        const blobURL = URL.createObjectURL(blob);
        const blobInfo = (
          <span>
            Updated NFT private data saved to the{" "}
            <a href={blobURL} download={blobName}>
              {blobName}
            </a>
          </span>
        );

        await showText(blobInfo, "green");
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
        console.error("Error updating NFT token: ", updateResult);
        showText(
          `Error updating NFT: ${updateResult?.error ?? ""} ${
            updateResult?.reason ?? ""
          }`,
          "red"
        );
        setPending(undefined);
        setLoading(false);
        return;
      }

      const txResult = await waitForTransaction(jobId);
      if (DEBUG) console.log("UpdateButton tx updateResult", txResult);
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
            Update transaction successfully sent with hash:{" "}
            <a href={explorerTransaction() + txResult.hash} target="_blank">
              {txResult.hash}
            </a>
            <br />
            You can close this form and wait for the transaction to be included
            in the block.
          </span>
        );
        await showText(txInfo, "green");
        log.info("Update is successful", {
          name: json.name,
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
    } catch (error) {
      console.error("UpdateButton error", error);
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
            <Card
              className="gx-card"
              key="billingCard"
              title="Update NFT Metadata"
            >
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
                              "Please upload the JSON file with NFT data here",
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
                              with NFT private data
                              <br />
                              that you've got when
                              <br />
                              you have minted an NFT
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
                  {json && (
                    <Row>
                      <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
                        <Form.Item>
                          <Table dataSource={table} columns={columns} />
                        </Form.Item>
                      </Col>
                    </Row>
                  )}
                  {json && (
                    <Form.Item
                      label="Update code. Get it at support@minanft.io"
                      name="updateCode"
                      rules={[
                        {
                          required: false,
                          message:
                            "Please enter update code. Get it at support@minanft.io",
                        },
                      ]}
                      placeholder="Please enter update code. Get it at support@minanft.io"
                    >
                      <Input
                        maxLength={20}
                        showCount={true}
                        onChange={(e) => setUpdateCode(e.target.value)}
                      />
                    </Form.Item>
                  )}
                  {json && (
                    <Card
                      title={
                        <span
                          style={{ marginLeft: "20px", fontWeight: "normal" }}
                        >
                          Proof of NFT{" "}
                          <PlusOutlined
                            onClick={() => {
                              if (DEBUG) console.log("Add key", keys);
                              setKeys((prev) => [
                                ...prev,
                                { key: "", value: "", isPrivate: true },
                              ]);
                            }}
                          />
                        </span>
                      }
                      name="keys"
                    >
                      {keys.map((key, index) => (
                        <Row
                          className="gx-content"
                          key={`Proof of NFT Keys ${index}`}
                        >
                          <Col xxl={9} xl={9} lg={9} md={16} sm={24} xs={24}>
                            <Form.Item name={`key-${index}`}>
                              <Input
                                addonBefore="Key"
                                maxLength={30}
                                showCount={true}
                                onChange={(e) =>
                                  setKeys((prev) => {
                                    const newKeys = prev;
                                    newKeys[index].key = e.target.value;
                                    return newKeys;
                                  })
                                }
                              />
                            </Form.Item>
                          </Col>
                          <Col xxl={9} xl={9} lg={9} md={16} sm={24} xs={24}>
                            <Form.Item name={`value-${index}`}>
                              <Input
                                addonBefore="Value"
                                maxLength={30}
                                showCount={true}
                                onChange={(e) =>
                                  setKeys((prev) => {
                                    const newKeys = prev;
                                    newKeys[index].value = e.target.value;
                                    return newKeys;
                                  })
                                }
                              />
                            </Form.Item>
                          </Col>
                          <Col xxl={5} xl={5} lg={5} md={10} sm={12} xs={12}>
                            <Form.Item
                              name={`public-${index}`}
                              initialValue="Private"
                            >
                              <Select
                                name={`public-select-${index}`}
                                onChange={(e) =>
                                  setKeys((prev) => {
                                    const newKeys = prev;
                                    newKeys[index].isPrivate =
                                      e === "Private" ? true : false;
                                    return newKeys;
                                  })
                                }
                              >
                                <Option value="Private">Private</Option>
                                <Option value="Public">Public</Option>
                              </Select>
                            </Form.Item>
                            {/*}
                           <Form.Item
                             name={`public-${index}`}
                             valuePropName="public"
                           >
                             <Checkbox
                               onChange={(e) =>
                                 setKeys((prev) => {
                                   const newKeys = prev;
                                   newKeys[index].isPublic = e.target.checked;
                                   return newKeys;
                                 })
                               }
                             >
                               public
                             </Checkbox>
                           </Form.Item>*/}
                          </Col>
                        </Row>
                      ))}
                    </Card>
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
                        disabled={!json || proving}
                        loading={loading}
                        onClick={updateButton}
                        key="updateButton"
                      >
                        Update
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

export default Update;
