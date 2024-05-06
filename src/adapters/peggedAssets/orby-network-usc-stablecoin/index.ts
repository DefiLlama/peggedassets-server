const chainContracts = {
  cronos: {
    issued: ["0xD42E078ceA2bE8D03cd9dFEcC1f0d28915Edea78"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;