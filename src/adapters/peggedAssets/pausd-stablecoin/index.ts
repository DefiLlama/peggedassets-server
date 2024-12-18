import { addChainExports } from "../helper/getSupply";
import {ChainContracts,
} from "../peggedAsset.type";

const chainContracts:ChainContracts = {
  ethereum: {
    issued: ["0x571f54D23cDf2211C83E9A0CbD92AcA36c48Fa02"],
  },
  polygon: {
    issued: ["0x8054d4D130C3A84852f379424Bcac75673a7486B"],
  },
};
  
const adapter = addChainExports(chainContracts);
export default adapter;