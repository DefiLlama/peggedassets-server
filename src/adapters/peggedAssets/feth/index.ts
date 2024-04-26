
const chainContracts = {
  ethereum: {
    issued: ["0x53805A76E1f5ebbFE7115F16f9c87C2f7e633726"], pegType: 'peggedVAR'
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
