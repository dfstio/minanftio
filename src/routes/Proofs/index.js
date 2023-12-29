import React, { useState } from "react";
import { useSelector } from "react-redux";
import api from "../../serverless/api";
import { Button, Row, Col } from "antd";
import MintMenuItem from "./MintMenu";

import IntlMessages from "util/IntlMessages";

const Create = () => {
  const address = useSelector(({ blockchain }) => blockchain.address);

  return (
    <div className="gx-algolia-content-inner">
      <Row>
        <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
          <MintMenuItem
            creator=<IntlMessages id="proofs.create" />
            title=<IntlMessages id="proofs.create" />
            link="/create/nft"
            button=<IntlMessages id="proofs.create.button" />
            description=<IntlMessages id="proofs.create.description" />
            image="https://res.cloudinary.com/minanft/image/fetch/h_300,q_100,f_auto/https://minanft-storage.s3.eu-west-1.amazonaws.com/CreateStringProof.png"
            key="Create NFT"
          />
        </Col>

        <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
          <MintMenuItem
            creator=<IntlMessages id="create.post" />
            title=<IntlMessages id="create.post.title" />
            link="/create/post"
            button=<IntlMessages id="create.post.button" />
            description=<IntlMessages id="create.post.description" />
            image="https://res.cloudinary.com/minanft/image/fetch/h_300,q_100,f_auto/https://minanft-storage.s3.eu-west-1.amazonaws.com/CreatePost.png"
            key="Craete Post"
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
            key="Get Authorisation Token - Create"
          />
        </Col>

        <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
          <MintMenuItem
            creator=<IntlMessages id="create.docs" />
            title=<IntlMessages id="create.docs.title" />
            link="https://docs.minanft.io"
            button=<IntlMessages id="create.docs.button" />
            description=<IntlMessages id="create.docs.description" />
            image="https://res.cloudinary.com/minanft/image/fetch/h_300,q_100,f_auto/https://minanft-storage.s3.eu-west-1.amazonaws.com/CorporateDocs.png"
            key="Docs - Create"
          />
        </Col>

        <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
          <MintMenuItem
            creator=<IntlMessages id="create.library" />
            title=<IntlMessages id="create.library.title" />
            link="https://github.com/dfstio/minanft-lib"
            button=<IntlMessages id="create.library.button" />
            description=<IntlMessages id="create.library.description" />
            image="https://res.cloudinary.com/minanft/image/fetch/h_300,q_100,f_auto/https://minanft-storage.s3.eu-west-1.amazonaws.com/CorporateLibrary.png"
            key="Library - Create"
          />
        </Col>

        <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
          <MintMenuItem
            creator=<IntlMessages id="create.support" />
            title=<IntlMessages id="create.support.title" />
            link="mailto:hello@minanft.io"
            button=<IntlMessages id="create.support.button" />
            description=<IntlMessages id="create.support.description" />
            image="https://res.cloudinary.com/minanft/image/fetch/h_300,q_100,f_auto/https://minanft-storage.s3.eu-west-1.amazonaws.com/CorporateSupport.png"
            key="Support- Create"
          />
        </Col>
      </Row>
    </div>
  );
};

export default Create;
