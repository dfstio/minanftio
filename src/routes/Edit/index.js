import React, { useState, useEffect } from "react";
import api from "../../serverless/api";
import { isMobile, isDesktop, isChrome } from "react-device-detect";
import { accountingEmail } from "../../util/config";
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
import { minaLogin } from "../../blockchain/mina";

import IntlMessages from "util/IntlMessages";

import logger from "../../serverless/logger";
const logm = logger.info.child({ winstonModule: "Verify" });
const { REACT_APP_DEBUG } = process.env;

const { TextArea } = Input;
const { Option } = Select;
const Dragger = Upload.Dragger;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

const Edit = () => {
  const address = useSelector(({ blockchain }) => blockchain.address);
  const publicKey = useSelector(({ blockchain }) => blockchain.publicKey);
  const balance = useSelector(({ blockchain }) => blockchain.balance);
  const virtuosoBalance = useSelector(
    ({ blockchain }) => blockchain.virtuosoBalance
  );
  const dispatch = useDispatch();

  const [form] = Form.useForm();
  const [auth, setAuth] = useState("");

  const log = logm.child({ winstonComponent: "Verify" });

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

  async function register() {
    log.info("Register clicked", { address, wf: "register" });

    if (address !== undefined && address !== "") {
      log.profile(`Registered public key of address ${address}`);
      const key = "RegisterPublicKey";
      message.loading({
        content: `Please provide public key in Metamask and confirm transaction`,
        key,
        duration: 60,
      });
      /*
            const result = await virtuosoRegisterPublicKey(address);
            if (result.publicKey !== "" && result.hash !== "") {
                dispatch(updatePublicKey(result.publicKey));
                message.success({
                    content: `Public key ${result.publicKey} is written to blockchain with transaction ${result.hash}`,
                    key,
                    duration: 10,
                });
            } else
                message.error({
                    content: `Public key is not provided or written to blockchain`,
                    key,
                    duration: 10,
                });
            log.profile(`Registered public key of address ${address}`, {
                address,
                result,
                wf: "register",
            });
            */
    }
  }

  async function notImplemented() {
    message.error({
      content: `Not implemented yet`,
      key: `EditButton`,
      duration: 10,
    });
  }

  async function connect() {
    log.info("Connect clicked", { address, wf: "connect" });
    const newAddress = await minaLogin();
    dispatch(updateAddress(newAddress));
  }

  return (
    <div className="gx-main-content">
      <Row>
        <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
          <Card className="gx-card" title="Edit">
            <div className="gx-d-flex justify-content-center">
              <h4>
                You can add public key-values and private key-values to your
                existing MINA NFT here
              </h4>
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
            >
              <div>
                <Row>
                  <Col xxl={12} xl={12} lg={14} md={24} sm={24} xs={24}>
                    <Form.Item
                      label="Mina NFT name (like @myminanft))"
                      name="mina_nft_name"
                      placeholder="Some string (less than 30 chars)"
                    >
                      <TextArea
                        autoSize={{
                          minRows: 1,
                          maxRows: 1,
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row>
                  <Col xxl={12} xl={12} lg={14} md={24} sm={24} xs={24}>
                    <Form.Item
                      label="Public key 1 (will be published to IPFS)"
                      name="public_key1"
                      placeholder="Some string (less than 30 chars)"
                    >
                      <TextArea
                        autoSize={{
                          minRows: 1,
                          maxRows: 2,
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xxl={12} xl={12} lg={14} md={24} sm={24} xs={24}>
                    <Form.Item
                      label="Public value 1 (will be published to IPFS)"
                      name="public_value1"
                      placeholder="Some string (less than 30 chars)"
                    >
                      <TextArea
                        autoSize={{
                          minRows: 1,
                          maxRows: 2,
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row>
                  <Col xxl={12} xl={12} lg={14} md={24} sm={24} xs={24}>
                    <Form.Item
                      label="Private key 1 (will NOT be published to IPFS)"
                      name="private_key1"
                      placeholder="Some string (less than 30 chars)"
                    >
                      <TextArea
                        autoSize={{
                          minRows: 1,
                          maxRows: 2,
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xxl={12} xl={12} lg={14} md={24} sm={24} xs={24}>
                    <Form.Item
                      label="Private value 1 (will NOT be published to IPFS, but will be verifiable on-chain)"
                      name="private_value1"
                      placeholder="Some string (less than 30 chars)"
                    >
                      <TextArea
                        autoSize={{
                          minRows: 1,
                          maxRows: 2,
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Form.Item
                      name="private-data-json"
                      label="Private data (upload the private-data.json file that was provided to you during NFT creation process)"
                    >
                      <Upload
                        name="private-data-json"
                        listType="picture-card"
                        className="avatar-uploader"
                        showUploadList={true}
                        multiple={false}
                        //action="//jsonplaceholder.typicode.com/posts/"
                        beforeUpload={beforeUpload}
                        //onChange={this.handleChange}
                      >
                        {" "}
                        <div>
                          <PlusOutlined />
                          <div className="ant-upload-text">private.json</div>
                        </div>
                      </Upload>
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
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
                    placeholder="Get the code by sending /auth command to telegram bot @MinaNFT_bot"
                  >
                    <TextArea
                      autoSize={{
                        minRows: 2,
                        maxRows: 3,
                      }}
                    />
                  </Form.Item>
                </Row>
                <Row>
                  <Form.Item>
                    <Button type="primary" onClick={notImplemented}>
                      Deploy NFT changes
                    </Button>
                  </Form.Item>
                </Row>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Edit;
