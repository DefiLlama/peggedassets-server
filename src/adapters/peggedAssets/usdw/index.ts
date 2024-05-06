const chainContracts = {
  ethpow: {
    issued: ["0x520A36eE3aa0b506288915f91Fb4BBB23d09a7D7"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;