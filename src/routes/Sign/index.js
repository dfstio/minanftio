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

import logger from "../../serverless/logger";
import { contract } from "./contract";
import { explorerTransaction } from "../../blockchain/explorer";

const logm = logger.info.child({ winstonModule: "Sign" });
const { REACT_APP_DEBUG } = process.env;

const { TextArea } = Input;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

const DEBUG = "true" === process.env.REACT_APP_DEBUG;

const Sign = () => {
  const [form] = Form.useForm();
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [counter, setCounter] = useState(0);
  const [verificationResult, setVerificationResult] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [chain, setChain] = useState("zeko");

  const log = logm.child({ winstonComponent: "Faucet" });

  const checkCanCreate = () => {
    let newButtonDisabled = false;
    if (newButtonDisabled !== buttonDisabled)
      setButtonDisabled(newButtonDisabled);
  };

  const onValuesChange = async (values) => {
    if (DEBUG) console.log("onValuesChange", values);
    if (values.value !== undefined && values.value !== value)
      setValue(values.value);
    if (values.chain !== undefined && values.chain !== chain)
      setChain(values.chain);

    setCounter(counter + 1);
    checkCanCreate();
  };

  async function signButton() {
    console.log("Sign", { chain, value });
    setLoading(true);

    const key = "Faucet";

    try {
      message.loading({
        content: `Sending...`,
        key,
        duration: 600,
      });
      const hashResult = await contract(value, 10);
      //await faucet(value, chain);
      if (hashResult.isCalculated === true) {
        setVerificationResult(hashResult.hash);
        message.success({
          content: `Transaction sent: ${hashResult.hash}`,
          key,
          duration: 240,
        });
        setVerificationResult(explorerTransaction(chain) + hashResult.hash);
      } else {
        console.error("faucetResult", hashResult);
        message.error({
          content: `Error sending tx: ${hashResult?.error ?? ""} ${
            hashResult?.reason ?? ""
          }`,
          key,
          duration: 60,
        });
      }

      setLoading(false);
    } catch (error) {
      console.log("Sign error", error);
      setLoading(false);
      message.error({
        content: `Error signing: ${error}`,
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
            <Card className="gx-card" key="faucetCard" title="Sign Test">
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
                initialValues={{ value: "", chain: "zeko" }}
                onFinish={onFinish}
                onValuesChange={onValuesChange}
              >
                <div>
                  <Row>
                    <Col xxl={12} xl={12} lg={14} md={24} sm={24} xs={24}>
                      <Form.Item
                        label="Value"
                        name="value"
                        rules={[
                          {
                            required: true,
                            message: "Please enter the value",
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
                          disabled={value === ""}
                          loading={loading}
                          onClick={signButton}
                          key="proveButton"
                        >
                          Sign
                        </Button>
                      </Form.Item>
                      <Divider />
                      <Form.Item
                        label="transaction sent: "
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

export default Sign;
