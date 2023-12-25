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
  Table,
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
import { queryBilling } from "./billing";

const logm = logger.info.child({ winstonModule: "Corporate" });
const { REACT_APP_DEBUG } = process.env;

const { TextArea } = Input;
const { Option } = Select;
const Dragger = Upload.Dragger;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

const DEBUG = "true" === process.env.REACT_APP_DEBUG;

const columns = [
  {
    title: "Created",
    dataIndex: "created",
    key: "created",
  },
  {
    title: "Job Name",
    dataIndex: "jobName",
    key: "jobName",
  },
  {
    title: "Job Task",
    dataIndex: "task",
    key: "task",
  },
  {
    title: "Job Status",
    dataIndex: "jobStatus",
    key: "jobStatus",
  },
  {
    title: "Billed time (ms)",
    dataIndex: "billedDuration",
    key: "billedDuration",
  },
  {
    title: "Job Duration (ms)",
    dataIndex: "duration",
    key: "duration",
  },
  {
    title: "Job Id",
    dataIndex: "jobId",
    key: "jobId",
  },
];

const CorporateBilling = () => {
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
  const [loading, setLoading] = useState(false);
  const [counter, setCounter] = useState(0);
  const [report, setReport] = useState("");
  const [total, setTotal] = useState("");
  const [amount, setAmount] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const log = logm.child({ winstonComponent: "Corporate" });

  const checkCanCreate = () => {
    let newButtonDisabled = false;
    if (newButtonDisabled !== buttonDisabled)
      setButtonDisabled(newButtonDisabled);
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
    if (values.auth !== undefined && values.auth !== auth) setAuth(values.auth);
    setCounter(counter + 1);
    checkCanCreate();
  };

  async function billingButton() {
    console.log("Billing button clicked");
    setLoading(true);

    const report = await queryBilling(auth);
    if (
      report.success === true &&
      report.table !== undefined &&
      report.total !== undefined
    ) {
      setReport(report.table);
      setTotal(parseInt((report.total / 1000).toString()) + " seconds");
      const price = 0.0000001333;
      // set Amount in USD
      setAmount("USD " + (report.total * price * 10).toFixed(2).toString());
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
              title=<IntlMessages id="corporate.billing.report.title" />
            >
              <div className="gx-d-flex justify-content-center">
                <IntlMessages id="corporate.billing.report.description" />
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
                        <Table dataSource={report} columns={columns} />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row>
                    <Form.Item>
                      <div
                        className="gx-mt-4"
                        style={{
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        Total billed time: {total}
                      </div>
                    </Form.Item>
                  </Row>

                  <Row>
                    <Form.Item>
                      <div
                        className="gx-mt-4"
                        style={{
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        Total amount: {amount}
                      </div>
                    </Form.Item>
                  </Row>

                  <Row>
                    <Form.Item>
                      <Button
                        type="primary"
                        disabled={buttonDisabled}
                        loading={loading}
                        onClick={billingButton}
                        key="billingButton"
                      >
                        Retreive report
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

export default CorporateBilling;
