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
import { prepareTable, prove } from "./prove";
import { getJSON } from "../../blockchain/file";
import { set } from "lodash";

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

const rowSelection = {
  onChange: (selectedRowKeys, selectedRows) => {
    console.log(
      `selectedRowKeys: ${selectedRowKeys}`,
      "selectedRows: ",
      selectedRows
    );
  },
  getCheckboxProps: (record) => ({
    disabled: record.name === "Disabled User",
    // Column configuration not to be checked
    name: record.name,
  }),
};

const ProveAttributes = () => {
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
  const [name, setName] = useState("");
  const [nftAddress, setNftAddress] = useState("");
  const [json, setJson] = useState(undefined);
  const [table, setTable] = useState([]);
  const [total, setTotal] = useState("");
  const [amount, setAmount] = useState("");
  const [minted, setMinted] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const log = logm.child({ winstonComponent: "Corporate" });

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
    console.log("Billing button clicked");
    setLoading(true);
    console.log("rowSelection", rowSelection.getCheckboxProps(table[0]));
    console.log("rowSelection", rowSelection.getCheckboxProps(table[1]));
    console.log("table", table);

    /*
    const report = await queryBilling(auth);
    if (
      report.success === true &&
      report.table !== undefined &&
      report.total !== undefined &&
      report.minted !== undefined
    ) {
      setReport(report.table);
      setTotal(
        parseInt((report.total / 1000).toString()).toLocaleString() + " seconds"
      );
      const price = 0.0000001333; // AWS lambda cost per ms for 8192 MB memory
      // set Amount in USD
      setAmount(
        "USD " +
          (report.total * price * 10 + report.minted * 9).toFixed(2).toString()
      );
      setMinted(report.minted.toLocaleString());
    }
    */
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
                        disabled={buttonDisabled}
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
