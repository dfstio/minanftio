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
import { execute } from "./execute";
import { getJSON } from "../../blockchain/file";
import fileSaver from "file-saver";

const logm = logger.info.child({ winstonModule: "Tools" });
const { REACT_APP_DEBUG } = process.env;

const { TextArea } = Input;

const DEBUG = "true" === process.env.REACT_APP_DEBUG;

const Tools = () => {
  const [form] = Form.useForm();
  const [auth, setAuth] = useState("");
  const [loading, setLoading] = useState(false);
  const [counter, setCounter] = useState(0);
  const [name, setName] = useState("");
  const [time, setTime] = useState("");
  const [data, setData] = useState("");
  const [json, setJson] = useState(undefined);
  const [result, setResult] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const log = logm.child({ winstonComponent: "Tools" });

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
        if (json.filename !== undefined) setName(json.filename);
        if (json.timestamp !== undefined)
          setTime(new Date(json.timestamp).toLocaleString());
        if (json.data !== undefined)
          setData(JSON.stringify(json.data, null, 2));
        setJson(json);
      }
    }
    setCounter(counter + 1);
    checkCanCreate();
  };

  async function executeButton() {
    console.log("Execute button clicked");
    setLoading(true);
    const key = "Executing message";

    try {
      message.loading({
        content: `Executing...`,
        key,
        duration: 600,
      });

      const executeResult = await execute(auth, json);
      if (
        executeResult?.success === true &&
        executeResult?.result !== undefined
      ) {
        message.success({
          content: `Command executed: ${executeResult.result}`,
          key,
          duration: 240,
        });
        setResult(executeResult.result);
      } else
        message.error({
          content: `Error executing command: ${executeResult?.error ?? ""} ${
            executeResult?.reason ?? ""
          }`,
          key,
          duration: 60,
        });

      /*
      
      console.log("Verify job result", jobResult);
      if (jobResult?.success === true && jobResult?.jobId !== undefined) {
        message.loading({
          content: `Started verification job ${jobResult.jobId}`,
          key,
          duration: 600,
        });
      } else {
        message.error({
          content: `Error verifying proof: ${jobResult?.error ?? ""} ${
            jobResult?.reason ?? ""
          }`,
          key,
          duration: 60,
        });
        setLoading(false);
        return;
      }
      const jobId = jobResult.jobId;
      const mintResult = await waitForProof(jobId, auth);
      if (
        mintResult?.success === true &&
        mintResult?.verificationResult !== undefined
      ) {
        message.success({
          content: `Proof verified, transaction: ${mintResult.verificationResult}`,
          key,
          duration: 240,
        });
        setVerificationResult(
          "https://minascan.io/testworld/tx/" + mintResult.verificationResult
        );
      } else
        message.error({
          content: `Error verifying proof: ${mintResult?.error ?? ""} ${
            mintResult?.reason ?? ""
          }`,
          key,
          duration: 60,
        });
      */
      setLoading(false);
    } catch (error) {
      console.log("Execution error", error);
      setLoading(false);
      message.error({
        content: `Error execuring command: ${error}`,
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
      <div className="gx-main-content">
        <Row>
          <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
            <Card
              className="gx-card"
              key="billingCard"
              title=<IntlMessages id="tools.form.title" />
            >
              <div className="gx-d-flex justify-content-center">
                <IntlMessages id="tools.form.description" />
              </div>
              <Form
                form={form}
                key="executeForm"
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
                        label="Upload the JSON file with request here"
                        rules={[
                          {
                            required: true,
                            message:
                              "Please upload the JSON file with request here",
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
                      <Form.Item hidden={name === ""} key="name text">
                        <div
                          className="gx-mt-4"
                          style={{
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          Request name: {name}
                        </div>
                      </Form.Item>
                      <Form.Item hidden={time === ""} key="time text">
                        <div className="gx-mt-4">Request created: {time}</div>
                      </Form.Item>
                      <Form.Item hidden={data === ""} key="data text">
                        <div className="gx-mt-4">Request data: {data}</div>
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
                    <Col xxl={12} xl={12} lg={14} md={24} sm={24} xs={24}>
                      <Form.Item>
                        <Button
                          type="primary"
                          disabled={json === undefined}
                          loading={loading}
                          onClick={executeButton}
                          key="executeButton"
                        >
                          Execute Request
                        </Button>
                      </Form.Item>
                      <Divider />
                      <Form.Item
                        label="Execution result: "
                        name="executionResult"
                        hidden={result === ""}
                        key="executionResult"
                      >
                        <div>{result}</div>
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

export default Tools;
