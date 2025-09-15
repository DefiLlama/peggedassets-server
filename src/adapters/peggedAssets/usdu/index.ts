import { ChainContracts,
} from "../peggedAsset.type";

const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0xdde3eC717f220Fc6A29D6a4Be73F91DA5b718e55"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts, undefined, {
  pegType: "peggedUSD",
});
export default adapter;