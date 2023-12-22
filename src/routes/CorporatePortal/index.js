import React, { useState } from "react";
import { useSelector } from "react-redux";
import api from "../../serverless/api";
import { Button, Row, Col } from "antd";
import MintMenuItem from "./MintMenu";

import IntlMessages from "util/IntlMessages";

const { REACT_APP_VIRTUOSO_BRANCH } = process.env;

const Mint = () => {
  const address = useSelector(({ blockchain }) => blockchain.address);

  return (
    <div className="gx-algolia-content-inner">
      {REACT_APP_VIRTUOSO_BRANCH === "polygon" ? (
        <Row>
          <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
            <MintMenuItem
              creator="Your NFT Token"
              title="Create your own private NFT token"
              link="/pro"
              price="$10 for private NFT token or $100 for public NFT token"
              description="Private NFT token will be visible only to you on Mina NFT marketplace, except when you'll put it for sale. Public NFT token is always visible to everyone on Mina NFT marketplace"
              image="https://res.cloudinary.com/virtuoso/image/fetch/h_300,q_100,f_auto/https://minanft-storage.s3.eu-west-1.amazonaws.com/CorporateKYC.png"
              key="Private Mint"
            />
          </Col>
        </Row>
      ) : (
        <Row>
          <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
            <MintMenuItem
              creator="Create Corporate Account"
              title="Create or Update Corporate Account"
              link="/corporate/kyc"
              price=""
              description="Create corporate account or update your existing account."
              image="https://res.cloudinary.com/minanft/image/fetch/h_300,q_100,f_auto/https://minanft-storage.s3.eu-west-1.amazonaws.com/CorporateKYC.png"
              key="Create Corporate Account"
            />
          </Col>

          <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
            <MintMenuItem
              creator="Get Authorisation Token"
              title="Get Authorisation Token"
              link="https://t.me/minanft_bot?start=auth"
              price=""
              description="Get or renew your authorisation token by visiting MinaNFT telegram bot at https://t.me/minanft_bot?start=auth"
              image="https://res.cloudinary.com/minanft/image/fetch/h_300,q_100,f_auto/https://minanft-storage.s3.eu-west-1.amazonaws.com/AuthorisationToken.png"
              key="Get Authorisation Token"
            />
          </Col>

          <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
            <MintMenuItem
              creator="Description of the Mina NFT project"
              title="Description of Mina NFT project"
              link=""
              price=""
              description="MinaNFT is an innovative NFT project leveraging the Mina blockchain's unique privacy features and AI technology. Our platform allows users to create personalised avatar NFTs and use them as an identity symbol across various social media. By interacting with our Telegram bot, users can describe avatar idea by texting or sending voice message in any language, and our AI will generate a unique NFT. Additionally, our avatar NFTs are equipped to host verifiable proofs of authenticity. Users can securely attach and share public and private sensitive content such as art, contracts, medical records, or ownership proofs, transforming traditional NFTs into versatile digital identities. Individuals and businesses are welcome to join MinaNFT, a space where art meets privacy, and personalize their digital footprint"
              image="https://res.cloudinary.com/minanft/image/fetch/h_300,q_100,f_auto/https://content.nftvirtuoso.io/image/mintimages/deepnft.jpg"
              key="MinaNFT Description"
            />
          </Col>
        </Row>
      )}
    </div>
  );
};

export default Mint;
