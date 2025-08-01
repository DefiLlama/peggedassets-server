const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0x03ab458634910aad20ef5f1c8ee96f1d6ac54919"],
  },
  polygon: {
    bridgedFromETH: ["0x00e5646f60ac6fb446f621d146b6e1886f002905"],
  },
  optimism: {
    bridgedFromETH: ["0x7fb688ccf682d58f86d7e38e03f9d22e7705448b"],
  },
  arbitrum: {
    bridgedFromETH: ["0xaeF5bbcbFa438519a5ea80B4c7181B4E78d419f2"],
  },
  avax: {
    bridgedFromETH: ["0x97cd1cfe2ed5712660bb6c14053c0ecb031bff7d"],
  },
  xdai: {
    bridgedFromETH: ["0xd7a28Aa9c470e7e9D8c676BCd5dd2f40c5683afa"],
  },
  loopring: {
    bridgeOnETH: ["0x674bdf20A0F284D710BC40872100128e2d66Bd3f"],
  },
};

import { addChainExports } from "../helper/getSupply";
import { ChainContracts } from "../peggedAsset.type";
const adapter = addChainExports(chainContracts, undefined, { pegType: 'peggedVAR' });
export default adapter;
