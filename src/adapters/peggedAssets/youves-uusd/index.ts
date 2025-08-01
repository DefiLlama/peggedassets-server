import { ChainContracts, } from "../peggedAsset.type";


const chainContracts: ChainContracts = {
  tezos: {
    issued: ["KT1XRPEPXbZK25r3Htzp2o1x7xdMMmfocKNW"],
  },
};

import { addChainExports } from "../helper/getSupply";
export default addChainExports(chainContracts);
