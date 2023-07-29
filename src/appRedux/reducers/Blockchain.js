import logger from "../../serverless/logger";

import {
    UPDATE_ADDRESS,
    UPDATE_VIRTUOSO_BALANCE,
    UPDATE_BALANCE,
    UPDATE_VRT1,
    UPDATE_PUBLIC_KEY,
    UPDATE_USERNAME,
} from "../../constants/Blockchain";

const initialSettings = {
    address: "",
    virtuosoBalance: 0,
    balance: 0,
    VRT1: 0,
    publicKey: "",
    username: "",
};

const SettingsReducer = (state = initialSettings, action) => {
    switch (action.type) {
        case UPDATE_ADDRESS:
            logger.meta.address = action.address;
            return {
                initialSettings,
                address: action.address,
            };
        case UPDATE_VIRTUOSO_BALANCE:
            return {
                ...state,
                virtuosoBalance: action.virtuosoBalance,
            };

        case UPDATE_BALANCE:
            return {
                ...state,
                balance: action.balance,
            };

        case UPDATE_VRT1:
            return {
                ...state,
                VRT1: action.VRT1,
            };

        case UPDATE_PUBLIC_KEY:
            return {
                ...state,
                publicKey: action.publicKey,
            };

        case UPDATE_USERNAME:
            return {
                ...state,
                username: action.username,
            };

        default:
            return state;
    }
};

export default SettingsReducer;
