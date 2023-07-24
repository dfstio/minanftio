import React, {useState} from "react";
import { useSelector} from "react-redux";
import api from "../../serverless/api";
import {Button, Row, Col} from "antd";
import MintMenuItem from './MintMenu';

import IntlMessages from "util/IntlMessages";

const { REACT_APP_VIRTUOSO_BRANCH } = process.env;


const Mint = () => {

  const address = useSelector(({blockchain}) => blockchain.address);


  function add()
  {

            console.log("Add balance clicked", address);
            if( address !== "") api.add( address, 100, "Added $1 ");
  }


  return (
  <div className="gx-algolia-content-inner">

  {(REACT_APP_VIRTUOSO_BRANCH === 'polygon')?(
    <Row>
      <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
            <MintMenuItem
              creator="Your NFT Token"
              title="Create your own private NFT token"
              link="/mint/custom"
              price="$10 for private NFT token or $100 for public NFT token"
              description="Private NFT token will be visible only to you on Mina NFT marketplace, except when you'll put it for sale. Public NFT token is always visible to everyone on Mina NFT marketplace"
              image="https://res.cloudinary.com/virtuoso/image/fetch/h_300,q_100,f_auto/https://minanft-storage.s3.eu-west-1.amazonaws.com/minanft_profile_photo.jpg"
              key="Private Mint"

              />
        </Col>
        </Row>
  ):(
      <Row>

      <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
            <MintMenuItem
              creator="Your NFT Token"
              title="Create your own private NFT token"
              link="/mint/custom"
              price="$10 for private NFT token or $100 for public NFT token"
              description="Private NFT token will be visible only to you on Mina NFT marketplace, except when you'll put it for sale. Public NFT token is always visible to everyone on Mina NFT marketplace"
              image="https://res.cloudinary.com/minanft/image/fetch/h_300,q_100,f_auto/https://minanft-storage.s3.eu-west-1.amazonaws.com/minanft_profile_photo.jpg"
              key="Private Mint"

              />
        </Col>

                <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
            <MintMenuItem
              creator="Blockchain art"
              title="Privacy and NFT"
              price="USD 5000"
              description="Privacy and NFT"
              image="https://res.cloudinary.com/minanft/image/fetch/h_300,q_100,f_auto/https://content.nftvirtuoso.io/image/mintimages/deepnft.jpg"

              key="Blockchain art"

              />
        </Col>
        </Row>
      )}

    </div>
  );
};

export default Mint;
