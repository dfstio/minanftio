import React, { useState, useEffect } from "react";
import { Layout, Checkbox } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { updatePublicKey } from "../../appRedux/actions";
import {
  ClearRefinements,
  HierarchicalMenu,
  Panel,
  RangeInput,
  RatingMenu,
  RefinementList,
  Configure,
} from "react-instantsearch-dom";
import IntlMessages from "../../util/IntlMessages";
import api from "../../serverless/api";

const { REACT_APP_CONTRACT_ADDRESS, REACT_APP_CHAIN_ID } = process.env;
const chainId = Number(REACT_APP_CHAIN_ID);

const { Sider } = Layout;
const Sidebar = () => {
  const address = useSelector(({ blockchain }) => blockchain.address);
  const publicKey = useSelector(({ blockchain }) => blockchain.publicKey);
  const dispatch = useDispatch();

  const [filter, setFilter] = useState(`type:nft`);

  //const [filter, setFilter] = useState(`(uri.visibility:public OR onSale:true) AND chainId:${chainId} AND contract:${REACT_APP_CONTRACT_ADDRESS}`);
  const [disabled, setDisabled] = useState(true);
  //const [visible, setVisible] = useState(false);

  function onChange(e) {
    if (address !== "") {
      setDisabled(false);

      if (e.target.checked === true) {
        let filterStr = `type:nft`;
        if (publicKey !== undefined || publicKey !== "")
          filterStr = `owner:${publicKey} AND type:nft`;
        setFilter(filterStr);
        console.log("On change", e.target.checked, filterStr);
      } else {
        const filterStr = `type:nft`;
        setFilter(filterStr);
      }
    } else {
      setDisabled(true);
      setFilter(`type:nft`);
    }
  }

  useEffect(() => {
    async function loadHash() {
      if (address === "") {
        setDisabled(true);
        setFilter(`type:nft`);
      } else {
        setDisabled(false);
        const filterStr = `type:nft`;
        setFilter(filterStr);
      }
    }
    loadHash();
  }, [address]);

  useEffect(() => {
    async function fetchHash() {
      const result = await api.hash(address);
      console.log("Hash result: ", result);
      if (result.hash !== undefined && result.hash !== "")
        dispatch(updatePublicKey(result.hash));
    }
    fetchHash();
  }, [dispatch, address]);

  return (
    <Sider className="gx-algolia-sidebar">
      <div className="gx-algolia-sidebar-content">
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
              <IntlMessages id="sidebar.algolia.onsale" />
            </span>
          >
            <RefinementList
              className="gx-algolia-refinementList"
              attribute="saleStatus"
              operator="or"
              limit={5}
            />
          </Panel>

          <Panel
            header=<span>
              <IntlMessages id="sidebar.algolia.category" />
            </span>
          >
            <RefinementList
              className="gx-algolia-refinementList"
              attribute="category"
              operator="or"
              limit={5}
              searchable
              searchableIsAlwaysActive={false}
            />
          </Panel>

          <Panel
            header=<span>
              <IntlMessages id="sidebar.algolia.creator" />
            </span>
          >
            <RefinementList
              className="gx-algolia-refinementList"
              attribute="creator"
              operator="or"
              limit={10}
              searchable
              showMore
            />
          </Panel>

          {/*
        <Panel header={<span>Owner</span>}>
          <RatingMenu className="gx-algolia-refinementList" attribute="owner" max={5}/>
        </Panel>
*/}
          <Panel
            header=<span>
              <IntlMessages id="sidebar.algolia.price" />
            </span>
          >
            <RangeInput
              className="gx-algolia-refinementList"
              attribute="price"
            />
          </Panel>

          <Panel
            header=<span>
              <IntlMessages id="sidebar.algolia.currency" />
            </span>
          >
            <RefinementList
              className="gx-algolia-refinementList"
              attribute="currency"
              operator="or"
              limit={5}
            />
          </Panel>
        </div>
      </div>
    </Sider>
  );
};

export default Sidebar;
