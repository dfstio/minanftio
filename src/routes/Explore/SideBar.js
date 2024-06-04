import React, { useState, useEffect } from "react";
import { Layout, Checkbox } from "antd";
import { useDispatch, useSelector } from "react-redux";
//import { updatePublicKey } from "../../appRedux/actions";
import {
  ClearRefinements,
  HierarchicalMenu,
  Panel,
  RangeInput,
  RatingMenu,
  RefinementList,
  Configure,
  connectStateResults,
  Stats,
} from "react-instantsearch-dom";

import IntlMessages from "../../util/IntlMessages";
import Header from "./Header";
//import { hash } from "../../blockchain/hash";

const { REACT_APP_CONTRACT_ADDRESS, REACT_APP_CHAIN_ID } = process.env;
const chainId = Number(REACT_APP_CHAIN_ID);
const defaultFilter = `status:pending OR status:minted`;

const { Sider } = Layout;

const CustomStats = connectStateResults(({ searchState, searchResult }) => {
  if (searchResult && searchResult.nbHits === 0) {
    return (
      <div className="gx-algolia-content-inner">
        <div
          className="gx-algolia-no-results"
          style={{ paddingBottom: "25px" }}
        >
          No results found matching{" "}
          <span className="gx-algolia-query">{searchState.query}</span>
        </div>
      </div>
    );
  } else {
    return (
      <div
        className="gx-algolia-content-inner"
        style={{ paddingBottom: "25px" }}
      >
        <Stats />
      </div>
    );
  }
});

const Sidebar = (onCloseFunction, searchState, searchResult) => {
  const address = useSelector(({ blockchain }) => blockchain.address);
  //const publicKey = useSelector(({ blockchain }) => blockchain.publicKey);
  //const dispatch = useDispatch();

  const [filter, setFilter] = useState(defaultFilter); //`type:nft`

  //const [filter, setFilter] = useState(`(uri.visibility:public OR onSale:true) AND chainId:${chainId} AND contract:${REACT_APP_CONTRACT_ADDRESS}`);
  const [disabled, setDisabled] = useState(true);
  //const [visible, setVisible] = useState(false);

  async function onChange(e) {
    if (address !== "") {
      setDisabled(false);
      if (e.target.checked === true) {
        const filterStr = `owner:${address}`;
        setFilter(filterStr);
        console.log("On change", e.target.checked, filterStr);
      } else {
        const filterStr = ``;
        setFilter(filterStr);
      }
    } else {
      setDisabled(true);
      setFilter(defaultFilter);
    }
  }

  useEffect(() => {
    async function loadHash() {
      if (address === "") {
        setDisabled(true);
        setFilter(defaultFilter);
      } else {
        setDisabled(false);
        const filterStr = ``;
        setFilter(filterStr);
      }
    }
    loadHash();
  }, [address]);
  /*
  useEffect(() => {
    async function fetchHash() {
      const result = await api.hash(address);
      console.log("Hash result: ", result);
      if (result.hash !== undefined && result.hash !== "")
        dispatch(updatePublicKey(result.hash));
    }
    fetchHash();
  }, [dispatch, address]);
*/
  return (
    <Sider className="gx-algolia-sidebar">
      <div className="gx-algolia-sidebar-content">
        <Header onCloseFunction={onCloseFunction} />
        <CustomStats />
        <ClearRefinements
          translations={{
            reset: "Clear all filters",
          }}
        />
        {/*
      <div className="gx-algolia-category-item">
        <div className="gx-algolia-category-title">Show results for</div>
        <HierarchicalMenu
          attributes={['onSale']}
        />
      </div>
*/}

        <div className="gx-algolia-category-item">
          <div className="gx-algolia-category-title">Refine By</div>

          <div className="gx-algolia-refinementList">
            <Checkbox
              onChange={onChange}
              disabled={disabled}
              style={{ marginBottom: "20px" }}
            >
              Only my NFTs
            </Checkbox>
          </div>

          <Configure filters={filter} />

          <Panel
            header=<span>
              <IntlMessages id="sidebar.algolia.chain" />
            </span>
          >
            <RefinementList
              className="gx-algolia-refinementList"
              attribute="chain"
              operator="or"
              limit={3}
            />
          </Panel>

          <Panel
            header=<span>
              <IntlMessages id="sidebar.algolia.collection" />
            </span>
          >
            <RefinementList
              className="gx-algolia-refinementList"
              attribute="collection"
              operator="or"
              limit={15}
              searchable
              searchableIsAlwaysActive={false}
            />
          </Panel>

          {/*
        <Panel header={<span>Owner</span>}>
          <RatingMenu className="gx-algolia-refinementList" attribute="owner" max={5}/>
        </Panel>
*/}
        </div>
      </div>
    </Sider>
  );
};

export default Sidebar;
