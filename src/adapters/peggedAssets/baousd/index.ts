const chainContracts = {
  ethereum: {
    issued: ["0x7945b0A6674b175695e5d1D08aE1e6F13744Abb0"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;