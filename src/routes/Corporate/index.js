import React, { useState, useEffect } from "react";
import api from "../../serverless/api";
import { isMobile, isDesktop, isChrome } from "react-device-detect";
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
    virtuosoRegisterPublicKey,
    getSignature,
} from "../../blockchain/mina";

import IntlMessages from "util/IntlMessages";

import logger from "../../serverless/logger";
const logm = logger.info.child({ winstonModule: "Verify" });
const { REACT_APP_DEBUG } = process.env;

const { TextArea } = Input;
const { Option } = Select;
const Dragger = Upload.Dragger;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

const startToken = {
    corporate_name: "",
    contact_name: "",
    contact_phone: "",
    contact_email: "",
    corporate_website: "",
};
const DEBUG = "true" === process.env.REACT_APP_DEBUG;

const Corporate = () => {
    const address = useSelector(({ blockchain }) => blockchain.address);
    const publicKey = useSelector(({ blockchain }) => blockchain.publicKey);
    const balance = useSelector(({ blockchain }) => blockchain.balance);
    const virtuosoBalance = useSelector(
        ({ blockchain }) => blockchain.virtuosoBalance,
    );
    const dispatch = useDispatch();

    const [form] = Form.useForm();
    const [auth, setAuth] = useState("");
    const [token, setToken] = useState(startToken);
    const [counter, setCounter] = useState(0);
        const [createDisabled, setCreateDisabled] = useState(true);

    const log = logm.child({ winstonComponent: "Verify" });
    
    const checkCanCreate = () => {
        let newCreateDisabled = true;
        if (
            token.corporate_name !== "" &&
            token.contact_email !== ""
        )
            newCreateDisabled = false;
        if (newCreateDisabled !== createDisabled) setCreateDisabled(newCreateDisabled);
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

        if (values.corporate_name !== undefined)
            newToken.corporate_name = values.corporate_name; //TODO: check name
        if (values.contact_name !== undefined)
            newToken.contact_name = values.contact_name;
        if (values.contact_phone !== undefined)
            newToken.contact_phone = values.contact_phone;
        if (values.contact_email !== undefined)
            newToken.contact_email = values.contact_email;
        if (values.corporate_website !== undefined)
            newToken.corporate_website = values.corporate_website;

        setToken(newToken);
        setCounter(counter + 1);
        checkCanCreate();
    };

    async function corporateButton() {
        if (address == "") {
            const myaddress = await minaLogin(true);
            dispatch(updateAddress(myaddress));
        } else {
            const corpMessage = JSON.stringify(token);
            if (DEBUG) console.log("corpMessage", corpMessage);
            const corpSignature = await getSignature(corpMessage);
            if (DEBUG) console.log("corpSignature", corpSignature);
            message.error({
                content: `Thank you for registering your corporate account. Please note that this feature is not implemented yet`,
                key: `CorporateButton`,
                duration: 10,
            });
        }
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
        <div className="gx-main-content">
            <Row>
                <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
                    <Card className="gx-card" title="Create corporate account">
                        <div className="gx-d-flex justify-content-center">
                                Utilizing our corporate accounts, your employees
                                can access minanft.io website with Auro to
                                generate unique Mina NFTs. These NFTs enable
                                them to:
                                <br /><br />
                                - Publish fully verifiable content to the MINA
                                blockchain, ensuring transparency and trust.
                                <br /><br />
                                - Keep portions of the content private, giving
                                your team control over data visibility.
                                <br /><br />
                                - Generate proofs off-chain and validate them
                                both off-chain and on-chain for any content
                                segment, supporting data integrity.
                                <br /><br />
                                - Redact (sanitize) specific pieces of content
                                (such as text, Word files, PNG files) to exclude
                                sensitive information such as personal
                                information (social security number, etc),
                                financial information (bank account details and balances,
                                transfer details), security information
                                (passwords, access codes, private keys),
                                commercial confidential information (prices
                                paid, some details of the proof of ownership, proof of product and
                                proof of funds), and
                                validate this redacted content on-chain,
                                maintaining security and confidentiality on
                                request of your legal department or commercial
                                department.
                                <br /><br />
                                - Use a wide variety of content formats
                                including text, images, videos, audio, and
                                documents, promoting versatility in data
                                representation.
                                <br /><br />
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
                                    <Col
                                        xxl={12}
                                        xl={12}
                                        lg={14}
                                        md={24}
                                        sm={24}
                                        xs={24}
                                    >
                                        <Form.Item
                                            label="Your corporation or SME name"
                                            name="corporate_name"
                                            rules={[
                                            {
                                                required: true,
                                                message: "Please write name of your corporation or SME",
                                            },
                                        ]}
                                            placeholder="Write name of your corporation or SME"
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
                                    <Col
                                        xxl={12}
                                        xl={12}
                                        lg={14}
                                        md={24}
                                        sm={24}
                                        xs={24}
                                    >
                                        <Form.Item
                                            label="Contact e-mail"
                                            name="contact_email"
                                            placeholder="Some string (less than 30 chars)"
                                            rules={[
                                            {
                                                required: true,
                                                message: "Please write your contact e-mail",
                                            },
                                        ]}
                                        >
                                            <TextArea
                                                autoSize={{
                                                    minRows: 1,
                                                    maxRows: 2,
                                                }}
                                            />
                                        </Form.Item>
                                    </Col>


                                    <Col
                                        xxl={12}
                                        xl={12}
                                        lg={14}
                                        md={24}
                                        sm={24}
                                        xs={24}
                                    >
                                        <Form.Item
                                            label="Contact name"
                                            name="contact_name"
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
                                    <Col
                                        xxl={12}
                                        xl={12}
                                        lg={14}
                                        md={24}
                                        sm={24}
                                        xs={24}
                                    >
                                        <Form.Item
                                            label="Contact phone"
                                            name="contact_phone"
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
                                                                       <Col
                                        xxl={12}
                                        xl={12}
                                        lg={14}
                                        md={24}
                                        sm={24}
                                        xs={24}
                                    >
                                        <Form.Item
                                            label="Short description of your business"
                                            name="corporate_description"
                                            placeholder="Some string"
                                        >
                                            <TextArea
                                                autoSize={{
                                                    minRows: 1,
                                                    maxRows: 10,
                                                }}
                                            />
                                        </Form.Item>
                                    </Col>
 

                                </Row>
                                <Row>
                                    <Col
                                                                            xxl={12}
                                        xl={12}
                                        lg={14}
                                        md={24}
                                        sm={24}
                                        xs={24}
                                    >
                                        <Form.Item
                                            name="kyc docs"
                                            label="Your KYC docs"
                                        >
                                            <Upload
                                                name="kycdocs"
                                                listType="picture-card"
                                                className="avatar-uploader"
                                                showUploadList={true}
                                                multiple={true}
                                                //action="//jsonplaceholder.typicode.com/posts/"
                                                beforeUpload={beforeUpload}
                                                //onChange={this.handleChange}
                                            >
                                                {" "}
                                                <div>
                                                    <PlusOutlined />
                                                    <div className="ant-upload-text">
                                                        KYC/AML docs
                                                    </div>
                                                </div>
                                            </Upload>
                                        </Form.Item>
                                    </Col>
                                    <Col>
                                    <Form.Item
                                        label={
                                            <span>
                                                <span>
                                                    Authorisation code.{" "}
                                                </span>
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
                                    </Col>
                                </Row>
                                <Row>
                                    <Form.Item>
                                        <div
                                            className="gx-mt-4"
                                            style={{ whiteSpace: "pre-wrap" }}
                                        >
                                            <span>
                                                {address == ""
                                                    ? "Please connect with Auro on Berkeley network before creating corporate account"
                                                    : "You are creating corporate account with AURO address " +
                                                      address}
                                                <br />
                                                <br />
                                                You will be requested to sign
                                                this form information with AURO
                                                wallet and, after onboarding
                                                procedure we will open for you
                                                corporate account
                                                <br />
                                                <br />
                                                By clicking this button, you are
                                                confirming your agreement with
                                                our
                                            </span>{" "}
                                            <span>
                                                <a
                                                    href={footerAgreementLink}
                                                    target="_blank"
                                                >
                                                    {footerAgreement}
                                                </a>
                                            </span>
                                        </div>
                                    </Form.Item>
                                </Row>

                                <Row>
                                    <Form.Item>
                                        <Button
                                            type="primary"
                                            disabled={createDisabled}
                                            onClick={corporateButton}
                                        >
                                            {address == ""
                                                ? "Connect with Auro"
                                                : "Create corporate account"}
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

export default Corporate;
