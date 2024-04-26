
const chainContracts = {
  optimism: {
    issued: ["0x10398abc267496e49106b07dd6be13364d10dc71"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
