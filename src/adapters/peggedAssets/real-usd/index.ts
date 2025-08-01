
const chainContracts: ChainContracts = {
  polygon: {
    issued: ["0x40379a439D4F6795B6fc9aa5687dB461677A2dBa"],
  },
  real: {
    bridgedFromPolygon: [
      "0xb2d75f8Aa33608cF15940Ed47bF139F7CD15d073", 
    ],
  },

};

import { addChainExports } from "../helper/getSupply";
import { ChainContracts } from "../peggedAsset.type";

const adapter = addChainExports(chainContracts, undefined, { pegType: 'peggedUSD', decimals: 9 });
export default adapter;
