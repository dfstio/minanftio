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
  Descriptions,
} from "antd";
import {
  expandTx,
  expandBlock,
  expandBlockHistory,
  expandTxHistory,
} from "./expand";

import logger from "../../serverless/logger";
import { set } from "nprogress";
const {
  REACT_APP_ALGOLIA_KEY,
  REACT_APP_ALGOLIA_PROJECT,
  REACT_APP_ALGOLIA_INDEX,
} = process.env;
const searchClient = algoliasearch(
  REACT_APP_ALGOLIA_PROJECT,
  REACT_APP_ALGOLIA_KEY
);
const rollupTxs = searchClient.initIndex("rollup-txs");
const rollupBlocks = searchClient.initIndex("rollup-blocks");
const rollupBlocksHistory = searchClient.initIndex("rollup-blocks-history");
const rollupTxHistory = searchClient.initIndex("rollup-tx-history");

const logm = logger.info.child({ winstonModule: "Tx" });
const { REACT_APP_DEBUG } = process.env;

const { TextArea } = Input;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

const DEBUG = "true" === process.env.REACT_APP_DEBUG;

const Tx = ({ match }) => {
  const [tx, setTx] = useState(expandTx());
  const [block, setBlock] = useState(expandBlock());
  const [blockHistory, setBlockHistory] = useState([]);
  const [txHistory, setTxHistory] = useState([]);
  const [txLoaded, setTxLoaded] = useState(false);
  const [blockLoaded, setBlockLoaded] = useState(false);
  const [messageText, setMessageText] = useState("Loading tx data");
  const [time, setTime] = useState(new Date());
  const [form] = Form.useForm();

  const refreshTime = 20000;

  const log = logm.child({ winstonComponent: "Tx" });

  if (DEBUG) console.log("txId", match.params.txId, "match", match);
  if (DEBUG) console.log("Tx", tx);

  async function getItem() {
    if (match.params.txId !== undefined) {
      try {
        const tx = await rollupTxs.getObject(match.params.txId);
        if (DEBUG) console.log("Tx received", tx);
        if (tx !== undefined) {
          if (tx.chain !== undefined && tx.contractAddress !== undefined) {
            setTx(expandTx(tx));
            setTxLoaded(true);
            const txHistory = await rollupTxHistory.search("", {
              filters: `chain:${tx.chain} AND contractAddress:${tx.contractAddress} AND txId:${tx.txId}`,
            });
            console.log("Tx history", blockHistory);
            if (txHistory.hits !== undefined) {
              // sort hits by time, more recent first
              const hits = txHistory.hits.sort((a, b) => b.time - a.time);
              setTxHistory(hits.map((item) => expandTxHistory(item)));
            }
            if (tx.blockHash !== undefined) {
              if (DEBUG) console.log("Block hash", tx.blockHash);
              try {
                const block = await rollupBlocks.getObject(tx.blockHash);
                if (DEBUG) console.log("Block received", block);
                if (block !== undefined) {
                  setBlock(expandBlock(block));
                  setBlockLoaded(true);
                } else setMessageText("Block not found");
                const blockHistory = await rollupBlocksHistory.search("", {
                  filters: `blockHash:${tx.blockHash} AND chain:${tx.chain} AND contractAddress:${tx.contractAddress} AND blockNumber:${tx.blockNumber}`,
                });
                console.log("Block history", blockHistory);
                if (blockHistory.hits !== undefined) {
                  // sort hits by time, more recent first
                  const hits = blockHistory.hits.sort(
                    (a, b) => b.time - a.time
                  );
                  setBlockHistory(hits.map((item) => expandBlockHistory(item)));
                }
              } catch (error) {
                if (DEBUG) console.log("Block not received", error);
                setMessageText("Block not found");
              }
            }
          } else console.error("Tx object has wrong format", tx);
        } else setMessageText("Tx not found");
      } catch (error) {
        console.error("Tx not received", error);
        setMessageText("Tx not found");
      }
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, refreshTime);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    getItem();
  }, [match, time]);

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
              >
                <div className="gx-mt-2">
                  <Row>
                    <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
                      <Form.Item label={tx.name} name="txData" placeholder="">
                        {txLoaded ? (
                          <Descriptions
                            bordered={true}
                            column={1}
                            size={"small"}
                          >
                            {tx.elements}
                          </Descriptions>
                        ) : (
                          <p>{messageText}</p>
                        )}
                      </Form.Item>
                      {txHistory.map((tx) => (
                        <Form.Item
                          label={tx.name}
                          name="txHistory"
                          placeholder=""
                        >
                          <Descriptions
                            bordered={true}
                            column={1}
                            size={"small"}
                          >
                            {tx.elements}
                          </Descriptions>
                        </Form.Item>
                      ))}
                      <Form.Item
                        label={block.name}
                        name="blockData"
                        placeholder=""
                      >
                        {blockLoaded ? (
                          <Descriptions
                            bordered={true}
                            column={1}
                            size={"small"}
                          >
                            {block.elements}
                          </Descriptions>
                        ) : (
                          ""
                        )}
                      </Form.Item>
                      {blockHistory.map((block) => (
                        <Form.Item
                          label={block.name}
                          name="blockHistory"
                          placeholder=""
                        >
                          <Descriptions
                            bordered={true}
                            column={1}
                            size={"small"}
                          >
                            {block.elements}
                          </Descriptions>
                        </Form.Item>
                      ))}
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
