import React, { useState, useEffect } from "react";
import TokenItem from "./Token";
import { getRollupNFT } from "../../nft/rollup";
import algoliasearch from "algoliasearch";
const { REACT_APP_ALGOLIA_KEY, REACT_APP_ALGOLIA_PROJECT } = process.env;
const searchClient = algoliasearch(
  REACT_APP_ALGOLIA_PROJECT,
  REACT_APP_ALGOLIA_KEY
);
const searchIndex = searchClient.initIndex("minanft");
const DEBUG = "true" === process.env.REACT_APP_DEBUG;

const Token = ({ match }) => {
  const [item, setItem] = useState();
  const [messageText, setMessageText] = useState("Loading token");

  if (DEBUG)
    console.log(
      "Token match",
      match.params.chainId,
      match.params.contract,
      match.params.tokenId,
      match.params.postId,
      match.params.rollupId,
      "match",
      match
    );
  if (DEBUG) console.log("Token item", item);

  useEffect(() => {
    async function getItem() {
      if (match.params.rollupId !== undefined) {
        try {
          let newItem = await getRollupNFT(match.params.rollupId);
          if (DEBUG) console.log("Rollup item received", newItem);
          newItem.name = newItem?.properties?.name?.data ?? "Rollup NFT";
          newItem.address =
            newItem?.properties?.address?.linkedObject.text ??
            "B62qrjWrAaXV65CZgpfhLdFynbFdyj851cWZPCPvF92mF3ohGDbNAME";
          setItem(newItem);
        } catch (error) {
          console.log("Rollup item not received", error);
          setMessageText("Rollup NFT not found");
        }
      } else {
        let objectID =
          match.params.postId === undefined
            ? match.params.tokenId.toString()
            : match.params.tokenId.toString() +
              "." +
              match.params.postId.toString();
        if (objectID[0] !== "@") objectID = "@" + objectID;
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
