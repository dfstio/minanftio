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
  InputNumber,
  Timeline,
} from "antd";
import {
  LoadingOutlined,
  PlusOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { explorerTransaction } from "../../blockchain/explorer";
//import { message } from "antd";
import IntlMessages from "util/IntlMessages";
import Markdown from "markdown-to-jsx";
import { mintNFT } from "../../nft/mint";
import { waitForTransaction } from "../../nft/send";
import { loadLibraries } from "../../nft/libraries";
//import { mintRollupNFT } from "./rollup";
import fileSaver from "file-saver";
import { updateAddress } from "../../appRedux/actions";
import { minaLogin } from "../../blockchain/mina";
import { nftPrice } from "../../nft/pricing";
import { lookupName } from "../../nft/name";
import { reservedNames } from "../../nft/reservednames";
import { isMobile } from "react-device-detect";

import {
  footerText,
  footerAgreement,
  footerContact,
  footerAgreementLink,
  footerEmail,
  accountingEmail,
} from "../../util/config";

import logger from "../../serverless/logger";
import { add } from "winston";
import { set } from "nprogress";
const log = logger.info.child({
  winstonModule: "Create",
  winstonComponent: "Mint",
});
const { REACT_APP_PINATA_JWT } = process.env;
const { TextArea } = Input;
const { Option } = Select;
const Dragger = Upload.Dragger;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const noMobileTxs =
  isMobile && process.env.REACT_APP_CHAIN_ID === "mina:mainnet";

const startToken = {
  name: "",
  description: "",
  sellPrice: "",
  image: "",
  collection: "",
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

const DEBUG = "true" === process.env.REACT_APP_DEBUG;

const Mint = () => {
  const address = useSelector(({ blockchain }) => blockchain.address);
  const publicKey = useSelector(({ blockchain }) => blockchain.publicKey);
  const username = useSelector(({ blockchain }) => blockchain.username);
  const dispatch = useDispatch();

  const [token, setToken] = useState(startToken);
  const [keys, setKeys] = useState([
    { key: "", value: "", isPrivate: true },
    { key: "", value: "", isPrivate: true },
  ]);
  const [nameField, setNameField] = useState("");
  const [nameAvailable, setNameAvailable] = useState(false);
  const [validateStatus, setValidateStatus] = useState("validating");
  const [help, setHelp] = useState("");
  const [hot, setHot] = useState(false);
  const [collection, setCollection] = useState("Collection");
  const [showLink, setShowLink] = useState(false);
  const [counter, setCounter] = useState(0);
  const [minting, setMinting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mintDisabled, setMintDisabled] = useState(true);
  const [form] = Form.useForm();
  const [image, setImage] = useState(undefined);
  const [url, setUrl] = useState(undefined);
  const [timeline, setTimeline] = useState([]);
  const [pending, setPending] = useState(undefined);
  const [libraries, setLibraries] = useState(undefined);

  function warm() {
    if (hot) return;
    setHot(true);
    lookupName("test", address);
    if (libraries === undefined) setLibraries(loadLibraries());
  }

  useEffect(() => {
    async function nameChanged() {
      const name = nameField[0] === "@" ? nameField.slice(1) : nameField;
      if (DEBUG) console.log("name", name);
      if (name.length < 3) {
        setHelp("Name must be at least 3 characters long");
        setNameAvailable(false);
        setValidateStatus("warning");
        warm();
        return;
      }
      if (
        reservedNames.includes(name.toLowerCase().substring(0, 30)) === true
      ) {
        setHelp("This name is reserved");
        setValidateStatus("error");
        setNameAvailable(false);
        warm();
        return;
      }

      function validateName(value) {
        if (value.length > 30) return false;
        if (value.length <= 2) return true;
        const regExp = /^[a-zA-Z][\w\s]+$/g;
        return regExp.test(value.substring(1));
      }

      if (validateName(name)) {
        const status = await lookupName(name, address);
        if (DEBUG) console.log("status", status);
        if (status.success === false) {
          setHelp("Error in name lookup");
          setValidateStatus("error");
          console.error("Error in name lookup", status);
          return;
        }
        if (
          status.found === true &&
          status?.address?.toLowerCase() !== address?.toLowerCase()
        ) {
          setHelp("This name is already registered");
          setNameAvailable(false);
          setValidateStatus("error");
          return;
        } else {
          if (status.alreadyMinted) {
            setHelp("This NFT is already minted");
            setNameAvailable(false);
            setValidateStatus("error");
            return;
          }
          const priceObject = nftPrice(name);
          if (priceObject === "This name is reserved.") {
            setHelp("This name is reserved.");
            setNameAvailable(false);
            setValidateStatus("error");
          } else if (priceObject !== undefined) {
            setHelp(
              "This name is available: " +
                priceObject.price +
                " " +
                priceObject.currency
            );
            setNameAvailable(true);
            setValidateStatus("success");
          } else {
            console.error("Invalid price object", priceObject);
            setHelp("Invalid price object while checking the name");
            setNameAvailable(true);
            setValidateStatus("error");
          }
          return;
        }
      } else {
        setHelp(
          "Invalid name, must contains only letters, spaces and digits, starts with letter, be less than 30 chars"
        );
        setNameAvailable(false);
        setValidateStatus("error");
        warm();
      }
    }
    nameChanged();
  }, [nameField]);

  useEffect(() => {
    async function checkCanMint() {
      setMintDisabled(nameAvailable && image !== undefined ? false : true);
    }
    checkCanMint();
  }, [nameAvailable, image]);

  const showText = async (text, color) => {
    setTimeline((prev) => {
      const newTimeline = prev;
      newTimeline.push({ text, color });
      return newTimeline;
    });
    if (color === "red") {
      const data = {
        text,
        name: nameField,
        address,
        wf: "showText",
      };
      console.error("Mint error", data);
      log.error("Mint error", data);
    }
  };

  const showPending = async (text) => {
    setPending(text);
  };

  const onValuesChange = async (values) => {
    //if (DEBUG) if(DEBUG) console.log("onValuesChange", values);
    let newToken = token;

    if (values.description !== undefined)
      newToken.description = values.description;
    if (values.sellPrice !== undefined) newToken.sellPrice = values.sellPrice;
    if (values.collection !== undefined)
      newToken.collection = values.collection;
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

    if (values.chain !== undefined) {
      newToken.chain = values.chain;
      if (DEBUG) console.log("chain", values.chain);
    }

    if (values.mainimage !== undefined) {
      newToken.main.image = values.mainimage.file;
      setImage(values.mainimage.file);
      setUrl(URL.createObjectURL(values.mainimage.file));
      if (libraries === undefined) setLibraries(loadLibraries());
    }
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
  };

  const onFinish = async (values) => {
    if (DEBUG) console.log("onFinish", values);
  };

  const beforeUpload = (file) => {
    return false;
  };

  const mint = async () => {
    if (loading) return;
    setLoading(true);
    setTimeline([]);
    setPending("Preparing mint transaction...");
    setMinting(true);

    if (noMobileTxs) {
      await showText(
        "zkApp transactions on the mobile devices will be supported in the next versions of the Auro Wallet. At the moment, please use desktop Chrome browser with Auro Wallet extension",
        "red"
      );
      setPending(undefined);
      setLoading(false);
      setMintDisabled(true);
      return;
    }

    try {
      const newAddress = await minaLogin();
      if (DEBUG) console.log("newAddress", newAddress);
      dispatch(updateAddress(newAddress));
      if (newAddress === "" || newAddress === undefined) {
        await showText("Please connect the wallet first", "red");
        setPending(undefined);
        setLoading(false);
        setMintDisabled(false);
        return;
      }
      const owner = newAddress;

      const name = nameField[0] === "@" ? nameField.slice(1) : nameField;

      if (
        token.collection === "Mad Malinois" &&
        owner !== "B62qmApAnT1tuUxhtbafkzVXdLp76qvT17GLfGdWCoe3rRWdftE2zm1"
      ) {
        await showText(
          "You are not allowed to mint in this collection. Only B62qmApAnT1tuUxhtbafkzVXdLp76qvT17GLfGdWCoe3rRWdftE2zm1 can mint",
          "red"
        );
        setPending(undefined);
        setLoading(false);
        return;
      }

      if (
        token.collection === "MINAMIE" &&
        owner !== "B62qpv3ry6VG9XU7Lyz6hFr44h33RtQo8wsAf4fr1DdhwxiLvU8ZN4y"
      ) {
        await showText(
          "You are not allowed to mint in this collection. Only B62qpv3ry6VG9XU7Lyz6hFr44h33RtQo8wsAf4fr1DdhwxiLvU8ZN4y can mint",
          "red"
        );
        setPending(undefined);
        setLoading(false);
        return;
      }

      if (
        token.collection === "MINASCHOOL" &&
        owner !== "B62qkygUsibu8sk4y3EaiRM4g5irBdyxzcX6K1QfRTBCqkJWXhikX7b"
      ) {
        await showText(
          "You are not allowed to mint in this collection. Only B62qkygUsibu8sk4y3EaiRM4g5irBdyxzcX6K1QfRTBCqkJWXhikX7b can mint",
          "red"
        );
        setPending(undefined);
        setLoading(false);
        return;
      }

      if (
        token.collection === "Chinese Zodiac" &&
        owner !== "B62qoMYozsrSWZErrmcmQXZn14HNEba7zBLrc9GU34NSP7sUbBnZ6MC"
      ) {
        await showText(
          "You are not allowed to mint in this collection. Only B62qoMYozsrSWZErrmcmQXZn14HNEba7zBLrc9GU34NSP7sUbBnZ6MC can mint",
          "red"
        );
        setPending(undefined);
        setLoading(false);
        return;
      }

      if (
        token.collection === "Mr. Bird NFT" &&
        owner !== "B62qjfdH7rsiSb8p8yxLKBwCjUuBqgu36bVjjaAqTPm7aNGN42AWPkF"
      ) {
        await showText(
          "You are not allowed to mint in this collection. Only B62qjfdH7rsiSb8p8yxLKBwCjUuBqgu36bVjjaAqTPm7aNGN42AWPkF can mint",
          "red"
        );
        setPending(undefined);
        setLoading(false);
        return;
      }

      /*
      export async function mintNFT(
        params
        /*: {
        name: string;
        image: File;
        collection: string;
        description: string;
        price: number;
        keys: ProofOfNFT[];
        developer: string;
        repo: string;
        owner: string;
        chain: blockchain;
        contractAddress: string;
        pinataJWT: string;
        jwt: string;
      }*/
      const checkedKeys = [];
      for (const key of keys) {
        if (key.key !== "" && key.value !== "") checkedKeys.push(key);
      }

      let mintResult = await mintNFT({
        name,
        image: token.main.image,
        collection: token.collection,
        description: token.description,
        price:
          token.sellPrice && token.sellPrice !== ""
            ? parseFloat(token.sellPrice)
            : 0,
        keys: checkedKeys,
        developer: "DFST",
        repo: "minanft_io",
        owner,
        pinataJWT: REACT_APP_PINATA_JWT,
        showText,
        showPending,
        libraries: libraries ?? loadLibraries(),
      });
      const jobId = mintResult.jobId;
      if (DEBUG) console.log("Mint result", mintResult);
      if (
        mintResult?.success === true &&
        jobId !== undefined &&
        mintResult?.json !== undefined
      ) {
        await showText("Cloud proving job started", "green");
        const blob = new Blob([mintResult.json], {
          type: "application/json",
        });
        const blobName = name + ".v1.json";
        fileSaver.saveAs(blob, blobName);
        const blobURL = URL.createObjectURL(blob);
        const blobInfo = (
          <span>
            NFT private data saved to the{" "}
            <a href={blobURL} download={blobName}>
              {blobName}
            </a>
          </span>
        );

        await showText(blobInfo, "green");
        const jobInfo = (
          <span>
            Proving transaction, cloud prove job id:{" "}
            <a href={"https://zkcloudworker.com/job/" + jobId} target="_blank">
              {jobId}
            </a>
            <br />
            You can close this page and check the transaction status later.
          </span>
        );

        setPending(jobInfo);
      } else {
        console.error("Error minting NFT token: ", mintResult);
        showText(
          `Error minting NFT: ${mintResult?.error ?? ""} ${
            mintResult?.reason ?? ""
          }`,
          "red"
        );
        setPending(undefined);
        setLoading(false);
        return;
      }
      const txResult = await waitForTransaction(jobId);
      if (DEBUG) console.log("Final mint result", txResult);
      if (
        txResult.success &&
        txResult.hash !== undefined &&
        txResult.hash !== "" &&
        txResult.hash.toLowerCase().includes("error") === false
      ) {
        const jobInfo = (
          <span>
            Sucessfully proved transaction, cloud prove job id:{" "}
            <a href={"https://zkcloudworker.com/job/" + jobId} target="_blank">
              {jobId}
            </a>
            <br />
          </span>
        );
        await showText(jobInfo, "green");
        const linkURL = window.location.origin + "/@" + name;
        const txInfo = (
          <span>
            Mint transaction successfully sent with hash:{" "}
            <a href={explorerTransaction() + txResult.hash} target="_blank">
              {txResult.hash}
            </a>
            <br />
            You can close this page and wait for the transaction to be included
            in the block.
            <br />
            You can see your NFT at the{" "}
            <a href={linkURL} target="_blank">
              {linkURL}
            </a>
          </span>
        );
        await showText(txInfo, "green");
        log.info("Mint is successful", {
          url: linkURL,
          hash: txResult.hash,
          name,
        });
        setPending(undefined);
        setMintDisabled(true);
      } else {
        await showText(
          `Error minting NFT token: ${txResult?.hash ?? ""} ${
            txResult?.error ?? ""
          }`,
          "red"
        );
        setPending(undefined);
      }

      setLoading(false);
    } catch (error) {
      if (DEBUG) console.log("Mint error", error);
      showText(
        `Error minting NFT: ${error?.message ?? error ?? "error C759"}`,
        "red"
      );
      setPending(undefined);
      setLoading(false);
    }
  };

  return (
    <div className="gx-main-content">
      <Card className="gx-card" title=<IntlMessages id={"create.title"} />>
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
            <Col xxl={10} xl={10} lg={10} md={8} sm={24} xs={24}>
              {!minting && (
                <Row>
                  <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
                    <Form.Item
                      name="mainimage"
                      label="Main image"
                      rules={[
                        {
                          required: true,
                          message: "Please upload NFT image",
                        },
                      ]}
                    >
                      <Dragger
                        name="mainimage"
                        listType="picture-card"
                        className="avatar-uploader"
                        accept="image/*"
                        showUploadList={false}
                        multiple={false}
                        maxCount={1}
                        beforeUpload={beforeUpload}
                        isImageUrl={() => true}
                      >
                        {url && (
                          <img
                            src={url}
                            alt="Preview"
                            className="w-[341.33px] h-64 bg-[#30363D] rounded-lg"
                          />
                        )}{" "}
                        <div>
                          {!url && <PlusOutlined />}
                          <div className="ant-upload-text">
                            {url ? "" : "Main Image"}
                          </div>
                        </div>
                      </Dragger>
                    </Form.Item>
                  </Col>
                </Row>
              )}

              {minting && (
                <img
                  src={url}
                  alt="Preview"
                  className="w-[341.33px] h-64 bg-[#30363D] rounded-lg"
                />
              )}
              {minting && (
                <Form.Item name="nftName" valuePropName="nftName">
                  {nameField[0] === "@" ? nameField : "@" + nameField}
                </Form.Item>
              )}
            </Col>

            {!minting && (
              <Col xxl={14} xl={14} lg={14} md={16} sm={24} xs={24}>
                <Form.Item
                  label="Name"
                  validateStatus={validateStatus}
                  help={help}
                  name="name"
                  placeholder="Please name your NFT"
                  rules={[
                    {
                      required: true,
                      message: "Please name your NFT",
                    },
                  ]}
                >
                  <Input
                    maxLength={30}
                    showCount={true}
                    onChange={(e) => setNameField(e.target.value)}
                  />
                </Form.Item>
                <Form.Item
                  label={collection}
                  name="collection"
                  rules={[
                    {
                      required: false,
                      message: "Please choose collection name for your NFT",
                    },
                  ]}
                  placeholder="Please choose collection name your NFT"
                >
                  <Input maxLength={30} showCount={true} />
                </Form.Item>
                <Form.Item
                  label=""
                  name="sellPrice"
                  rules={[
                    {
                      required: false,
                      message: "Please choose sell price for your NFT",
                    },
                  ]}
                  placeholder="Please choose sell price for your NFT"
                >
                  <InputNumber addonBefore="Sell price" addonAfter="MINA" />
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
                      minRows: 1,
                      maxRows: 10,
                    }}
                  />
                </Form.Item>
                <Form.Item
                  label="Description preview"
                  name="descriptionpreview"
                  hidden={token.description === ""}
                >
                  <Markdown>{token.description}</Markdown>
                </Form.Item>
                <Card
                  title={
                    <span style={{ marginLeft: "20px", fontWeight: "normal" }}>
                      Proof of NFT{" "}
                      <PlusOutlined
                        onClick={() => {
                          if (DEBUG) console.log("Add key", keys);
                          setKeys((prev) => [
                            ...prev,
                            { key: "", value: "", isPrivate: true },
                          ]);
                        }}
                      />
                    </span>
                  }
                  name="keys"
                >
                  {keys.map((key, index) => (
                    <Row
                      className="gx-content"
                      key={`Proof of NFT Keys ${index}`}
                    >
                      <Col xxl={9} xl={9} lg={9} md={16} sm={24} xs={24}>
                        <Form.Item name={`key-${index}`}>
                          <Input
                            addonBefore="Key"
                            maxLength={30}
                            showCount={true}
                            onChange={(e) =>
                              setKeys((prev) => {
                                const newKeys = prev;
                                newKeys[index].key = e.target.value;
                                return newKeys;
                              })
                            }
                          />
                        </Form.Item>
                      </Col>
                      <Col xxl={9} xl={9} lg={9} md={16} sm={24} xs={24}>
                        <Form.Item name={`value-${index}`}>
                          <Input
                            addonBefore="Value"
                            maxLength={30}
                            showCount={true}
                            onChange={(e) =>
                              setKeys((prev) => {
                                const newKeys = prev;
                                newKeys[index].value = e.target.value;
                                return newKeys;
                              })
                            }
                          />
                        </Form.Item>
                      </Col>
                      <Col xxl={5} xl={5} lg={5} md={10} sm={12} xs={12}>
                        <Form.Item
                          name={`public-${index}`}
                          initialValue="Private"
                        >
                          <Select
                            name={`public-select-${index}`}
                            onChange={(e) =>
                              setKeys((prev) => {
                                const newKeys = prev;
                                newKeys[index].isPrivate =
                                  e === "Private" ? true : false;
                                return newKeys;
                              })
                            }
                          >
                            <Option value="Private">Private</Option>
                            <Option value="Public">Public</Option>
                          </Select>
                        </Form.Item>
                        {/*}
                        <Form.Item
                          name={`public-${index}`}
                          valuePropName="public"
                        >
                          <Checkbox
                            onChange={(e) =>
                              setKeys((prev) => {
                                const newKeys = prev;
                                newKeys[index].isPublic = e.target.checked;
                                return newKeys;
                              })
                            }
                          >
                            public
                          </Checkbox>
                        </Form.Item>*/}
                      </Col>
                    </Row>
                  ))}
                </Card>
              </Col>
            )}
            {minting && (
              <Col xxl={14} xl={14} lg={14} md={16} sm={24} xs={24}>
                <Form.Item
                  name="info"
                  className="currency-sell-form_last-form-item"
                  hidden={timeline.length === 0 && pending === undefined}
                >
                  <Timeline
                    pending={pending}
                    reverse={false}
                    hidden={timeline.length === 0 && pending === undefined}
                  >
                    {timeline.map((item) => (
                      <Timeline.Item color={item.color}>
                        {item.text}
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </Form.Item>
              </Col>
            )}
          </Row>

          <Row>
            <Form.Item style={{ paddingLeft: "10px" }}>
              <Button
                type="primary"
                onClick={mint}
                disabled={mintDisabled}
                loading={loading}
              >
                Mint NFT
              </Button>
            </Form.Item>
          </Row>
          <Row>
            <Form.Item
              hidden={showLink === true}
              style={{ paddingLeft: "15px" }}
            >
              <div
                className="gx-mt-0"
                style={{
                  whiteSpace: "pre-wrap",
                }}
              >
                <span>
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
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default Mint;
