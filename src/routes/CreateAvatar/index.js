import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { isMobile, isDesktop, isChrome } from "react-device-detect";
import api from "../../serverless/api";
import {
    Button,
    Row,
    Col,
    Form,
    Input,
    Radio,
    Card,
    Upload,
    Select,
} from "antd";
import TokenItem from "../token/Token";
import {
    LoadingOutlined,
    PlusOutlined,
    InboxOutlined,
} from "@ant-design/icons";
import { message } from "antd";
import IntlMessages from "util/IntlMessages";
import fileSaver from "file-saver";
import Markdown from "markdown-to-jsx";
import botapi from "../../serverless/botapi";

import {
    updateAddress,
    updateVirtuosoBalance,
    updatePublicKey,
} from "../../appRedux/actions";
import {
    minaLogin,
    virtuosoRegisterPublicKey,
    virtuosoMint,
    isModerator,
    getVirtuosoBalance,
    getSignature,
} from "../../blockchain/mina";

import logger from "../../serverless/logger";
const logm = logger.info.child({
    winstonModule: "Mint",
    winstonComponent: "Custom",
});

const {
    addFileHashToIPFS,
    addToIPFS,
    encryptUnlockableToken,
    writeToken,
} = require("../../blockchain/ipfs");

const { TextArea } = Input;
const { Option } = Select;
const Dragger = Upload.Dragger;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

const startToken = {
    tokenId: "@mynft",
    updated: 1633284972170,
    creator: "",
    name: "",
    description: "",
    url: "",
    shortdescription: "",
    saleID: "0",
    onSale: false,
    saleStatus: "not on sale",
    price: 0,
    currency: "USD",
    category: "Music",
    image: "",
    type: "individual",
    contains_private_content: false,
    private_content_description: "",
    uri: {
        name: "",
        type: "object",
        image: "",
        external_url: "minanft.io",
        animation_url: "",
        description: "",
        license: "Mina NFT License Agreement V1",
        license_id: "1",
        license_url: "https://minanft.io/agreement/MinaNFT_agreement_v1.pdf",
        contains_private_content: false,
        properties: {
            image: "",
            animation: "",
        },
        attributes: [
            {
                trait_type: "Artist",
                value: "",
            },
        ],
    },
    //  "objectID": "80001.0x49368c4ed51be6484705f07b63ebd92270923081.17",
    unlockable: {
        media: "",
        attachments: "",
    },
    main: {
        image: "",
        video: "",
        media: "",
        attachments: "",
    },
    folder: "",
};

const STARTING_JSON = {
    name: "@mynft",
    description: "",
    url: "",
    type: "object",
    image: "",
    category: "",
    type: "individual",
    external_url: "minanft.io",
    animation_url: "",

    license: "Mina NFT V1",
    license_id: "0",
    title: "",
    properties: { image: "", animation: "" },
    private_content_description: "",
    contains_private_content: false,
    private: {
        image: "",
        video: "",
        audio: "",
        pdf: "",
        files: "",
        files_number: 0,
    },
};

const DEBUG = "true" === process.env.REACT_APP_DEBUG;
//const mintPrivateText = '$10 to create one Private NFT token. Private NFT token will not be visible on Mina NFT marketplace except for sale';
const mintText = "$9 to create one Mina Avatar NFT token";

const MintPrivate = () => {
    const address = useSelector(({ blockchain }) => blockchain.address);
    const publicKey = useSelector(({ blockchain }) => blockchain.publicKey);
    const username = useSelector(({ blockchain }) => blockchain.username);
    const dispatch = useDispatch();

    const [token, setToken] = useState(startToken);
    const [ipfs, setIpfs] = useState("");
    const [auth, setAuth] = useState("");
    const [counter, setCounter] = useState(0);
    const [loadingImage, setLoadingImage] = useState(false);
    const [minting, setMinting] = useState(false);
    const [loadingVideo, setLoadingVideo] = useState(false);
    const [showUnlockable, setShowUnlockable] = useState(false);
    const [mintDisabled, setMintDisabled] = useState(true);
    const [mintPrice, setMintPrice] = useState(mintText);
    const [form] = Form.useForm();

    const checkCanMint = () => {
        let newMintDisabled = true;
        if (ipfs !== "") newMintDisabled = false;
        else if (
            token.name !== "" &&
            token.description !== "" &&
            token.main.image !== ""
        )
            newMintDisabled = false;
        if (newMintDisabled !== mintDisabled) setMintDisabled(newMintDisabled);
    };

    const onValuesChange = async (values) => {
        if (DEBUG) console.log("onValuesChange", values);
        let newToken = token;

        if (values.name !== undefined) newToken.name = values.name; //TODO: check name
        if (values.url !== undefined) newToken.url = values.url;
        if (values.description !== undefined)
            newToken.description = values.description;
        if (values.unlockable_description !== undefined)
            newToken.unlockable_description = values.unlockable_description;
        if (values.category !== undefined) newToken.category = values.category;
        if (values.private_key1 !== undefined)
            newToken.private_key1 = values.private_key1;
        if (values.private_key2 !== undefined)
            newToken.private_key2 = values.private_key2;
        if (values.private_value1 !== undefined)
            newToken.private_value1 = values.private_value1;
        if (values.private_value2 !== undefined)
            newToken.private_value2 = values.private_value2;
        if (values.auth !== undefined) setAuth(values.auth);

        if (values.type !== undefined) {
            newToken.type = values.type;
        }

        if (values.mainimage !== undefined)
            newToken.main.image = values.mainimage.file;
        if (values.mainvideo !== undefined)
            newToken.main.video = values.mainvideo.file;
        if (values.media !== undefined)
            newToken.main.media = values.media.fileList;
        if (values.attachments !== undefined)
            newToken.main.attachments = values.attachments.fileList;
        if (values.umedia !== undefined)
            newToken.unlockable.media = values.umedia.fileList;
        if (values.uattachments !== undefined)
            newToken.unlockable.attachments = values.uattachments.fileList;

        if (values.folder !== undefined) newToken.folder = values.folder;

        setToken(newToken);
        setCounter(counter + 1);
        checkCanMint();
    };

    const onFinish = async (values) => {
        if (DEBUG) console.log("onFinish", values);
    };

    const categoryChange = (value) => {
        if (DEBUG) console.log("categoryChange", value);
        let newToken = token;
        newToken.category = value;
        setToken(newToken);
        setCounter(counter + 1);
        checkCanMint();
    };

    const beforeUpload = (file) => {
        return false;
    };

    const mint = async () => {
        const key = "Minting Mina Avatar NFT";

        try {
            setMinting(true);

            if (DEBUG) console.log("Mint token: ", ipfs, token);
            if (ipfs !== "" && auth == "") {
                message.loading({
                    content: `Deploying Mina NFT token - open telegram`,
                    key,
                    duration: 240,
                });
                const linkURL = "https://t.me/minanft_bot?start=" + ipfs;
                window.open(linkURL);
                setToken(startToken);
                setMinting(false);
                return;
            } else if (ipfs !== "") {
                message.loading({
                    content: `Deploying Mina NFT token - see messages in telegram`,
                    key,
                    duration: 240,
                });
                await botapi.mint(auth, ipfs);
                setToken(startToken);
                setMinting(false);
                return;
            }

            setMinting(true);

            message.loading({
                content: `Minting Mina NFT token - uploading to IPFS`,
                key,
                duration: 240,
            });

            let unlockableResult = { path: "" };
            /*
    if(token.contains_private_content === true && !moderator)
    {
        let key = publicKey;
        if (key === "") key = await register();
        const encryptedContent = await encryptUnlockableToken(token, key);
        if( encryptedContent.key !== "") unlockableResult = await addToIPFS(JSON.stringify(encryptedContent));
    };
*/
            const mintJSON = await writeToken(token, true);

            let result = { path: "" };
            const strJSON = JSON.stringify(mintJSON);
            const blob = new Blob([strJSON], {
                type: "text/plain;charset=utf-8",
            });
            fileSaver.saveAs(blob, "minanft.json");
            message.success({
                content: `Mina NFT JSON downloaded`,
                key,
                duration: 10,
            });

            result = await addToIPFS(JSON.stringify(mintJSON));
            /*
    if( moderator )
    {
        const strJSON = JSON.stringify(mintJSON);
        const blob = new Blob([strJSON], {type: "text/plain;charset=utf-8"});
        fileSaver.saveAs(blob, "content.json");
        message.success({content: `JSON downloaded`, key, duration: 10});
        setMinting(false);
        return;
    }
    else
    {
        result = await addToIPFS(JSON.stringify(mintJSON));
    };
*/

            if (DEBUG) console.log("ipfsHash uploaded - uri: ", result.path); //, " unlockable: ", unlockableResult.path);
            if (result.path) setIpfs(result.path);
            //if(DEBUG) console.log("Minting NFT with IPFS hashes ", result.path, unlockableResult.path )

            /*
    const myaddress = await minaLogin(false);
    const mybalance = await getVirtuosoBalance(myaddress);

    if( token.type === 'private' && mybalance >= 100)
    {
            message.loading({content: `Minting NFT token - sending transaction to blockchain with IPFS hash ${result.path}`, key, duration: 240});

            const txresult = await virtuosoMint(myaddress, result.path, unlockableResult.path, false, "");
            if(DEBUG) console.log("Mint  tx: ", txresult );
            message.success({content: `NFT token minted successfully with transaction hash ${txresult.hash}`, key, duration: 10});

    }
    else
    {
           message.loading({content: `Minting NFT token - preparing checkout session`, key, duration: 240});

           const data = {
                                type:    "mintItem",
                                minttype: "custom",
                                id: mintJSON.id,
                                time: mintJSON.time,
                                tokenId: 0,
                                price: (token.type === 'private')?10:100,
                                currency: "usd",
                                image: mintJSON.image,
                                name: token.name,
                                address:  (myaddress==="")?"generate":myaddress,
                                newTokenURI: result.path,
                                unlockableContentKey: unlockableResult.path,
                                onEscrow: false,
                                dynamicUri: "",
                                winstonMeta: JSON.stringify(logger.meta)
                              };

            let form = document.createElement('form');
            form.action =  "/api/create-checkout-session?item=" + encodeURIComponent(JSON.stringify(data));
            form.method = 'POST';
            document.body.append(form);
            form.submit();
    };


    //const txresult = await api.mint(address, result.path, unlockableResult.path, false, "");
    //if(DEBUG) console.log("Mint  tx: ", txresult );
    //if( txresult.success ) message.success({content: `NFT token minted successfully with transaction hash ${txresult.data.hash}`, key, duration: 10});
    //else message.error({content: `Error: NFT token was not minted`, key, duration: 10});

    //message.success({content: `NFT token minted successfully with transaction hash ${txresult.hash}`, key, duration: 10});
    
    */
            setToken(startToken);
            if (address !== "") await getSignature(strJSON);
            setMinting(false);
        } catch (error) {
            console.log("Mint error", error);
            setMinting(false);
            message.error({
                content: `Error minting NFT token: ${error}`,
                key,
                duration: 30,
            });
        }
    };

    checkCanMint();

    return (
        <div className="gx-main-content">
            <Row>
                <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
                    <Card className="gx-card" title="Create Mina Avatar NFT">
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
                                        name="mainimage"
                                        label="Main image"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    "Please upload NFT image",
                                            },
                                        ]}
                                    >
                                        <Upload
                                            name="mainimage"
                                            listType="picture-card"
                                            className="avatar-uploader"
                                            accept="image/*"
                                            showUploadList={true}
                                            multiple={false}
                                            maxCount={1}
                                            beforeUpload={beforeUpload}
                                        >
                                            {" "}
                                            <div>
                                                <PlusOutlined />
                                                <div className="ant-upload-text">
                                                    Main Image
                                                </div>
                                            </div>
                                        </Upload>
                                    </Form.Item>

                                    <Form.Item
                                        label="Name (like @myminanft)"
                                        name="name"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Please name your NFT",
                                            },
                                        ]}
                                        placeholder="Please name your NFT like @myminanft"
                                    >
                                        <Input />
                                    </Form.Item>

                                    <Form.Item
                                        label={
                                            <span>
                                                <span>
                                                    Description - supports
                                                </span>
                                                <span>
                                                    {" "}
                                                    <a
                                                        href="https://www.markdownguide.org/cheat-sheet/"
                                                        target="_blank"
                                                    >
                                                        markdown
                                                    </a>
                                                </span>
                                            </span>
                                        }
                                        name="description"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    "Please describe your NFT",
                                            },
                                        ]}
                                        placeholder="Please describe your NFT"
                                    >
                                        <TextArea
                                            autoSize={{
                                                minRows: 2,
                                                maxRows: 10,
                                            }}
                                        />
                                    </Form.Item>
                                    <Form.Item
                                        label="Description preview"
                                        name="descriptionpreview"
                                    >
                                        <Markdown>{token.description}</Markdown>
                                    </Form.Item>
                                </Col>

                                <Col
                                    xxl={10}
                                    xl={8}
                                    lg={10}
                                    md={10}
                                    sm={12}
                                    xs={16}
                                >
                                    <Form.Item
                                        name="mainvideo"
                                        label="Main Video/Audio"
                                    >
                                        <Upload
                                            name="video"
                                            listType="picture-card"
                                            className="avatar-uploader"
                                            accept="video/*,audio/*"
                                            showUploadList={true}
                                            multiple={false}
                                            maxCount={1}
                                            //action="//jsonplaceholder.typicode.com/posts/"
                                            beforeUpload={beforeUpload}
                                            //onChange={this.handleChange}
                                        >
                                            <div>
                                                <PlusOutlined />
                                                <div className="ant-upload-text">
                                                    Main Video or Audio
                                                </div>
                                            </div>
                                        </Upload>
                                    </Form.Item>

                                    <Form.Item
                                        label="Type"
                                        name="type"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Please choose type",
                                            },
                                        ]}
                                    >
                                        <RadioGroup>
                                            <RadioButton value="individual">
                                                Individual
                                            </RadioButton>
                                            <RadioButton value="corporate">
                                                Corporate
                                            </RadioButton>
                                        </RadioGroup>
                                    </Form.Item>
                                    <Form.Item
                                        name="category"
                                        label="Category"
                                        hasFeedback
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    "Please select category",
                                            },
                                        ]}
                                    >
                                        <Select
                                            placeholder="Please select a category"
                                            onChange={categoryChange}
                                        >
                                            <Option value="Music">Music</Option>
                                            <Option value="Video">Video</Option>
                                            <Option value="Art">Art</Option>
                                            <Option value="Dance">Dance</Option>
                                            <Option value="Document">
                                                Document
                                            </Option>
                                            <Option value="Business">
                                                Business
                                            </Option>
                                            <Option value="Transaction">
                                                Transaction
                                            </Option>
                                            <Option value="Technology">
                                                Technology
                                            </Option>
                                            <Option value="Blockchain">
                                                Blockchain
                                            </Option>
                                            <Option value="MINA protocol">
                                                MINA protocol
                                            </Option>
                                            <Option value="Health">
                                                Health
                                            </Option>
                                            <Option value="Event">Event</Option>
                                        </Select>
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
                                        name="media"
                                        label="Additional Media"
                                    >
                                        <Upload
                                            name="additionalmedia"
                                            listType="picture-card"
                                            className="avatar-uploader"
                                            accept="image/*,video/*,audio/*,.pdf"
                                            showUploadList={true}
                                            multiple={true}
                                            showUploadList={true}
                                            //action="//jsonplaceholder.typicode.com/posts/"
                                            beforeUpload={beforeUpload}
                                            //onChange={this.handleChange}
                                        >
                                            {" "}
                                            <div>
                                                <PlusOutlined />
                                                <div className="ant-upload-text">
                                                    Image Video Audio PDF
                                                </div>
                                            </div>
                                        </Upload>
                                    </Form.Item>
                                </Col>
                                <Col
                                    xxl={10}
                                    xl={8}
                                    lg={10}
                                    md={10}
                                    sm={12}
                                    xs={16}
                                >
                                    <Form.Item
                                        name="attachments"
                                        label="Attachments"
                                    >
                                        <Upload
                                            name="attachments"
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
                                                    Any files
                                                </div>
                                            </div>
                                        </Upload>
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
                                <Col
                                    xxl={12}
                                    xl={12}
                                    lg={14}
                                    md={24}
                                    sm={24}
                                    xs={24}
                                >
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
                                <Col
                                    xxl={12}
                                    xl={12}
                                    lg={14}
                                    md={24}
                                    sm={24}
                                    xs={24}
                                >
                                    <Form.Item
                                        label="Public key 2 (will be published to IPFS)"
                                        name="public_key2"
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
                                        label="Public value 2 (will be published to IPFS)"
                                        name="public_value2"
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
                                    xxl={24}
                                    xl={24}
                                    lg={24}
                                    md={24}
                                    sm={24}
                                    xs={24}
                                >
                                    <Card
                                        className="gx-card"
                                        title="Private data - will be verifiable on-chain without disclosing content"
                                    />
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
                                <Col
                                    xxl={12}
                                    xl={12}
                                    lg={14}
                                    md={24}
                                    sm={24}
                                    xs={24}
                                >
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
                                <Col
                                    xxl={12}
                                    xl={12}
                                    lg={14}
                                    md={24}
                                    sm={24}
                                    xs={24}
                                >
                                    <Form.Item
                                        label="Private key 2 (will NOT be published to IPFS)"
                                        name="private_key2"
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
                                        label="Private value 2 (will NOT be published to IPFS, but will be verifiable on-chain)"
                                        name="private_value2"
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
                                        name="umedia"
                                        label={
                                            <span>
                                                <span>
                                                    Private Media - will NOT be
                                                    uploaded to IPFS. To make
                                                    media, other binary files
                                                    and big text files
                                                    verifiable on-chain use
                                                </span>
                                                <span>
                                                    {" "}
                                                    <a
                                                        href="https://github.com/dfstio/minanft-cli"
                                                        target="_blank"
                                                    >
                                                        MinaNFT offline CLI tool
                                                    </a>
                                                </span>
                                            </span>
                                        }
                                    >
                                        <Upload
                                            name="unlockablemedia"
                                            listType="picture-card"
                                            className="avatar-uploader"
                                            accept="image/*,video/*,audio/*,.pdf"
                                            showUploadList={true}
                                            multiple={true}
                                            showUploadList={true}
                                            //action="//jsonplaceholder.typicode.com/posts/"
                                            beforeUpload={beforeUpload}
                                            //onChange={this.handleChange}
                                        >
                                            {" "}
                                            <div>
                                                <PlusOutlined />
                                                <div className="ant-upload-text">
                                                    Image Video Audio PDF
                                                </div>
                                            </div>
                                        </Upload>
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Item
                                        name="uattachments"
                                        label="Private Attachments - will NOT be uploaded to IPFS, but will be verifiable on-chain (if needed in sanitised form) for text files less than 1k in size. You can put key-value pairs in text file, in this case both keys and values will NOT be uploaded to IPFS, but will be verifiable on-chain"
                                    >
                                        <Upload
                                            name="uattachments"
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
                                                    Any files
                                                </div>
                                            </div>
                                        </Upload>
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Form.Item label="Price" name="price">
                                {mintPrice}
                            </Form.Item>

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
                                    autoSize={{ minRows: 2, maxRows: 3 }}
                                />
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    onClick={mint}
                                    disabled={mintDisabled}
                                    loading={minting}
                                >
                                    {ipfs == ""
                                        ? "Create Mina NFT"
                                        : auth == ""
                                        ? "Deploy NFT with @MinaNFT_bot"
                                        : "Deploy NFT"}
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default MintPrivate;
