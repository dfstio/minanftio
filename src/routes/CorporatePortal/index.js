import React, { useState } from "react";
import { useSelector } from "react-redux";
import api from "../../serverless/api";
import { Button, Row, Col } from "antd";
import MintMenuItem from "./MintMenu";

import IntlMessages from "util/IntlMessages";

const Mint = () => {
  const address = useSelector(({ blockchain }) => blockchain.address);

  return (
    <div className="gx-algolia-content-inner">
      <Row>
        <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
          <MintMenuItem
            creator=<IntlMessages id="corporate.createcorporateaccount" />
            title=<IntlMessages id="corporate.createorupdatecorporateaccount" />
            link="/corporate/onboarding"
            button=<IntlMessages id="corporate.createbutton" />
            description=<IntlMessages id="corporate.createdescription" />
            image="https://res.cloudinary.com/minanft/image/fetch/h_300,q_100,f_auto/https://minanft-storage.s3.eu-west-1.amazonaws.com/CorporateKYC.png"
            key="Create Corporate Account"
          />
        </Col>

        <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
          <MintMenuItem
            creator="Get Authorisation Token"
            title="Get Authorisation Token"
            link="https://t.me/minanft_bot?start=auth"
            button="Get Token"
            description="Get or renew your authorisation token by visiting MinaNFT telegram bot at https://t.me/minanft_bot?start=auth"
            image="https://res.cloudinary.com/minanft/image/fetch/h_300,q_100,f_auto/https://minanft-storage.s3.eu-west-1.amazonaws.com/AuthorisationToken.png"
            key="Get Authorisation Token"
          />
        </Col>

        <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
          <MintMenuItem
            creator=<IntlMessages id="corporate.billing" />
            title=<IntlMessages id="corporate.billingtitle" />
            link="/corporate/billing"
            button=<IntlMessages id="corporate.billingbutton" />
            description=<IntlMessages id="corporate.billingdescription" />
            image="https://res.cloudinary.com/minanft/image/fetch/h_300,q_100,f_auto/https://minanft-storage.s3.eu-west-1.amazonaws.com/CorporateBilling.png"
            key="orporate Billing"
          />
        </Col>

        <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
          <MintMenuItem
            creator=<IntlMessages id="corporate.docs" />
            title=<IntlMessages id="corporate.docstitle" />
            link="https://docs.minanft.io"
            button=<IntlMessages id="corporate.docsbutton" />
            description=<IntlMessages id="corporate.docsdescription" />
            image="https://res.cloudinary.com/minanft/image/fetch/h_300,q_100,f_auto/https://minanft-storage.s3.eu-west-1.amazonaws.com/CorporateDocs.png"
            key="Create Corporate Account"
          />
        </Col>

        <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
          <MintMenuItem
            creator=<IntlMessages id="corporate.library" />
            title=<IntlMessages id="corporate.librarytitle" />
            link="https://github.com/dfstio/minanft-lib"
            button=<IntlMessages id="corporate.librarybutton" />
            description=<IntlMessages id="corporate.librarydescription" />
            image="https://res.cloudinary.com/minanft/image/fetch/h_300,q_100,f_auto/https://minanft-storage.s3.eu-west-1.amazonaws.com/CorporateLibrary.png"
            key="Corporate Library"
          />
        </Col>

        <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
          <MintMenuItem
            creator=<IntlMessages id="corporate.support" />
            title=<IntlMessages id="corporate.supporttitle" />
            link="mailto:hello@minanft.io"
            button=<IntlMessages id="corporate.supportbutton" />
            description=<IntlMessages id="corporate.supportdescription" />
            image="https://res.cloudinary.com/minanft/image/fetch/h_300,q_100,f_auto/https://minanft-storage.s3.eu-west-1.amazonaws.com/CorporateSupport.png"
            key="Corporate Support"
          />
        </Col>
      </Row>
    </div>
  );
};

export default Mint;
