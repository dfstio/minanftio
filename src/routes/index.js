import React from "react";
import {Route, Switch} from "react-router-dom";

import asyncComponent from "util/asyncComponent";

const App = ({match}) => (
  <div className="gx-main-content-wrapper">
    <Switch>
       <Route path={`${match.url}avatars`} component={asyncComponent(() => import('./Avatars'))}/>
       <Route path={`${match.url}posts`} component={asyncComponent(() => import('./Posts'))}/>
       <Route path={`${match.url}create`} component={asyncComponent(() => import('./Create'))}/>
       <Route path={`${match.url}create/avatar`} component={asyncComponent(() => import('./CreateAvatar'))}/>
       <Route path={`${match.url}create/post`} component={asyncComponent(() => import('./CreatePost'))}/>
       <Route path={`${match.url}settings`} component={asyncComponent(() => import('./Settings'))}/>
       <Route path={`${match.url}verify`} component={asyncComponent(() => import('./Verify'))}/>
       <Route path={`${match.url}token/:chainId/:contract/:tokenId`} component={asyncComponent(() => import('./token'))}/>
       <Route path={`${match.url}token/:tokenId`} component={asyncComponent(() => import('./token'))}/>
       <Route path={`${match.url}@:tokenId`} component={asyncComponent(() => import('./token'))}/>
    </Switch>
  </div>
);

export default App;
