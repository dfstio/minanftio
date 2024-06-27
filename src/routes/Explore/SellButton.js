import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Modal,
  Form,
  InputNumber,
  Input,
  Radio,
  Checkbox,
} from "antd";
import { footerAgreement, footerAgreementLink } from "../../util/config";
import { useDispatch, useSelector } from "react-redux";
import { updateAddress } from "../../appRedux/actions";
import { sellNFT } from "../../mint/sell";
import { waitForTransaction } from "../../mint/send";
import { minaLogin } from "../../blockchain/mina";
import { explorerTransaction } from "../../blockchain/explorer";

const DEBUG = "true" === process.env.REACT_APP_DEBUG;

const SellButton = ({ item }) => {
  //class SellButton extends React.Component {

  const [modalText, setModalText] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("Sell NFT @" + item.name);
  const [price, setPrice] = useState(100);
  const [okDisabled, setOkDisabled] = useState(true);
  const address = useSelector(({ blockchain }) => blockchain.address);
  const dispatch = useDispatch();

  const showModal = () => {
    setVisible(true);
    setModalText("");
    setLoading(false);
  };

  const showText = async (text) => {
    setModalText(text);
  };

  useEffect(() => {
    async function checkOkButton() {
      const newOkDisabled = Number(price) < 1 || Number(price) > 500;
      if (newOkDisabled !== okDisabled) setOkDisabled(newOkDisabled);
      //if( DEBUG) console.log("Sell okDisabled: ", newOkDisabled, price, accepted);
    }
    checkOkButton();
  }, [price]);

  const handleOk = async () => {
    setModalText("Preparing sale transaction...");
    setLoading(true);

    const newAddress = await minaLogin();
    dispatch(updateAddress(newAddress));
    if (newAddress === "" || newAddress === undefined) {
      setVisible(false);
      return;
    }
    let sellResult = await sellNFT({
      name: item.name,
      price: Number(price) * 1_000_000_000,
      owner: newAddress,
      address: item.address,
      showText,
    });
    if (sellResult.success === false || sellResult.jobId === undefined) {
      setModalText("Error: " + sellResult.error ?? "");
      return;
    }
    console.log("SellButton sellResult", sellResult);
    const jobId = sellResult.jobId;
    const jobInfo = (
      <span>
        Proving transaction, cloud prove job id:
        <a href={"https://minarollupscan.com/"} target="_blank">
          {jobId}
        </a>
      </span>
    );

    setModalText(jobInfo);
    const txResult = await waitForTransaction(jobId);
    console.log("SellButton tx sellResult", txResult);
    if (txResult.success) {
      const txInfo = (
        <span>
          Transaction sent with hash:
          <a href={explorerTransaction() + txResult.hash} target="_blank">
            {txResult.hash}
          </a>
        </span>
      );
      setModalText(txInfo);
    } else {
      setModalText("Error: " + txResult.error ?? "");
    }
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleChange = (values) => {
    if (DEBUG) console.log("Sell values changed", values);
    if (values.price !== undefined) setPrice(values.price);
  };

  return (
    <div>
      <Button type="primary" onClick={showModal}>
        Sell
      </Button>
      <Modal
        title={title}
        visible={visible}
        onOk={handleOk}
        confirmLoading={loading}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          onValuesChange={handleChange}
          layout="vertical"
          name="form_in_modal"
          initialValues={{
            price: 100,
          }}
        >
          <Form.Item
            name="price"
            label="Price"
            rules={[
              {
                validator: (_, value) =>
                  value >= 1 || value <= 500
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error(
                          `Price should be higher than 1 MINA and less than 500 MINA`
                        )
                      ),
              },

              {
                required: true,
                message: "Please input the the price between 1 and 500 MINA",
              },
            ]}
          >
            <InputNumber min={1} max={500} addonAfter="MINA" />
          </Form.Item>
          <Form.Item>
            <div
              className="gx-mt-0"
              style={{
                whiteSpace: "pre-wrap",
              }}
            >
              <span>
                By clicking the Sell button, you are confirming your agreement
                with our
              </span>
              <span>
                <a href={footerAgreementLink} target="_blank">
                  {footerAgreement}
                </a>
                <br />
                MinaNFT commission on this sale is 10%.{" "}
              </span>
            </div>
          </Form.Item>

          <Form.Item name="sell" className="currency-sell-form_last-form-item">
            <Button
              type="primary"
              onClick={handleOk}
              disabled={okDisabled}
              loading={loading}
            >
              Sell
            </Button>
          </Form.Item>
          <p>{modalText}</p>
        </Form>
      </Modal>
    </div>
  );
};

export default SellButton;
