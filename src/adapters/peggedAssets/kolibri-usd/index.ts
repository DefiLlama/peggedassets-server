import { ChainContracts, } from "../peggedAsset.type";


const chainContracts: ChainContracts = {
  tezos: {
    issued: ["KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV"],
  },
};

import { addChainExports } from "../helper/getSupply";
export default addChainExports(chainContracts);
