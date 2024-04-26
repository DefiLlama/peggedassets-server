const chainContracts =  {
  polygon: {
    issued: ["0x0d9447e16072b636b4a1e8f2b8c644e58f3eaa6a"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts, undefined, { pegType: 'peggedUAH' });
export default adapter;
