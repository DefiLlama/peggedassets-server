const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0xC581b735A1688071A1746c968e0798D642EDE491"],
    unreleased: ["0x5754284f345afc66a98fbb0a0afe71e0f007b949"],
  },
  polygon: {
    bridgedFromETH: ["0x7BDF330f423Ea880FF95fC41A280fD5eCFD3D09f"],
  },
};

import { ChainContracts, } from "../peggedAsset.type";
import { addChainExports } from "../helper/getSupply";

const adapter = addChainExports(chainContracts, undefined, { pegType: 'peggedEUR', decimals: 6 });
export default adapter;
