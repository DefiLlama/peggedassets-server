const chainContracts = {
  ethereum: {
    issued: ["0x98A878b1Cd98131B271883B390f68D2c90674665"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
