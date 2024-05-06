
const chainContracts: any = {
  ethereum: {
    issued: ["0x7635b612792e4bfb7f2fa12a3e5d5a3f2e3c34bc"],
    pegType: "peggedCNY",
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
