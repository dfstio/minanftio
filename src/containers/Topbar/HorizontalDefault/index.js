import React, { useState } from "react";
import { Button, Dropdown, Layout, Menu, message, Popover, Select } from "antd";
import Icon from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import CustomScrollbars from "util/CustomScrollbars";
import languageData from "../languageData";
import SearchBox from "../../../components/SearchBox";
import UserInfo from "../../../components/UserInfo";
import AppNotification from "../../../components/AppNotification";
import MailNotification from "../../../components/MailNotification";
import HorizontalNav from "../HorizontalNav";
import { Link } from "react-router-dom";
import {
  switchLanguage,
  toggleCollapsedSideNav,
} from "../../../appRedux/actions";
import IntlMessages from "../../../util/IntlMessages";
import { TAB_SIZE } from "../../../constants/ThemeSetting";
import AuroWallet from "../../../blockchain/account";
import { isMobile, isDesktop, isChrome } from "react-device-detect";

const { Header } = Layout;
const Option = Select.Option;
const menu = (
  <Menu onClick={handleMenuClick}>
    <Menu.Item key="1">Products</Menu.Item>
    <Menu.Item key="2">Apps</Menu.Item>
    <Menu.Item key="3">Blogs</Menu.Item>
  </Menu>
);

function handleMenuClick(e) {
  message.info("Click on menu item.");
}

function handleChange(value) {}

const HorizontalDefault = () => {
  const navCollapsed = useSelector(({ common }) => common.navCollapsed);
  const width = useSelector(({ common }) => common.width);
  const { locale } = useSelector(({ settings }) => settings);
  const [searchText, setSearchText] = useState("");
  const dispatch = useDispatch();

  const languageMenu = () => (
    <CustomScrollbars className="gx-popover-lang-scroll">
      <ul className="gx-sub-popover">
        {languageData.map((language) => (
          <li
            className="gx-media gx-pointer"
            key={JSON.stringify(language)}
            onClick={(e) => dispatch(switchLanguage(language))}
          >
            <i className={`flag flag-24 gx-mr-2 flag-${language.icon}`} />
            <span className="gx-language-text">{language.name}</span>
          </li>
        ))}
      </ul>
    </CustomScrollbars>
  );

  const updateSearchChatUser = (evt) => {
    setSearchText(evt.target.value);
  };

  return (
    <div className="gx-header-horizontal">
      <div className="gx-header-horizontal-top">
        <div className="gx-container">
          <div className="gx-header-horizontal-top-flex">
            {/*
            {isDesktop ? (
              <div className="gx-header-horizontal-top-left">
                <i className="icon icon-alert gx-mr-3" />

                <p className="gx-mb-0 gx-text-truncate">
                  <IntlMessages id="app.announced" />
                </p>
              </div>
            ) : (
              ""
            )}
          */}
            <Link
              to="/"
              className="gx-d-none gx-d-lg-block gx-pointer gx-mr-xs-5 gx-logo"
            >
              <img
                alt=""
                src="/assets/images/minanft-big-logo.png"
                style={{ height: "32px" }}
              />
            </Link>
            <div
              style={{
                fontSize: "24px",
                paddingLeft: "10px",
                paddingRight: "50px",
              }}
            >
              Mina NFT
            </div>
            <div
              className="gx-header-horizontal-main-flex"
              style={{ paddingRight: "20px", fontSize: "16px" }}
            >
              <Link
                to="/explore"
                className="gx-menu-list"
                style={{ paddingRight: "40px" }}
              >
                <IntlMessages id="sidebar.avatars" />
              </Link>
              <Link
                to="/create"
                className="gx-menu-list"
                style={{ paddingRight: "40px" }}
              >
                <IntlMessages id="sidebar.create" />
              </Link>
              <Link
                to="/prove"
                className="gx-menu-list"
                style={{ paddingRight: "40px" }}
              >
                <IntlMessages id="sidebar.prove" />
              </Link>
              <Link
                to="/verify"
                className="gx-menu-list"
                style={{ paddingRight: "40px" }}
              >
                <IntlMessages id="sidebar.verify" />
              </Link>
            </div>
            <AuroWallet />
            <Popover
              overlayClassName="gx-popover-horizantal"
              placement="bottomRight"
              content={languageMenu()}
              trigger="click"
            >
              <span
                className="gx-pointer gx-flex-row gx-align-items-center"
                style={{ paddingLeft: "10px" }}
              >
                <i className={`flag flag-24 flag-${locale.icon}`} />
              </span>
            </Popover>
          </div>
        </div>
      </div>

      {/*
      <Header className="gx-header-horizontal-main">
        <div className="gx-container">
          <div className="gx-header-horizontal-main-flex">
            <div className="gx-d-block gx-d-lg-none gx-linebar gx-mr-xs-3">
              <i
                className="gx-icon-btn icon icon-menu"
                onClick={() => {
                  dispatch(toggleCollapsedSideNav(!navCollapsed));
                }}
              />
            </div>
            <Link
              to="/"
              className="gx-d-block gx-d-lg-none gx-pointer gx-w-logo"
            >
              <img alt="" src="/assets/images/minanft.png" />
            </Link>
            <Link
              to="/"
              className="gx-d-none gx-d-lg-block gx-pointer gx-mr-xs-5 gx-logo"
            >
              <img alt="" src="/assets/images/minanft.png" />
            </Link>
            <div style={{ fontSize: "22px", paddingLeft: "10px" }}>
              Mina NFT
            </div>
            {/*
            <div className="gx-header-search gx-d-none gx-d-lg-flex">


              <SearchBox styleName="gx-lt-icon-search-bar-lg"
                         placeholder="Search in app..."
                         onChange={updateSearchChatUser}
                         value={searchText}/>

              <Select defaultValue="lucy" style={{width: 120}} onChange={handleChange}>
                <Option value="jack">Products</Option>
                <Option value="lucy">Apps</Option>
                <Option value="Yiminghe">Blogs</Option>
              </Select>

            </div>


            <ul
              className="gx-header-notifications gx-ml-auto"
              style={{ paddingRight: "10px" }}
            >

              <li className="gx-notify gx-notify-search gx-d-inline-block gx-d-lg-none">
                <Popover overlayClassName="gx-popover-horizantal" placement="bottomRight" content={
                  <div className="gx-d-flex">
                    <Dropdown overlay={menu}>
                      <Button>
                        Category <Icon type="down"/>
                      </Button>
                    </Dropdown>
                    <SearchBox styleName="gx-popover-search-bar"
                               placeholder="Search in app..."
                               onChange={updateSearchChatUser}
                               value={searchText}/>
                  </div>
                } trigger="click">
                  <span className="gx-pointer gx-d-block"><i className="icon icon-search-new"/></span>

                </Popover>
              </li>
              <li className="gx-notify">
                <Popover overlayClassName="gx-popover-horizantal" placement="bottomRight" content={<AppNotification/>}
                         trigger="click">
                  <span className="gx-pointer gx-d-block"><i className="icon icon-notification"/></span>
                </Popover>
              </li>

              <li className="gx-msg">
                <Popover overlayClassName="gx-popover-horizantal" placement="bottomRight"
                         content={<MailNotification/>} trigger="click">
                <span className="gx-pointer gx-status-pos gx-d-block">
                <i className="icon icon-chat-new"/>
                <span className="gx-status gx-status-rtl gx-small gx-orange"/>
                </span>
                </Popover>
              </li>

              <li className="gx-user-nav">
                <UserInfo />
              </li>
              <li className="gx-language">
                <Popover
                  overlayClassName="gx-popover-horizantal"
                  placement="bottomRight"
                  content={languageMenu()}
                  trigger="click"
                >
                  <span className="gx-pointer gx-flex-row gx-align-items-center">
                    <i className={`flag flag-24 flag-${locale.icon}`} />
                  </span>
                </Popover>
              </li>
            </ul>
          </div>
        </div>
      </Header>

      {width >= TAB_SIZE && (
        <div className="gx-header-horizontal-nav gx-header-horizontal-nav-curve">
          <div className="gx-container">
            <div className="gx-header-horizontal-nav-flex-align-content-around">
              <HorizontalNav />

            </div>
          </div>
        </div>
      )}
    */}
    </div>
  );
};

export default HorizontalDefault;
