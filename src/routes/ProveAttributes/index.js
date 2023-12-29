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
  Divider,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import IntlMessages from "util/IntlMessages";
import {
  LoadingOutlined,
  PlusOutlined,
  InboxOutlined,
} from "@ant-design/icons";

import logger from "../../serverless/logger";
import { prepareTable, prove, waitForProof, getKeys } from "./prove";
import { getJSON } from "../../blockchain/file";
import fileSaver from "file-saver";

const logm = logger.info.child({ winstonModule: "Corporate" });
const { REACT_APP_DEBUG } = process.env;

const { TextArea } = Input;

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

const ProveAttributes = () => {
  const [form] = Form.useForm();
  const [auth, setAuth] = useState("");
  const [loading, setLoading] = useState(false);
  const [counter, setCounter] = useState(0);
  const [name, setName] = useState("");
  const [nftAddress, setNftAddress] = useState("");
  const [json, setJson] = useState(undefined);
  const [table, setTable] = useState([]);
  const [proof, setProof] = useState(undefined);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();

  const log = logm.child({ winstonComponent: "ProveAttributes" });

  const onSelectChange = (newSelectedRowKeys) => {
    console.log("selectedRowKeys changed: ", newSelectedRowKeys);
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
    if (DEBUG) console.log("onValuesChange", values);
    if (values.auth !== undefined && values.auth !== auth) setAuth(values.auth);
    if (values.json !== undefined) {
      const json = await getJSON(values.json.file);
      if (json !== undefined) {
        if (json.name !== undefined) setName(json.name);
        if (json.address !== undefined) setNftAddress(json.address);
        setJson(json);
        const table = prepareTable(json);
        console.log("table", table);
        setTable(table);
      }
    }
    setCounter(counter + 1);
    checkCanCreate();
  };

  async function proveButton() {
    console.log("Prove button clicked");
    setLoading(true);
    console.log("rowSelection", selectedRowKeys);
    console.log("table", table);
    console.log("keys", getKeys(selectedRowKeys, table));
    const key = "Creating proof";
    return;

    try {
      message.loading({
        content: `Creating proof...`,
        key,
        duration: 600,
      });

      const jobResult = await prove(auth, json, selectedRowKeys);
      console.log("Prove job result", jobResult);
      if (jobResult?.success === true && jobResult?.jobId !== undefined) {
        message.loading({
          content: `Started proof job ${jobResult.jobId}`,
          key,
          duration: 600,
        });
      } else {
        message.error({
          content: `Error creating proof: ${jobResult?.error ?? ""} ${
            jobResult?.reason ?? ""
          }`,
          key,
          duration: 60,
        });
        setLoading(false);
        return;
      }
      const jobId = jobResult.jobId;
      const mintResult = await waitForProof(
        jobId,
        json,
        selectedRowKeys,
        table,
        auth
      );
      if (mintResult?.success === true && mintResult?.proof !== undefined) {
        message.success({
          content: `Proof created and verified successfully`,
          key,
          duration: 240,
        });
        setProof(mintResult.proof);
        const blob = new Blob([mintResult.json], {
          type: "text/plain;charset=utf-8",
        });
        fileSaver.saveAs(blob, name + ".proof.json");
      } else
        message.error({
          content: `Error creating proof: ${mintResult?.error ?? ""} ${
            mintResult?.reason ?? ""
          }`,
          key,
          duration: 60,
        });

      setLoading(false);
    } catch (error) {
      console.log("Proof creation error", error);
      setLoading(false);
      message.error({
        content: `Error creating proof: ${error}`,
        key,
        duration: 30,
      });
    }

    setLoading(false);
  }

  const onFinish = async (values) => {
    if (DEBUG) console.log("onFinish", values);
  };

  return (
    <>
      {contextHolder}
      <div className="gx-main-content">
        <Row>
          <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
            <Card
              className="gx-card"
              key="billingCard"
              title=<IntlMessages id="create.proofs.strings.form.title" />
            >
              <div className="gx-d-flex justify-content-center">
                <IntlMessages id="create.proofs.strings.form.description" />
              </div>
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
                    <Col xxl={12} xl={12} lg={14} md={24} sm={24} xs={24}>
                      <Divider />
                      <Form.Item
                        name="json"
                        label="Upload the JSON file with NFT data here that you've got when you have minted an NFT"
                        rules={[
                          {
                            required: true,
                            message:
                              "Please upload the JSON file with NFT data here",
                          },
                        ]}
                      >
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
                      </Form.Item>
                    </Col>
                    <Col xxl={12} xl={12} lg={14} md={24} sm={24} xs={24}>
                      <Form.Item hidden={name === ""}>
                        <div
                          className="gx-mt-4"
                          style={{
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          NFT name: {name}
                        </div>
                      </Form.Item>
                      <Form.Item hidden={nftAddress === ""}>
                        <div
                          className="gx-mt-4"
                          style={{
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          NFT address: {nftAddress}
                        </div>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row>
                    <Col xxl={12} xl={12} lg={14} md={24} sm={24} xs={24}>
                      <Form.Item
                        label={
                          <span>
                            <span>Authorisation code. </span>
                            <span>
                              {" "}
                              <a
                                href="https://t.me/minanft_bot?start=auth"
                                target="_blank"
                              >
                                Get it here
                              </a>
                            </span>
                          </span>
                        }
                        name="auth"
                        rules={[
                          {
                            required: true,
                            message: "Please enter authorisation code",
                          },
                        ]}
                        placeholder="Get the code by sending /auth command to telegram bot @MinaNFT_bot"
                      >
                        <TextArea
                          autoSize={{
                            minRows: 2,
                            maxRows: 3,
                          }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row>
                    <Form.Item>
                      <Button
                        type="primary"
                        disabled={!hasSelected}
                        loading={loading}
                        onClick={proveButton}
                        key="proveButton"
                      >
                        Create Proof
                      </Button>
                    </Form.Item>
                  </Row>
                  <Row>
                    <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
                      <Form.Item>
                        <Table
                          rowSelection={{
                            type: "checkbox",
                            ...rowSelection,
                          }}
                          dataSource={table}
                          columns={columns}
                        />
                      </Form.Item>
                    </Col>
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

export default ProveAttributes;
