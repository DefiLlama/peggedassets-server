const chainContracts = {
  ethereum: {
    issued: ["0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;