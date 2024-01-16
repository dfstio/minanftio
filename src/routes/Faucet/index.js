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

const logm = logger.info.child({ winstonModule: "Corporate" });
const { REACT_APP_DEBUG } = process.env;

const { TextArea } = Input;

const DEBUG = "true" === process.env.REACT_APP_DEBUG;



const Faucet = () => {
  const [form] = Form.useForm();
  const [publicKey, setPublicKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [counter, setCounter] = useState(0);
  const [link, setLink] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const log = logm.child({ winstonComponent: "ProveAttributes" });

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

  async function faucetButton() {
    console.log("Verify button clicked");
    setLoading(true);
    console.log("table", table);
    const key = "Verifying message";

    try {
      message.loading({
        content: `Verifying...`,
        key,
        duration: 600,
      });

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
          content: `Proof verified, result: ${mintResult.verificationResult}`,
          key,
          duration: 240,
        });
        setVerificationResult(mintResult.verificationResult);
      } else
        message.error({
          content: `Error verifying proof: ${mintResult?.error ?? ""} ${
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
      <div className="gx-main-content">
        <Row>
          <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
            <Card
              className="gx-card"
              key="billingCard"
              title="Testworld2 Faucet"
            >
              <div className="gx-d-flex justify-content-center">
                Enter your public key to get some testworld2 tokens
              </div>
              <Form
                form={form}
                key="faucetForm"
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
                
                  <Row>
                    <Col xxl={12} xl={12} lg={14} md={24} sm={24} xs={24}>
                      <Form.Item
                        label=""
                        name="publ"
                        rules={[
                          {
                            required: true,
                            message: "Please enter publicKey",
                          },
                        ]}
                        placeholder="
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
                          disabled={publicKey === ""}
                          loading={loading}
                          onClick={faucetButton}
                          key="faucetButton"
                        >
                          Get MINA tokens
                        </Button>
                      </Form.Item>
                    </Col>
                    </Row>
                    <Row>
                    <Col xxl={12} xl={12} lg={14} md={24} sm={24} xs={24}>
                      <Form.Item
                        label=""
                        name="link"
                        hidden={link === ""}
                      >
                        {"Transaction: " + link}
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
