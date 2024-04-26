const chainContracts = {
  arbitrum: {
    issued: ["0x0BBF664D46becc28593368c97236FAa0fb397595"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;