import React from "react";
import api from "../../serverless/api";
import {isMobile, isDesktop, isChrome} from 'react-device-detect';
import {accountingEmail } from "../../util/config";
import {Button, message} from "antd";
import {useDispatch, useSelector} from "react-redux";
import {updateAddress, updateVirtuosoBalance, updatePublicKey} from "../../appRedux/actions";
import { minaLogin,
         virtuosoRegisterPublicKey
         } from "../../blockchain/mina";

import IntlMessages from "util/IntlMessages";

import logger from "../../serverless/logger";
const logm = logger.info.child({ winstonModule: 'Verify' });
const { REACT_APP_DEBUG } = process.env;

const Prove = () => {

  const address = useSelector(({blockchain}) => blockchain.address);
  const publicKey = useSelector(({blockchain}) => blockchain.publicKey);
  const balance = useSelector(({blockchain}) => blockchain.balance);
  const virtuosoBalance = useSelector(({blockchain}) => blockchain.virtuosoBalance);
  const dispatch = useDispatch();


  const log = logm.child({ winstonComponent: 'Verify' });


  let vb = "$0";
  let showWithdaw = false;
  if( virtuosoBalance !== undefined)
  {
    const vb1 = virtuosoBalance/100;
    vb = ' $' + vb1.toString();
    if( vb1 > 100) showWithdaw = true;
  };

  let pb = " is not registered";
  if( publicKey !== undefined && publicKey !== "") pb = " is " + publicKey;


  async function register()
  {

            log.info("Register clicked", {address, wf: "register"});

            if( address !== undefined && address !== "")
            {
                 log.profile(`Registered public key of address ${address}`);
                 const key = 'RegisterPublicKey';
                 message.loading({content: `Please provide public key in Metamask and confirm transaction`, key, duration: 60});



                const result = await virtuosoRegisterPublicKey(address);
                if( result.publicKey !== "" && result.hash !== "")
                {
                    dispatch(updatePublicKey(result.publicKey));
                    message.success({content: `Public key ${result.publicKey} is written to blockchain with transaction ${result.hash}`, key, duration: 10});
                }
                else message.error({content: `Public key is not provided or written to blockchain`, key, duration: 10});
                log.profile(`Registered public key of address ${address}`, {address, result, wf: "register"});

            };
  }

  async function test()
  {
            //logger.meta.address = address;
            log.info("Test error clicked", {address, wf: "testerror"});
            try{
                throw new Error({message: "errortest"});
           } catch (error) {

             // return error
             log.error("catch", {error});
          }

  }


  async function connect()
  {

            log.info("Connect clicked", {address, wf: "connect"});
            const newAddress = await minaLogin();
            dispatch(updateAddress(newAddress));
  }

  return (
    <div>
      <h2 className="title gx-mb-4"><IntlMessages id="sidebar.verify"/></h2>
      <div className="gx-d-flex justify-content-center">
        <h4>You can prove content of any private file that was sealed to the Mina blockchain in the Mina NFT. In case of text files less than 1k in size, you can prove any part of content by sanitizing parts of the text file that you do not want to disclose</h4>
      </div>
    </div>
  );
};

export default Prove;
