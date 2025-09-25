import {ChainContracts} from "../peggedAsset.type";

export const chainContracts: ChainContracts = {
    ethereum: {
        issued: ["0x5422374B27757da72d5265cC745ea906E0446634"],
        unreleased: ["0xc98Cb9F53e20AFbbeb75Caf6456eD52D5d7903f6", "0x7dE0bbdfCd4A6a956F149bEFcca30D6B5Bc5DA69"], // Operation registrar
    },
    solana: {
        issued: ["8smindLdDuySY6i2bStQX9o8DVhALCXCMbNxD98unx35"], // mainnet token
        unreleased: ["4N1WwAaSukn7YtRKRArA3Ntp4CfcB1nCiqCDGEjEBhEj", "5tg4qRdiXJ7XxYd6KK4UnnNvxgHJqfBUygPqZLwSnhnt"], // Operation registrar
    }
}