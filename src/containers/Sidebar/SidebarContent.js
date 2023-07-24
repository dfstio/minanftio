import React from "react";
import {Menu} from "antd";
import {Link} from "react-router-dom";

import CustomScrollbars from "util/CustomScrollbars";
import SidebarLogo from "./SidebarLogo";
import UserProfile from "./UserProfile";
import AppsNavigation from "./AppsNavigation";
import {
  NAV_STYLE_NO_HEADER_EXPANDED_SIDEBAR,
  NAV_STYLE_NO_HEADER_MINI_SIDEBAR,
  THEME_TYPE_LITE
} from "../../constants/ThemeSetting";
import IntlMessages from "../../util/IntlMessages";
import {useSelector} from "react-redux";

const SidebarContent = ({sidebarCollapsed, setSidebarCollapsed}) => {
  const {navStyle, themeType} = useSelector(({settings}) => settings);
  const pathname = useSelector(({common}) => common.pathname);

  const getNoHeaderClass = (navStyle) => {
    if (navStyle === NAV_STYLE_NO_HEADER_MINI_SIDEBAR || navStyle === NAV_STYLE_NO_HEADER_EXPANDED_SIDEBAR) {
      return "gx-no-header-notifications";
    }
    return "";
  };

  const selectedKeys = pathname.substr(1);
  const defaultOpenKeys = selectedKeys.split('/')[1];

  return (
    <>
      <SidebarLogo sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed}/>
      <div className="gx-sidebar-content">
        <div className={`gx-sidebar-notifications ${getNoHeaderClass(navStyle)}`}>
          <UserProfile/>
          <AppsNavigation/>
        </div>
        <CustomScrollbars className="gx-layout-sider-scrollbar">
          <Menu
            defaultOpenKeys={[defaultOpenKeys]}
            selectedKeys={[selectedKeys]}
            theme={themeType === THEME_TYPE_LITE ? 'lite' : 'dark'}
            mode="inline">

            <Menu.Item key="avatars">
                  <Link to="/avatars"><i className="icon icon-shopping-cart "/>
                  <IntlMessages id="sidebar.avatars"/></Link>
            </Menu.Item>
            
            <Menu.Item key="posts">
                  <Link to="/posts"><i className="icon icon-shopping-cart "/>
                  <IntlMessages id="sidebar.posts"/></Link>
            </Menu.Item>

            <Menu.Item key="create">
              <Link to="/create">
                <i className="icon icon-culture-calendar"/>
                <IntlMessages id="sidebar.create"/>
              </Link>
            </Menu.Item>
          

            <Menu.Item key="verify">
              <Link to="/verify">
                <i className="icon icon-components"/>
                <IntlMessages id="sidebar.verify"/>
              </Link>
            </Menu.Item>
            
            
            <Menu.Item key="settings">
              <Link to="/settings">
                <i className="icon icon-components"/>
                <IntlMessages id="sidebar.settings"/>
              </Link>
            </Menu.Item>


          </Menu>
        </CustomScrollbars>
      </div>
    </>
  );
};

export default React.memo(SidebarContent);

