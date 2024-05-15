import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { message } from "antd";
import { updateAddress, updateVirtuosoBalance } from "../../appRedux/actions";
import { Highlight } from "react-instantsearch-dom";
import { Button } from "antd";
import IntlMessages from "util/IntlMessages";
import { minaLogin } from "../../blockchain/mina";
import { storageUrlFromURL } from "../../blockchain/storage";
//import SellButton from "./Sell";
import BuyButton from "./Buy";
const DEBUG = "true" === process.env.REACT_APP_DEBUG;

const ProductItem = ({ item }) => {
  //const icons = [];
  console.log("Item: ", item);
  const address = useSelector(({ blockchain }) => blockchain.address);
  const dispatch = useDispatch();
  let buttonId = "sidebar.algolia.buy";
  const imageUrl = storageUrlFromURL(item.image);
  let canSell = false;
  if (address.toUpperCase() === item.owner.toUpperCase()) {
    buttonId = "sidebar.algolia.sell";
    canSell = true;
  }
  const tokenPath = item.tokenId;
  // https://res.cloudinary.com/minanft/image/fetch/h_300,q_100,f_auto/

  return (
    <div className="gx-product-item gx-product-vertical">
      <a href={tokenPath}>
        <div className="gx-product-image">
          <img src={`${imageUrl}`} alt="" crossorigin="anonymous" />
        </div>
      </a>
      <div className="gx-product-body">
        <div className="gx-product-name">
          <a href={tokenPath}>
            <span>
              <Highlight attribute="name" hit={item} />
            </span>
          </a>
          {canSell ? (
            <span style={{ float: "right" }}>
              {/*<SellButton item={item} address={address} />*/}
            </span>
          ) : (
            <span>
              {item.onSale ? (
                <span style={{ float: "right" }}>
                  <BuyButton item={item} />
                  {/*
          <Button
          type="primary"
          onClick={ async () => {
                    if(DEBUG) console.log("Buy clicked");

                    message.loading("Preparing checkout page", 10);
                    const myaddress = await minaLogin(false);
                    dispatch(updateAddress(myaddress));

                    if( myaddress !== item.owner)
                    {
                           let buyTokenPath = "/api/create-checkout-session?type=buy&address=" + "generate" +
                            "&tokenId=" + item.tokenId.toString() + "&saleID=" + item.saleID.toString();
                           if( myaddress !== "")
                           {
                               buyTokenPath = "/api/create-checkout-session?type=buy&address=" + myaddress +
                                 "&tokenId=" + item.tokenId.toString() + "&saleID=" + item.saleID.toString();;
                           };

                           let form = document.createElement('form');

                           form.action = buyTokenPath;
                           form.method = 'POST';

                           // the form must be in the document to submit it
                           document.body.append(form);

                           form.submit();
                    }
                    else
                    {
                          message.error("You already own this NFT token", 10);
                    };

                }}

          >
            <IntlMessages id={buttonId}/>
            </Button>
          */}
                </span>
              ) : (
                ""
              )}
            </span>
          )}
        </div>
        <div className="gx-mb-3">
          <Highlight attribute="category" hit={item} />
        </div>

        {item.onSale ? (
          <div className="gx-product-price">
            <span style={{ float: "right" }}>
              {item.currency} {item.price}
            </span>
          </div>
        ) : (
          ""
        )}
        <div className="gx-mt-4" style={{ whiteSpace: "pre-wrap" }}>
          <a href={tokenPath}>
            <span>
              <Highlight attribute="shortdescription" hit={item} />
            </span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
