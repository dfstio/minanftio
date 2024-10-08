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

import logger from "../../serverless/logger";
import {
  footerText,
  footerAgreement,
  footerContact,
  footerAgreementLink,
  footerEmail,
  accountingEmail,
} from "../../util/config";
import { set } from "nprogress";
import { add } from "winston";
const logm = logger.info.child({
  winstonModule: "Mint",
  winstonComponent: "Custom",
});
const { REACT_APP_PINATA_JWT } = process.env;
const { TextArea } = Input;
const { Option } = Select;
const Dragger = Upload.Dragger;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

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

//const mintPrivateText = '$10 to create one Private NFT token. Private NFT token will not be visible on Mina NFT marketplace except for sale';
const mintText = "Free to create Mina NFT token for Christmas and New Year";
//"$9 to create one Mina Avatar NFT token";

const MintPrivate = () => {
  const address = useSelector(({ blockchain }) => blockchain.address);
  const publicKey = useSelector(({ blockchain }) => blockchain.publicKey);
  const username = useSelector(({ blockchain }) => blockchain.username);
  const dispatch = useDispatch();

  const [token, setToken] = useState(startToken);
  const [nameField, setNameField] = useState("");
  const [nameAvailable, setNameAvailable] = useState(false);
  const [hot, setHot] = useState(false);
  const [ipfs, setIpfs] = useState("");
  const [auth, setAuth] = useState("");
  const [link, setLink] = useState("");
  const [hash, setHash] = useState("");
  const [price, setPrice] = useState("Name");
  const [collection, setCollection] = useState("Collection");
  const [showLink, setShowLink] = useState(false);
  const [counter, setCounter] = useState(0);
  const [minting, setMinting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [showUnlockable, setShowUnlockable] = useState(false);
  const [mintDisabled, setMintDisabled] = useState(true);
  const [mintPrice, setMintPrice] = useState(mintText);
  const [advanced, setAdvanced] = useState(false);
  const [merkleTree, setMerkleTree] = useState(false);
  const [form] = Form.useForm();
  const [image, setImage] = useState(undefined);
  const [url, setUrl] = useState(undefined);
  const [timeline, setTimeline] = useState([]);
  const [pending, setPending] = useState(undefined);
  const [libraries, setLibraries] = useState(undefined);

  function warm() {
    if (hot) return;
    setHot(true);
    lookupName("test");
    if (libraries === undefined) setLibraries(loadLibraries());
  }

  useEffect(() => {
    async function nameChanged() {
      const name = nameField[0] === "@" ? nameField.slice(1) : nameField;
      console.log("name", name);
      if (name.length < 3) {
        setPrice("Name");
        setNameAvailable(false);
        warm();
        return;
      }
      if (
        reservedNames.includes(name.toLowerCase().substring(0, 30)) === true
      ) {
        setPrice("This name is reserved");
        setNameAvailable(false);
        warm();
        return;
      }

      function validateName(value) {
        if (value.length > 30) return false;
        if (value.length <= 2) return true;
        const regExp = /^[a-zA-Z]\w+$/g;
        return regExp.test(value.substring(1));
      }

      if (validateName(name)) {
        const status = await lookupName(name);
        console.log("status", status);
        if (status.success === false) {
          setPrice("Name");
          console.error("Error in name lookup", status);
          return;
        }
        if (status.found === true) {
          setPrice("This name is already registered");
          setNameAvailable(false);
          return;
        } else {
          const priceObject = nftPrice(name);
          if (priceObject === "This name is reserved.") {
            setPrice("This name is reserved.");
            setNameAvailable(false);
          } else if (priceObject !== undefined) {
            setPrice(
              "This name is available: " +
                priceObject.price +
                " " +
                priceObject.currency
            );
            setNameAvailable(true);
          } else {
            console.error("Invalid price object", priceObject);
            setPrice("Name");
            setNameAvailable(true);
          }
          return;
        }
      } else {
        setPrice(
          "Invalid name, must contains only letters and digits, starts with letter, be less than 30 chars"
        );
        setNameAvailable(false);
        warm();
      }
    }
    nameChanged();
  }, [nameField]);

  useEffect(() => {
    async function checkCanMint() {
      setMintDisabled(nameAvailable && image ? false : true);
    }
    checkCanMint();
  }, [nameAvailable, image]);

  const showText = async (text, color) => {
    setTimeline((prev) => {
      const newTimeline = prev;
      newTimeline.push({ text, color });
      return newTimeline;
    });
  };

  const showPending = async (text) => {
    setPending(text);
  };

  const onValuesChange = async (values) => {
    //if (DEBUG) console.log("onValuesChange", values);
    let newToken = token;
    /*
    if (values.name !== undefined) {
      const name = values.name[0] === "@" ? values.name : "@" + values.name;
      function validateName(value) {
        if (value.length > 30) return false;
        if (value.length <= 2) return true;
        const regExp = /^[a-zA-Z]\w+$/g;
        return regExp.test(value.substring(1));
      }
      if (validateName(name)) {
        newToken.name = name;
        const priceObject = nftPrice(name);
        setPrice(
          name === "@"
            ? "Name"
            : priceObject.description +
                ":" +
                priceObject.price +
                " " +
                priceObject.currency
        );
      } else {
        setPrice(
          "Invalid name, must contains only letters and digits, starts with letter, be less than 30 chars"
        );
      }
    }
      */
    //if (values.url !== undefined) newToken.url = values.url;
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
    if (values.auth !== undefined) setAuth(values.auth);

    if (values.chain !== undefined) {
      newToken.chain = values.chain;
      console.log("chain", values.chain);
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
    if (values.advanced !== undefined) {
      setAdvanced(values.advanced === true);
    }
    if (values.storagetype !== undefined)
      newToken.storagetype = values.storagetype;

    setToken(newToken);
    setCounter(counter + 1);
  };

  const onFinish = async (values) => {
    if (DEBUG) console.log("onFinish", values);
  };

  const onChangeAdvanced = async (value) => {
    if (DEBUG) console.log("onChangeAdvanced", value);
    setAdvanced(value.target.checked);
  };

  const beforeUpload = (file) => {
    return false;
  };

  const mint = async () => {
    //const key = "Minting Mina NFT";
    /*
    message.config({
      top: 100,
    });
    */
    setLoading(true);
    setTimeline([]);
    setPending("Preparing mint transaction...");
    setMinting(true);
    try {
      const newAddress = await minaLogin();
      console.log("newAddress", newAddress);
      dispatch(updateAddress(newAddress));
      //return;
      //}
      if (newAddress === "" || newAddress === undefined) return;
      const owner = newAddress;

      /*
      message.loading({
        content: `Minting NFT token: creating token metadata`,
        key,
        duration: 240,
      });
      */
      const name = nameField[0] === "@" ? nameField.slice(1) : nameField;
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
      const keys = [];
      if (token.public_key1 !== undefined && token.public_key1 !== "")
        keys.push({
          key: token.public_key1.substring(0, 30),
          value: token.public_value1?.substring(0, 30) ?? "",
          isPrivate: false,
        });
      if (token.public_key2 !== undefined && token.public_key2 !== "")
        keys.push({
          key: token.public_key2.substring(0, 30),
          value: token.public_value2?.substring(0, 30) ?? "",
          isPrivate: false,
        });
      if (token.private_key1 !== undefined && token.private_key1 !== "")
        keys.push({
          key: token.private_key1.substring(0, 30),
          value: token.private_value1?.substring(0, 30) ?? "",
          isPrivate: true,
        });
      if (token.private_key2 !== undefined && token.private_key2 !== "")
        keys.push({
          key: token.private_key2.substring(0, 30),
          value: token.private_value2?.substring(0, 30) ?? "",
          isPrivate: true,
        });

      let mintResult = await mintNFT({
        name,
        image: token.main.image,
        collection: token.collection,
        description: token.description,
        price:
          token.sellPrice && token.sellPrice !== ""
            ? parseFloat(token.sellPrice)
            : 0,
        keys,
        developer: "DFST",
        repo: "minanft_io",
        owner,
        pinataJWT: REACT_APP_PINATA_JWT,
        showText,
        showPending,
        libraries: libraries ?? loadLibraries(),
      });
      const jobId = mintResult.jobId;
      console.log("Mint result", mintResult);
      if (
        mintResult?.success === true &&
        jobId !== undefined &&
        mintResult?.json !== undefined
      ) {
        /*
        message.loading({
          content: `Started mint job ${mintResult.jobId}`,
          key,
          duration: 240,
        });
        */

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
        /*
        message.error({
          content: `Error minting NFT token: ${mintResult?.error ?? ""} ${
            mintResult?.reason ?? ""
          }`,
          key,
          duration: 20,
        });
        */
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
      console.log("Final mint result", txResult);
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
        const txInfo = (
          <span>
            Mint transaction successfully sent with hash:{" "}
            <a href={explorerTransaction() + txResult.hash} target="_blank">
              {txResult.hash}
            </a>
            <br />
            You can close this page and wait for the transaction to be included
            in the block.
          </span>
        );
        await showText(txInfo, "green");
        setPending(undefined);
        /*
        message.success({
          content: `NFT token minted successfully with transaction hash ${mintResult.hash}`,
          key,
          duration: 240,
        });
        const linkURL = window.location.origin + "/@" + name;
        console.log("linkURL", linkURL);
        const openResult = window.open(linkURL, "_blank");
        console.log("openResult", openResult);
        setLink(linkURL);
        setHash(explorerTransaction() + mintResult.hash);
        setShowLink(true);
        */
      } else {
        /*
        message.error({
          content: `Error minting NFT token: ${mintResult?.error ?? ""} ${
            mintResult?.reason ?? ""
          }`,
          key,
          duration: 60,
        });
        */
        await showText(
          `Error minting NFT token: ${txResult?.hash ?? ""} ${
            txResult?.error ?? ""
          }`,
          "red"
        );
        setPending(undefined);
      }

      /*
      let mintResult =
        token.chain === "devnet"
          ? await mintNFT(address, auth, token, merkleTree)
          : await mintRollupNFT(address, auth, token, merkleTree);
      console.log("Mint result", mintResult);
      if (token.chain === "zeko") {
        if (mintResult?.success === true && mintResult?.hash !== undefined) {
          message.success({
            content: `Rollup NFT token minted successfully on Zeko with rollup transaction hash ${mintResult.hash}`,
            key,
            duration: 240,
          });
          const blob = new Blob([mintResult.json], {
            type: "text/plain;charset=utf-8",
          });
          fileSaver.saveAs(blob, name + ".rollup.nft.json");
          const linkURL = mintResult?.url ?? "https://minanft.io/";
          const hash = `https://minanft.io/rollup/tx/${mintResult.hash}`;
          console.log("linkURL", linkURL);
          const openResult = window.open(linkURL, "_blank");
          console.log("openResult", openResult);
          setHash(hash);
          setLink(linkURL);
          setShowLink(true);
        } else
          message.error({
            content: `Error minting NFT token: ${mintResult?.error ?? ""} ${
              mintResult?.reason ?? ""
            }`,
            key,
            duration: 60,
          });
      } else {
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
          fileSaver.saveAs(blob, name + ".v1.json");
        } else {
          message.error({
            content: `Error minting NFT token: ${mintResult?.error ?? ""} ${
              mintResult?.reason ?? ""
            }`,
            key,
            duration: 20,
          });
          setMinting(false);
          return;
        }
        const jobId = mintResult.jobId;
        mintResult = await waitForMint(jobId, auth);
        console.log("Final mint result", mintResult);
        if (mintResult?.success === true && mintResult?.hash !== undefined) {
          message.success({
            content: `NFT token minted successfully with transaction hash ${mintResult.hash}`,
            key,
            duration: 240,
          });
          const linkURL = "https://minanft.io/" + name;
          console.log("linkURL", linkURL);
          const openResult = window.open(linkURL, "_blank");
          console.log("openResult", openResult);
          setLink(linkURL);
          setHash(explorerTransaction() + mintResult.hash);
          setShowLink(true);
        } else
          message.error({
            content: `Error minting NFT token: ${mintResult?.error ?? ""} ${
              mintResult?.reason ?? ""
            }`,
            key,
            duration: 60,
          });
      }
      */
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
      //setMinting(false);
      setLoading(false);
    } catch (error) {
      console.log("Mint error", error);
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

              {!minting && (
                <Form.Item name="advanced" valuePropName="advanced">
                  <Checkbox onChange={onChangeAdvanced}>
                    Add Proof of NFT
                  </Checkbox>
                </Form.Item>
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
                  label={price}
                  name="name"
                  placeholder="Please name your NFT"
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
          {advanced === true && !minting ? (
            <div className="gx-main-content">
              {/*
              <Row>
                <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
                  <Form.Item
                    name="category"
                    label="Category"
                    hasFeedback
                    rules={[
                      {
                        required: true,
                        message: "Please select category",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Please select a category"
                      onChange={categoryChange}
                    >
                      <Option value="MINA protocol">MINA protocol</Option>
                      <Option value="Music">Music</Option>
                      <Option value="Video">Video</Option>
                      <Option value="Art">Art</Option>
                      <Option value="Dance">Dance</Option>
                      <Option value="Document">Document</Option>
                      <Option value="Business">Business</Option>
                      <Option value="Transaction">Transaction</Option>
                      <Option value="Technology">Technology</Option>
                      <Option value="Blockchain">Blockchain</Option>
                      <Option value="Health">Health</Option>
                      <Option value="Event">Event</Option>
                      <Option value="Other">Other</Option>
                    </Select>
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
              */}
              <Row>
                <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
                  <Card className="gx-card" title="Proof of NFT - public data">
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
                  </Card>
                </Col>
              </Row>

              <Row>
                <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
                  <Card className="gx-card" title="Proof of NFT - private data">
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
                          label="Private value 1 (will NOT be published to IPFS, but will be verifiable)"
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
                          label="Private value 2 (will NOT be published to IPFS, but will be verifiable)"
                          name="private_value2"
                          placeholder="Some string (less than 30 chars)"
                        >
                          <Input maxLength={30} showCount={true} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>

              {/*
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
                    label="Private Attachments - will NOT be uploaded to IPFS"
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
                    <Checkbox onChange={onChangeMerkleTree}>
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
              
              <Form.Item label="Price" name="price">
                {mintPrice}
              </Form.Item>
                  
              
              <Form.Item
                label={
                  <span>
                    <span>Authorization code. </span>
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
              */}
            </div>
          ) : (
            <div></div>
          )}
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

export default MintPrivate;
