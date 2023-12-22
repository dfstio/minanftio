import React, { useState, useEffect } from "react";
import api from "../../serverless/api";
import { isMobile, isDesktop, isChrome } from "react-device-detect";
import axios from "axios";
import {
  footerText,
  footerAgreement,
  footerContact,
  footerAgreementLink,
  footerEmail,
  accountingEmail,
} from "../../util/config";

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
} from "antd";
import {
  LoadingOutlined,
  PlusOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  updateAddress,
  updateVirtuosoBalance,
  updatePublicKey,
} from "../../appRedux/actions";
import {
  minaLogin,
  //virtuosoRegisterPublicKey,
  getSignature,
} from "../../blockchain/mina";

import IntlMessages from "util/IntlMessages";

import logger from "../../serverless/logger";
const logm = logger.info.child({ winstonModule: "Corporate" });
const { REACT_APP_DEBUG } = process.env;

const { TextArea } = Input;
const { Option } = Select;
const Dragger = Upload.Dragger;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

const startToken = {
  auth: "",
};
const DEBUG = "true" === process.env.REACT_APP_DEBUG;

const Corporate = () => {
  const address = useSelector(({ blockchain }) => blockchain.address);
  const publicKey = useSelector(({ blockchain }) => blockchain.publicKey);
  const balance = useSelector(({ blockchain }) => blockchain.balance);
  const [messageApi, contextHolder] = message.useMessage();
  const virtuosoBalance = useSelector(
    ({ blockchain }) => blockchain.virtuosoBalance
  );
  const dispatch = useDispatch();

  const [form] = Form.useForm();
  const [auth, setAuth] = useState("");
  const [token, setToken] = useState({ startToken });
  const [counter, setCounter] = useState(0);
  const [report, setReport] = useState("");
  const [createDisabled, setCreateDisabled] = useState(true);

  const log = logm.child({ winstonComponent: "Corporate" });

  const checkCanCreate = () => {
    let newCreateDisabled = true;
    if (
      token.corporate_name !== "" &&
      token.contact_email !== "" &&
      token.auth !== ""
    )
      newCreateDisabled = false;
    if (newCreateDisabled !== createDisabled)
      setCreateDisabled(newCreateDisabled);
  };

  let vb = "$0";
  let showWithdaw = false;
  if (virtuosoBalance !== undefined) {
    const vb1 = virtuosoBalance / 100;
    vb = " $" + vb1.toString();
    if (vb1 > 100) showWithdaw = true;
  }

  let pb = " is not registered";
  if (publicKey !== undefined && publicKey !== "") pb = " is " + publicKey;

  const beforeUpload = (file) => {
    return false;
  };

  const onValuesChange = async (values) => {
    if (DEBUG) console.log("onValuesChange", values);
    let newToken = token;
    if (values.auth !== undefined) newToken.auth = values.auth;

    setToken(newToken);
    setCounter(counter + 1);
    checkCanCreate();
  };

  async function corporateButton() {
    console.log("Corporate button clicked");
  }

  const onFinish = async (values) => {
    if (DEBUG) console.log("onFinish", values);
  };

  async function connect() {
    log.info("Connect clicked", { address, wf: "connect" });
    const newAddress = await minaLogin();
    dispatch(updateAddress(newAddress));
  }

  return (
    <>
      {contextHolder}
      <div className="gx-main-content">
        <Row>
          <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
            <Card
              className="gx-card"
              title=<IntlMessages id="corporate.billing.report.title" />
            >
              <div className="gx-d-flex justify-content-center">
                <IntlMessages id="corporate.billing.report.description" />
              </div>
              <Form
                form={form}
                labelCol={{
                  span: 24,
                }}
                wrapperCol={{
                  span: 24,
                }}
                layout="horizontal"
                initialValues={token}
                onFinish={onFinish}
                onValuesChange={onValuesChange}
              >
                <div>
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
                    <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
                      <Form.Item>
                        <div
                          className="gx-mt-4"
                          style={{
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {report === ""
                            ? ""
                            : "Table with the report will be shown here"}
                        </div>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row>
                    <Form.Item>
                      <Button
                        type="primary"
                        disabled={createDisabled}
                        onClick={corporateButton}
                      >
                        {report === "" ? "Retreive report" : "Pay"}
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

export default Corporate;
