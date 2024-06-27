import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { message } from "antd";
import { Highlight } from "react-instantsearch-dom";
import { Button } from "antd";
import IntlMessages from "util/IntlMessages";
import { minaLogin } from "../../blockchain/mina";
import { storageUrlFromURL } from "../../blockchain/storage";
import SellButton from "./SellButton";
import BuyButton from "./BuyButton";
const DEBUG = "true" === process.env.REACT_APP_DEBUG;

const ProductItem = ({ item }) => {
  const address = useSelector(({ blockchain }) => blockchain.address);
  const [onSale, setOnSale] = useState(
    item.price && item.price > 0 ? true : false
  );
  const [canSell, setCanSell] = useState(
    address?.toUpperCase() === item?.owner?.toUpperCase()
  );
  console.log("Item: ", item);
  const imageUrl = storageUrlFromURL(item.image);
  const tokenPath = "@" + item.name;

  return (
    <div className="gx-product-item gx-product-vertical">
      <a href={tokenPath}>
        <div className="gx-product-image">
          <img src={`${imageUrl}`} alt="" crossOrigin="anonymous" />
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
              <SellButton item={item} address={address} />
            </span>
          ) : (
            <span>
              {onSale ? (
                <span style={{ float: "right" }}>
                  <BuyButton item={item} address={address} />
                </span>
              ) : (
                ""
              )}
            </span>
          )}
        </div>
        <div className="gx-mb-3">
          <Highlight attribute="collection" hit={item} />
        </div>

        {onSale ? (
          <div className="gx-product-price">
            <span style={{ float: "right" }}>
              {item.price / 1_000_000_000} {"MINA"}
            </span>
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default ProductItem;
