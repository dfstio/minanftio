import React from "react";
import { Card } from "antd";

const { Meta } = Card;

const MintMenuItem = ({ title, creator, description, price, link, image }) => {
  return (
    <div className="gx-product-item gx-product-vertical">
      {link === "" ? (
        <Card
          title={creator}
          cover={<img alt="example" src={image} crossorigin="anonymous" />}
          bordered={false}
        >
          <div className="gx-product-name">
            <p>{description}</p>
            <Meta title={title} description={price} />
          </div>
        </Card>
      ) : (
        <Card
          title={creator}
          extra={
            <a href={link}>
              <span className="gx-link">Create</span>
            </a>
          }
          cover={<img alt="example" src={image} crossorigin="anonymous" />}
          bordered={false}
        >
          <div className="gx-product-name">
            <p>{description}</p>
            <Meta title={title} description={price} />
          </div>
        </Card>
      )}
    </div>
  );
};

export default MintMenuItem;
