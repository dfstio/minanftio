import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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
  Checkbox,
} from "antd";
import {
  LoadingOutlined,
  PlusOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { message } from "antd";
import IntlMessages from "util/IntlMessages";
import Markdown from "markdown-to-jsx";
import botapi from "../../serverless/botapi";
import { post, waitForPost } from "./post";
import fileSaver from "file-saver";
import { updateAddress } from "../../appRedux/actions";
import { minaLogin } from "../../blockchain/mina";
import { getFileData } from "../../blockchain/file";

import logger from "../../serverless/logger";
import { set } from "lodash";
import {
  footerText,
  footerAgreement,
  footerContact,
  footerAgreementLink,
  footerEmail,
  accountingEmail,
} from "../../util/config";
const logm = logger.info.child({
  winstonModule: "Mint",
  winstonComponent: "Custom",
});

/*
const {
  addFileHashToIPFS,
  addToIPFS,
  encryptUnlockableToken,
  writeToken,
} = require("../../blockchain/ipfs");
const { REACT_APP_DEBUG, REACT_APP_PINATA_JWT, REACT_APP_JWT } = process.env;
*/

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
  category: "MINA protocol",
  image: "",
  type: "individual",
  contains_private_content: false,
  private_content_description: "",
  storagetype: "IPFS",
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
  json: "",
};

/*
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
*/

const DEBUG = "true" === process.env.REACT_APP_DEBUG;
const { REACT_APP_PINATA_JWT } = process.env;
//const mintPrivateText = '$10 to create one Private NFT token. Private NFT token will not be visible on Mina NFT marketplace except for sale';
const mintText = "Free to create Mina NFT token for Christmas and New Year";
//"$9 to create one Mina Avatar NFT token";

const Post = () => {
  const address = useSelector(({ blockchain }) => blockchain.address);
  const publicKey = useSelector(({ blockchain }) => blockchain.publicKey);
  const username = useSelector(({ blockchain }) => blockchain.username);
  const dispatch = useDispatch();

  const [token, setToken] = useState(startToken);
  const [ipfs, setIpfs] = useState("");
  const [auth, setAuth] = useState("");
  const [link, setLink] = useState("");
  const [hash, setHash] = useState("");
  const [showLink, setShowLink] = useState(false);
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
    if (address === "") newMintDisabled = false;
    else if (token.name !== "" && token.main.image !== "")
      newMintDisabled = false;
    if (newMintDisabled !== mintDisabled) setMintDisabled(newMintDisabled);
  };

  const onValuesChange = async (values) => {
    if (DEBUG) console.log("onValuesChange", values);
    let newToken = token;

    if (values.name !== undefined)
      newToken.name = values.name[0] == "@" ? values.name : "@" + values.name; //TODO: check name
    //if (values.url !== undefined) newToken.url = values.url;
    if (values.description !== undefined)
      newToken.description = values.description;
    if (values.unlockable_description !== undefined)
      newToken.unlockable_description = values.unlockable_description;
    if (values.category !== undefined) newToken.category = values.category;
    if (values.public_key1 !== undefined)
      newToken.public_key1 = values.public_key1;
    if (values.public_key2 !== undefined)
      newToken.public_key2 = values.public_key2;
    if (values.public_value1 !== undefined)
      newToken.public_value1 = values.public_value1;
    if (values.public_value2 !== undefined)
      newToken.public_value2 = values.public_value2;
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
    if (values.media !== undefined) newToken.main.media = values.media.fileList;
    if (values.attachments !== undefined)
      newToken.main.attachments = values.attachments.fileList;
    if (values.umedia !== undefined)
      newToken.unlockable.media = values.umedia.fileList;
    if (values.uattachments !== undefined)
      newToken.unlockable.attachments = values.uattachments.fileList;

    if (values.folder !== undefined) newToken.folder = values.folder;
    if (values.calculateroot !== undefined)
      newToken.calculateroot = values.calculateroot;
    if (values.storagetype !== undefined)
      newToken.storagetype = values.storagetype;

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
    if (address === "") {
      const newAddress = await minaLogin();
      console.log("newAddress", newAddress);
      dispatch(updateAddress(newAddress));
      checkCanMint();
      return;
    }

    const key = "Minting Mina Avatar Post";

    try {
      setMinting(true);
      message.loading({
        content: `Minting post: creating token metadata`,
        key,
        duration: 240,
      });
      const name = token.name;
      let mintResult = await post(address, auth, token);
      console.log("Mint result", mintResult);
      if (
        mintResult?.success === true &&
        mintResult?.jobId !== undefined &&
        mintResult?.json !== undefined
      ) {
        message.loading({
          content: `Started mint job ${mintResult.jobId}`,
          key,
          duration: 240,
        });
        const blob = new Blob([mintResult.json], {
          type: "text/plain;charset=utf-8",
        });
        fileSaver.saveAs(blob, name + ".json");
      } else {
        message.error({
          content: `Error minting post: ${mintResult?.error ?? ""} ${
            mintResult?.reason ?? ""
          }`,
          key,
          duration: 20,
        });
        setMinting(false);
        return;
      }
      const jobId = mintResult.jobId;
      mintResult = await waitForPost(jobId, auth);
      if (mintResult?.success === true && mintResult?.hash !== undefined) {
        message.success({
          content: `Post minted successfully with transaction hash ${mintResult.hash}`,
          key,
          duration: 240,
        });
        const linkURL = "https://minanft.io/" + name;
        console.log("linkURL", linkURL);
        const openResult = window.open(linkURL, "_blank");
        console.log("openResult", openResult);
        setLink(linkURL);
        setHash("https://minascan.io/testworld/tx/" + mintResult.hash);
        setShowLink(true);
      } else
        message.error({
          content: `Error minting post: ${mintResult?.error ?? ""} ${
            mintResult?.reason ?? ""
          }`,
          key,
          duration: 60,
        });

      /*

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


      if (DEBUG) console.log("ipfsHash uploaded - uri: ", result.path); //, " unlockable: ", unlockableResult.path);
      if (result.path) setIpfs(result.path);
      //if(DEBUG) console.log("Minting NFT with IPFS hashes ", result.path, unlockableResult.path )


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
      //setToken(startToken);
      //if (address !== "") await getSignature(strJSON);
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
          <Card className="gx-card" title=<IntlMessages id={"create.post"} />>
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
                <Col xxl={12} xl={12} lg={14} md={24} sm={24} xs={24}>
                  <Form.Item
                    name="json"
                    label="Upload JSON with NFT data here"
                    rules={[
                      {
                        required: true,
                        message: "Please upload JSON with NFT data here",
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
                        <div className="ant-upload-text">Main Image</div>
                      </div>
                    </Upload>
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col xxl={12} xl={12} lg={14} md={24} sm={24} xs={24}>
                  <Form.Item
                    label="Post name"
                    name="name"
                    rules={[
                      {
                        required: true,
                        message: "Please name your post",
                      },
                    ]}
                    placeholder="Please name your NFT like @myminanft"
                  >
                    <Input maxLength={30} showCount={true} />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span>
                        <span>
                          <IntlMessages id={"create.description"} />
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
                        required: false,
                        message: "Please describe your NFT",
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

                <Col xxl={10} xl={8} lg={10} md={10} sm={12} xs={16}>
                  <Form.Item
                    name="mainimage"
                    label="Main post image"
                    rules={[
                      {
                        required: false,
                        message: "Please upload post image",
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
                        <div className="ant-upload-text">Main Image</div>
                      </div>
                    </Upload>
                  </Form.Item>

                  <Form.Item name="mainvideo" label="Main Video/Audio">
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
                </Col>
              </Row>

              <Row>
                <Col xxl={12} xl={12} lg={14} md={24} sm={24} xs={24}>
                  <Form.Item name="media" label="Additional Media">
                    <Upload
                      name="additionalmedia"
                      listType="picture-card"
                      className="avatar-uploader"
                      accept="image/*,video/*,audio/*,.pdf"
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
                          Image Video Audio PDF
                        </div>
                      </div>
                    </Upload>
                  </Form.Item>
                </Col>
                <Col xxl={10} xl={8} lg={10} md={10} sm={12} xs={16}>
                  <Form.Item name="attachments" label="Attachments">
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
                        <div className="ant-upload-text">Any files</div>
                      </div>
                    </Upload>
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
                    <Input maxLength={30} showCount={true} />
                  </Form.Item>
                </Col>
                <Col xxl={12} xl={12} lg={14} md={24} sm={24} xs={24}>
                  <Form.Item
                    label="Public value 1 (will be published to IPFS)"
                    name="public_value1"
                    placeholder="Some string (less than 30 chars)"
                  >
                    <Input maxLength={30} showCount={true} />
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col xxl={12} xl={12} lg={14} md={24} sm={24} xs={24}>
                  <Form.Item
                    label="Public key 2 (will be published to IPFS)"
                    name="public_key2"
                    placeholder="Some string (less than 30 chars)"
                  >
                    <Input maxLength={30} showCount={true} />
                  </Form.Item>
                </Col>
                <Col xxl={12} xl={12} lg={14} md={24} sm={24} xs={24}>
                  <Form.Item
                    label="Public value 2 (will be published to IPFS)"
                    name="public_value2"
                    placeholder="Some string (less than 30 chars)"
                  >
                    <Input maxLength={30} showCount={true} />
                  </Form.Item>
                </Col>
              </Row>

              <Row>
                <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
                  <Card
                    className="gx-card"
                    title="Private data - will be verifiable on-chain without disclosing content"
                  />
                </Col>
              </Row>
              <Row>
                <Col xxl={12} xl={12} lg={14} md={24} sm={24} xs={24}>
                  <Form.Item
                    label="Private key 1 (will NOT be published to IPFS)"
                    name="private_key1"
                    placeholder="Some string (less than 30 chars)"
                  >
                    <Input maxLength={30} showCount={true} />
                  </Form.Item>
                </Col>
                <Col xxl={12} xl={12} lg={14} md={24} sm={24} xs={24}>
                  <Form.Item
                    label="Private value 1 (will NOT be published to IPFS, but will be verifiable on-chain)"
                    name="private_value1"
                    placeholder="Some string (less than 30 chars)"
                  >
                    <Input maxLength={30} showCount={true} />
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col xxl={12} xl={12} lg={14} md={24} sm={24} xs={24}>
                  <Form.Item
                    label="Private key 2 (will NOT be published to IPFS)"
                    name="private_key2"
                    placeholder="Some string (less than 30 chars)"
                  >
                    <Input maxLength={30} showCount={true} />
                  </Form.Item>
                </Col>
                <Col xxl={12} xl={12} lg={14} md={24} sm={24} xs={24}>
                  <Form.Item
                    label="Private value 2 (will NOT be published to IPFS, but will be verifiable on-chain)"
                    name="private_value2"
                    placeholder="Some string (less than 30 chars)"
                  >
                    <Input maxLength={30} showCount={true} />
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col xxl={12} xl={12} lg={14} md={24} sm={24} xs={24}>
                  <Form.Item
                    label={<span>Private description</span>}
                    name="unlockable_description"
                    rules={[
                      {
                        required: false,
                        message: "Please enter private description",
                      },
                    ]}
                    placeholder="Please enter private description"
                  >
                    <TextArea
                      autoSize={{
                        minRows: 2,
                        maxRows: 10,
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col xxl={12} xl={12} lg={14} md={24} sm={24} xs={24}>
                  <Form.Item
                    name="umedia"
                    label={
                      <span>
                        <span>
                          Private Media - will NOT be uploaded to IPFS. To make
                          media, other binary files and big text files
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
                <Col xxl={12} xl={12} lg={14} md={24} sm={24} xs={24}>
                  <Form.Item
                    name="uattachments"
                    label="Private Attachments - will NOT be uploaded to IPFS, but will be verifiable on-chain (if needed in sanitised form) in case checkbox below is checked"
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
                        <div className="ant-upload-text">Any files</div>
                      </div>
                    </Upload>
                  </Form.Item>
                  <Form.Item name="calculateroot" valuePropName="checked">
                    <Checkbox>
                      Calculate Merkle Tree root of the private attachments
                      (takes time)
                    </Checkbox>
                  </Form.Item>
                </Col>
                <Col xxl={12} xl={12} lg={14} md={24} sm={24} xs={24}>
                  <Form.Item
                    label="NFT Storage"
                    name="storagetype"
                    rules={[
                      {
                        required: true,
                        message: "Please choose storage",
                      },
                    ]}
                  >
                    <RadioGroup>
                      <RadioButton value="IPFS">IPFS</RadioButton>
                      <RadioButton value="Arweave">Arweave</RadioButton>
                    </RadioGroup>
                  </Form.Item>
                </Col>
              </Row>
              {/*
              <Form.Item label="Price" name="price">
                {mintPrice}
              </Form.Item>
                  */}

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
                <TextArea autoSize={{ minRows: 2, maxRows: 3 }} />
              </Form.Item>
              <Form.Item>
                <div
                  className="gx-mt-4"
                  style={{
                    whiteSpace: "pre-wrap",
                  }}
                >
                  <span>
                    {address === ""
                      ? "Please connect with Auro before creating post"
                      : "You are creating post with owner address " + address}
                    <br />
                    <br />
                    By clicking this button, you are confirming your agreement
                    with our
                  </span>
                  <span>
                    <a href={footerAgreementLink} target="_blank">
                      {footerAgreement}
                    </a>
                  </span>
                </div>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  onClick={mint}
                  disabled={mintDisabled}
                  loading={minting}
                >
                  {address === "" ? "Connect with AURO" : "Mint Post"}
                </Button>
              </Form.Item>
              <Form.Item
                label="Post is minted: "
                name="mintedlink"
                hidden={!showLink}
              >
                <div>
                  <a href={link} target="_blank">
                    {link}
                  </a>
                </div>
                <div>
                  <a href={hash} target="_blank">
                    {hash}
                  </a>
                </div>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Post;
