import { ChainContracts, } from "../peggedAsset.type";


const chainContracts: ChainContracts = {
  tezos: {
    issued: ["KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9"],
  },
};

import { addChainExports } from "../helper/getSupply";
export default addChainExports(chainContracts);
