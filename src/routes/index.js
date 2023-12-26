import React from "react";
import { Route, Switch } from "react-router-dom";

import asyncComponent from "util/asyncComponent";

const App = ({ match }) => (
  <div className="gx-main-content-wrapper">
    <Switch>
      <Route
        path={`${match.url}explore`}
        component={asyncComponent(() => import("./Explore"))}
      />
      <Route
        path={`${match.url}posts`}
        component={asyncComponent(() => import("./Posts"))}
      />
      <Route
        path={`${match.url}create/nft`}
        component={asyncComponent(() => import("./CreateNFT"))}
      />
      <Route
        path={`${match.url}create/post`}
        component={asyncComponent(() => import("./CreatePost"))}
      />
      <Route
        path={`${match.url}create`}
        component={asyncComponent(() => import("./Create"))}
      />
      <Route
        path={`${match.url}edit`}
        component={asyncComponent(() => import("./Edit"))}
      />
      <Route
        path={`${match.url}prove`}
        component={asyncComponent(() => import("./Prove"))}
      />
      <Route
        path={`${match.url}verify`}
        component={asyncComponent(() => import("./Verify"))}
      />
      <Route
        path={`${match.url}tools`}
        component={asyncComponent(() => import("./Tools"))}
      />
      <Route
        path={`${match.url}corporate/onboarding`}
        component={asyncComponent(() => import("./CorporateOnboarding"))}
      />
      <Route
        path={`${match.url}corporate/billing`}
        component={asyncComponent(() => import("./CorporateBilling"))}
      />
      <Route
        path={`${match.url}corporate`}
        component={asyncComponent(() => import("./CorporatePortal"))}
      />
      <Route
        path={`${match.url}token/:chainId/:contract/:tokenId`}
        component={asyncComponent(() => import("./Token"))}
      />
      <Route
        path={`${match.url}token/:tokenId`}
        component={asyncComponent(() => import("./Token"))}
      />
      <Route
        path={`${match.url}@:tokenId`}
        component={asyncComponent(() => import("./Token"))}
      />
    </Switch>
  </div>
);

export default App;
