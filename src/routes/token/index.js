import React, { useState, useEffect } from "react";
import TokenItem from "./Token";
import { getRollupNFT } from "../../nft/rollup";
import algoliasearch from "algoliasearch";
const {
  REACT_APP_ALGOLIA_KEY,
  REACT_APP_ALGOLIA_PROJECT,
  REACT_APP_ALGOLIA_INDEX,
  REACT_APP_CONTRACT_ADDRESS,
  REACT_APP_CHAIN_ID,
} = process.env;
const searchClient = algoliasearch(
  REACT_APP_ALGOLIA_PROJECT,
  REACT_APP_ALGOLIA_KEY
);
const searchIndex = searchClient.initIndex(REACT_APP_ALGOLIA_INDEX);
const DEBUG = "true" === process.env.REACT_APP_DEBUG;

const Token = ({ match }) => {
  const [item, setItem] = useState();
  const [messageText, setMessageText] = useState("Loading token");

  if (DEBUG) console.log("Token match", match);
  if (DEBUG) console.log("Token item", item);

  useEffect(() => {
    async function getItem() {
      if (match.params.rollupId !== undefined) {
        try {
          let newItem = await getRollupNFT(match.params.rollupId);
          if (DEBUG) console.log("Rollup item received", newItem);
          setItem(newItem);
        } catch (error) {
          console.log("Rollup item not received", error);
          setMessageText("Rollup NFT not found");
        }
      } else {
        let objectID =
          REACT_APP_CHAIN_ID +
          "." +
          REACT_APP_CONTRACT_ADDRESS +
          "." +
          match.params.tokenId.toString();
        if (DEBUG) console.log("Token objectID", objectID);
        try {
          let newItem = await searchIndex.getObject(objectID);
          if (DEBUG) console.log("Token item received", newItem);
          setItem(newItem);
        } catch (error) {
          console.log("Token item not received", error);
          setMessageText("Token not found");
        }
      }
    }
    getItem();
  }, [match]);

  return (
    <div className="gx-algolia-content-inner">
      {item === undefined ? (
        <div className="gx-d-flex justify-content-center">{messageText}</div>
      ) : (
        <div>
          <TokenItem item={item} key="MyToken" />
        </div>
      )}
    </div>
  );
};

export default Token;
