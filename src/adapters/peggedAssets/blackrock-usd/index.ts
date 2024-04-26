const chainContracts = {
  ethereum: {
    issued: ["0x7712c34205737192402172409a8F7ccef8aA2AEc"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;