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
import { faucet } from "../../blockchain/faucet";
import { explorerTransaction } from "../../blockchain/explorer";

const logm = logger.info.child({ winstonModule: "Faucet" });
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
];

const Faucet = () => {
  const [form] = Form.useForm();
  const [auth, setAuth] = useState("");
  const [loading, setLoading] = useState(false);
  const [counter, setCounter] = useState(0);
  const [name, setName] = useState("");
  const [nftAddress, setNftAddress] = useState("");
  const [json, setJson] = useState(undefined);
  const [table, setTable] = useState([]);
  const [verificationResult, setVerificationResult] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const log = logm.child({ winstonComponent: "Faucet" });

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

    setCounter(counter + 1);
    checkCanCreate();
  };

  async function proveButton() {
    console.log("Verify button clicked");
    setLoading(true);

    console.log("table", table);
    const key = "Verifying message";

    try {
      message.loading({
        content: `Requesting MINA from the faucet...`,
        key,
        duration: 600,
      });
      const hashResult = await faucet(auth);
      if (hashResult.isCalculated === true) {
        setVerificationResult(hashResult.hash);
        message.success({
          content: `Transaction sent: ${hashResult.hash}`,
          key,
          duration: 240,
        });
        setVerificationResult(explorerTransaction() + hashResult.hash);
      } else {
        console.error("faucetResult", hashResult);
        message.error({
          content: `Error requesting MINA from faucet: ${
            hashResult?.error ?? ""
          } ${hashResult?.reason ?? ""}`,
          key,
          duration: 60,
        });
      }

      /*
      const jobResult = await verify(auth, json);
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
          explorerTransaction() + mintResult.verificationResult
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
      <div className="gx-main-content">
        <Row>
          <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
            <Card className="gx-card" key="faucetCard" title="Devnet Faucet">
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
                      <Form.Item
                        label="Enter the public key of your account"
                        name="auth"
                        rules={[
                          {
                            required: true,
                            message:
                              "Please enter the public key of your account",
                          },
                        ]}
                        placeholder=""
                      >
                        <TextArea
                          autoSize={{
                            minRows: 1,
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
                          disabled={auth === ""}
                          loading={loading}
                          onClick={proveButton}
                          key="proveButton"
                        >
                          Get MINA
                        </Button>
                      </Form.Item>
                      <Divider />
                      <Form.Item
                        label="Topup transaction sent: "
                        name="mintedlink"
                        hidden={verificationResult === ""}
                      >
                        <div>
                          <a href={verificationResult} target="_blank">
                            {verificationResult}
                          </a>
                        </div>
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

export default Faucet;
