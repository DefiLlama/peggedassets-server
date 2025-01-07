const chainContracts = {
  fraxtal: {
    issued: "0x788D96f655735f52c676A133f4dFC53cEC614d4A",
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
