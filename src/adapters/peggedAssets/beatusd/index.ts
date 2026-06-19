const chainContracts = {
  hyperliquid: {
    issued: ["0x669abe85F96a9e3B34723F7Be9bC6F250aBC0Cc1"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
