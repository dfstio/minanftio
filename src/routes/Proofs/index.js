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
            link="/prove/attributes"
            button=<IntlMessages id="proofs.create.button" />
            description=<IntlMessages id="proofs.create.description" />
            image="https://res.cloudinary.com/minanft/image/fetch/h_300,q_100,f_auto/https://minanft-storage.s3.eu-west-1.amazonaws.com/CreateStringProof.png"
            key="Create NFT"
          />
        </Col>

        <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
          <MintMenuItem
            creator=<IntlMessages id="proofs.verify" />
            title=<IntlMessages id="proofs.verify" />
            link="/verify/offchain"
            button=<IntlMessages id="proofs.verify.button" />
            description=<IntlMessages id="proofs.verify.description" />
            image="https://res.cloudinary.com/minanft/image/fetch/h_300,q_100,f_auto/https://minanft-storage.s3.eu-west-1.amazonaws.com/VerifyOffChain1.png"
            key="Create NFT"
          />
        </Col>

        <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
          <MintMenuItem
            creator=<IntlMessages id="proofs.verifyon" />
            title=<IntlMessages id="proofs.verifyon" />
            link="/verify/onchain"
            button=<IntlMessages id="proofs.verifyon.button" />
            description=<IntlMessages id="proofs.verifyon.description" />
            image="https://res.cloudinary.com/minanft/image/fetch/h_300,q_100,f_auto/https://minanft-storage.s3.eu-west-1.amazonaws.com/VerifyOnChain.png"
            key="Create NFT"
          />
        </Col>
      </Row>
    </div>
  );
};

export default Create;
