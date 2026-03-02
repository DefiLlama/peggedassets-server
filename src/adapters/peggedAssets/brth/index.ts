const chainContracts = {
  polygon: {
    issued: ["0x38fd02Dc840F099772392f2DFe3A3BEE9Aab3AB7"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts, undefined, { pegType: "peggedREAL" });
export default adapter;

