import React, { useState, useEffect } from "react";
import { Layout, Checkbox } from "antd";
import { useDispatch, useSelector } from "react-redux";
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
import { hash } from "../../blockchain/hash";

const { REACT_APP_CONTRACT_ADDRESS, REACT_APP_CHAIN_ID } = process.env;
const chainId = Number(REACT_APP_CHAIN_ID);

const { Sider } = Layout;
const Sidebar = () => {
  const address = useSelector(({ blockchain }) => blockchain.address);

  const [filter, setFilter] = useState(`type:post`);

  //const [filter, setFilter] = useState(`(uri.visibility:public OR onSale:true) AND chainId:${chainId} AND contract:${REACT_APP_CONTRACT_ADDRESS}`);
  const [disabled, setDisabled] = useState(true);
  //const [visible, setVisible] = useState(false);

  async function onChange(e) {
    if (address !== "") {
      setDisabled(false);
      if (e.target.checked === true) {
        const hashResult = await hash(address);
        if (hashResult.isCalculated === true) {
          const filterStr = `owner:${hashResult.hash} AND type:post`;
          setFilter(filterStr);
          console.log("On change", e.target.checked, filterStr);
        } else console.error("hashResult", hashResult);
      } else {
        const filterStr = `type:post`;
        setFilter(filterStr);
      }
    } else {
      setDisabled(true);
      setFilter(`type:post`);
    }
  }

  useEffect(() => {
    if (address === "") {
      setDisabled(true);
      setFilter(`type:post`);
    } else {
      setDisabled(false);
      const filterStr = `type:post`;
      setFilter(filterStr);
    }
  }, [address]);

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
              <IntlMessages id="sidebar.algolia.nft" />
            </span>
          >
            <RefinementList
              className="gx-algolia-refinementList"
              attribute="nft"
              operator="or"
              limit={10}
              searchable
              showMore
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
        </div>
      </div>
    </Sider>
  );
};

export default Sidebar;
