/* eslint-disable react/jsx-no-target-blank */
import React, { useState, useEffect } from "react";
import algoliasearch from "algoliasearch";
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
  Descriptions,
} from "antd";

import logger from "../../serverless/logger";
import { set } from "nprogress";
const { REACT_APP_ALGOLIA_KEY, REACT_APP_ALGOLIA_PROJECT } = process.env;
const searchClient = algoliasearch(
  REACT_APP_ALGOLIA_PROJECT,
  REACT_APP_ALGOLIA_KEY
);
const rollupTxs = searchClient.initIndex("rollup-txs");
const rollupBlocks = searchClient.initIndex("rollup-blocks");

const logm = logger.info.child({ winstonModule: "Tx" });
const { REACT_APP_DEBUG } = process.env;

const { TextArea } = Input;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

const DEBUG = "true" === process.env.REACT_APP_DEBUG;

const Tx = ({ match }) => {
  const [tx, setTx] = useState({});
  const [block, setBlock] = useState({});
  const [txLoaded, setTxLoaded] = useState(false);
  const [blockLoaded, setBlockLoaded] = useState(false);
  const [messageText, setMessageText] = useState("Loading tx data");
  const [form] = Form.useForm();

  const log = logm.child({ winstonComponent: "Faucet" });

  if (DEBUG) console.log("txId", match.params.txId, "match", match);
  if (DEBUG) console.log("Tx", tx);

  useEffect(() => {
    async function getItem() {
      if (match.params.txId !== undefined) {
        try {
          const tx = await rollupTxs.getObject(match.params.txId);
          if (DEBUG) console.log("Tx received", tx);
          if (tx !== undefined) {
            tx["created"] = new Date(tx.timeReceived).toLocaleString();
            tx["included in the block"] = new Date(
              tx.timeIncluded
            ).toLocaleString();
            tx["contract address"] = tx["contractAddress"];
            tx["block number"] = tx["blockNumber"];
            delete tx.timeReceived;
            delete tx.timeIncluded;
            delete tx.objectID;
            delete tx.contractAddress;
            delete tx.blockNumber;
            setTx(tx);
            setTxLoaded(true);
          } else setMessageText("Tx not found");
          if (
            tx.chain !== undefined &&
            tx.contractAddress !== undefined &&
            tx.blockNumber !== undefined
          ) {
            try {
              const objectID =
                tx.chain +
                "." +
                tx.contractAddress +
                "." +
                tx.blockNumber.toString();
              const block = await rollupBlocks.getObject(objectID);
              if (DEBUG) console.log("Block received", block);
              if (block !== undefined) {
                delete block.objectID;
                setBlock(block);
                setBlockLoaded(true);
              } else setMessageText("Block not found");
            } catch (error) {
              console.log("Block not received", error);
              setMessageText("Block not found");
            }
          } else console.error("Tx object has wrong format", tx);
          setTx(tx);
        } catch (error) {
          console.log("Tx not received", error);
          setMessageText("Tx not found");
        }
      }
    }
    getItem();
  }, [match]);

  return (
    <>
      <div className="gx-main-content">
        <Row>
          <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
            <Card className="gx-card" key="faucetCard" title="Transaction">
              <Form
                form={form}
                key="txForm"
                labelCol={{
                  span: 24,
                }}
                wrapperCol={{
                  span: 24,
                }}
                layout="horizontal"
                initialValues={{ publicKey: "", chain: "zeko" }}
              >
                <div>
                  <Row>
                    <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
                      <Form.Item
                        label="Transaction details"
                        name="txData"
                        placeholder=""
                      >
                        {txLoaded ? (
                          <Descriptions bordered={true} column={1}>
                            {Object.keys(tx).map((key) =>
                              typeof tx[key] === "object" ? (
                                Object.keys(tx[key]).map((subKey) => (
                                  <Descriptions.Item label={subKey}>
                                    {tx[key][subKey].toString()}
                                  </Descriptions.Item>
                                ))
                              ) : (
                                <Descriptions.Item label={key}>
                                  {tx[key].toString()}
                                </Descriptions.Item>
                              )
                            )}
                          </Descriptions>
                        ) : (
                          <p>{messageText}</p>
                        )}
                      </Form.Item>
                      <Form.Item
                        label="Block details"
                        name="blockData"
                        placeholder=""
                      >
                        {blockLoaded ? (
                          <Descriptions bordered={true} column={1}>
                            {Object.keys(block).map((key) => (
                              <Descriptions.Item label={key}>
                                {block[key].toString()}
                              </Descriptions.Item>
                            ))}
                          </Descriptions>
                        ) : (
                          <p>{messageText}</p>
                        )}
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

export default Tx;
