const chainContracts = {
  starknet: {
    issued: ["0x0498edfaf50ca5855666a700c25dd629d577eb9afccdf3b5977aec79aee55ada"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;