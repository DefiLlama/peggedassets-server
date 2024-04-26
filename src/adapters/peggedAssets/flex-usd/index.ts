const chainContracts = {
  ethereum: {
    issued: ["0xa774ffb4af6b0a91331c084e1aebae6ad535e6f3"],
  },
  smartbch: {
    issued: ["0x7b2b3c5308ab5b2a1d9a94d20d35ccdf61e05b72"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
