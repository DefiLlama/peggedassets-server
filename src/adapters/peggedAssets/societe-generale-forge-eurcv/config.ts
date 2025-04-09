import {ChainContracts} from "../peggedAsset.type";

export const chainContracts: ChainContracts = {
    ethereum: {
        issued: ["0x5F7827FDeb7c20b443265Fc2F40845B715385Ff2"],
        unreleased: ["0xc98Cb9F53e20AFbbeb75Caf6456eD52D5d7903f6", "0x7dE0bbdfCd4A6a956F149bEFcca30D6B5Bc5DA69"], // Operation registrar
    },
    solana: {
        issued: ["DghpMkatCiUsofbTmid3M3kAbDTPqDwKiYHnudXeGG52"], // mainnet token
        unreleased: ["4N1WwAaSukn7YtRKRArA3Ntp4CfcB1nCiqCDGEjEBhEj", "5tg4qRdiXJ7XxYd6KK4UnnNvxgHJqfBUygPqZLwSnhnt"], // Operation registrar
    }
}