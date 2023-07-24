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
              link="/pro"
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
              creator="Create Mina Avatar NFT"
              title="Create Mina Avatar NFT"
              link="/create/avatar"
              price="$9 for deployment of the Mina NFT and $19-$999 for reservation of name for one year (regular name is $19, short names like @sea and @gold are $49-$99, exclusive names like @shopping are $999)"
              description="Create personalised avatar NFTs and use them as an identity symbol across various social media. Mina Avatar NFTs are equipped to host verifiable proofs of authenticity. Users can securely attach and share public and private sensitive content such as art, contracts, medical records, or ownership proofs, transforming traditional NFTs into versatile digital identities. MinaNFT is a space where art meets privacy"
              image="https://res.cloudinary.com/minanft/image/fetch/h_300,q_100,f_auto/https://minanft-storage.s3.eu-west-1.amazonaws.com/minanft_profile_photo.jpg"
              key="Create Avatar"

              />
        </Col>
        
              <Col xxl={8} xl={8} lg={12} md={12} sm={24} xs={24}>
            <MintMenuItem
              creator="Create new post on MinaNFT"
              title="Create new post on MinaNFT"
              link="/create/post"
              price="$5 for deployment"
              description="Create new post on your Mina Avatar NFTs to host images and documents with verifiable proofs of authenticity. Youc can securely attach and share public and private sensitive content such as art, contracts, medical records, or ownership proofs, transforming traditional NFTs into versatile digital identities. MinaNFT is a space where art meets privacy"
              image="https://res.cloudinary.com/minanft/image/fetch/h_300,q_100,f_auto/https://minanft-storage.s3.eu-west-1.amazonaws.com/minanft_profile_photo.jpg"
              key="Create Post"

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
