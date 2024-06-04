import React, { useEffect } from "react";
import { Layout } from "antd";
import { useDispatch, useSelector } from "react-redux";
import HorizontalDefault from "../Topbar/HorizontalDefault/index";
import HorizontalDark from "../Topbar/HorizontalDark/index";
import InsideHeader from "../Topbar/InsideHeader/index";
import AboveHeader from "../Topbar/AboveHeader/index";

import BelowHeader from "../Topbar/BelowHeader/index";
import Topbar from "../Topbar/index";
import {
  footerText,
  footerTextLink,
  footerAgreement,
  footerContact,
  footerAgreementLink,
  footerEmail,
  footerTwitter,
  footerTwitterLink,
  footerDocs,
  footerDocsLink,
  footerGitHub,
  footerGitHubLink,
  footerTestnet,
  footerTestnetLink,
} from "../../util/config";
import App from "../../routes/index";

import {
  NAV_STYLE_ABOVE_HEADER,
  NAV_STYLE_BELOW_HEADER,
  NAV_STYLE_DARK_HORIZONTAL,
  NAV_STYLE_DEFAULT_HORIZONTAL,
  NAV_STYLE_DRAWER,
  NAV_STYLE_FIXED,
  NAV_STYLE_INSIDE_HEADER_HORIZONTAL,
  NAV_STYLE_MINI_SIDEBAR,
  NAV_STYLE_NO_HEADER_EXPANDED_SIDEBAR,
  NAV_STYLE_NO_HEADER_MINI_SIDEBAR,
} from "../../constants/ThemeSetting";
import NoHeaderNotification from "../Topbar/NoHeaderNotification/index";
import { useRouteMatch } from "react-router-dom";
import { updateWindowWidth } from "../../appRedux/actions";
import AppSidebar from "./AppSidebar";

const { Content, Footer } = Layout;

const getContainerClass = (navStyle) => {
  switch (navStyle) {
    case NAV_STYLE_DARK_HORIZONTAL:
      return "gx-container-wrap";
    case NAV_STYLE_DEFAULT_HORIZONTAL:
      return "gx-container-wrap";
    case NAV_STYLE_INSIDE_HEADER_HORIZONTAL:
      return "gx-container-wrap";
    case NAV_STYLE_BELOW_HEADER:
      return "gx-container-wrap";
    case NAV_STYLE_ABOVE_HEADER:
      return "gx-container-wrap";
    default:
      return "";
  }
};

const getNavStyles = (navStyle) => {
  switch (navStyle) {
    case NAV_STYLE_DEFAULT_HORIZONTAL:
      return <HorizontalDefault />;
    case NAV_STYLE_DARK_HORIZONTAL:
      return <HorizontalDark />;
    case NAV_STYLE_INSIDE_HEADER_HORIZONTAL:
      return <InsideHeader />;
    case NAV_STYLE_ABOVE_HEADER:
      return <AboveHeader />;
    case NAV_STYLE_BELOW_HEADER:
      return <BelowHeader />;
    case NAV_STYLE_FIXED:
      return <Topbar />;
    case NAV_STYLE_DRAWER:
      return <Topbar />;
    case NAV_STYLE_MINI_SIDEBAR:
      return <Topbar />;
    case NAV_STYLE_NO_HEADER_MINI_SIDEBAR:
      return <NoHeaderNotification />;
    case NAV_STYLE_NO_HEADER_EXPANDED_SIDEBAR:
      return <NoHeaderNotification />;
    default:
      return null;
  }
};

const MainApp = () => {
  const { navStyle } = useSelector(({ settings }) => settings);
  const match = useRouteMatch();
  const dispatch = useDispatch();

  useEffect(() => {
    window.addEventListener("resize", () => {
      dispatch(updateWindowWidth(window.innerWidth));
    });
  }, [dispatch]);

  return (
    <Layout className="gx-app-layout">
      <AppSidebar navStyle={navStyle} />
      <Layout>
        {getNavStyles(navStyle)}
        <Content
          className={`gx-layout-content ${getContainerClass(navStyle)} `}
        >
          <App match={match} />
          <Footer>
            <div className="gx-layout-footer-content">
              <ul className="gx-login-list">
                <li>
                  <a
                    href={footerTextLink}
                    target="_blank"
                    style={{ fontSize: "14px" }}
                  >
                    {footerText}
                  </a>
                </li>
                <li>
                  <a
                    href={footerAgreementLink}
                    target="_blank"
                    style={{ fontSize: "14px" }}
                  >
                    {footerAgreement}
                  </a>
                </li>
                <li>
                  <a href={footerEmail} style={{ fontSize: "14px" }}>
                    {footerContact}
                  </a>
                </li>
                <li>
                  <a
                    href={footerDocsLink}
                    target="_blank"
                    style={{ fontSize: "14px" }}
                  >
                    {footerDocs}
                  </a>
                </li>
                <li>
                  <a
                    href={footerTwitterLink}
                    target="_blank"
                    style={{ fontSize: "14px" }}
                  >
                    {footerTwitter}
                  </a>
                </li>
                <li>
                  <a
                    href={footerGitHubLink}
                    target="_blank"
                    style={{ fontSize: "14px" }}
                  >
                    {footerGitHub}
                  </a>
                </li>
                <li>
                  <a
                    href={footerTestnetLink}
                    target="_blank"
                    style={{ fontSize: "14px" }}
                  >
                    {footerTestnet}
                  </a>
                </li>
              </ul>
            </div>
          </Footer>
        </Content>
      </Layout>
    </Layout>
  );
};
export default MainApp;
