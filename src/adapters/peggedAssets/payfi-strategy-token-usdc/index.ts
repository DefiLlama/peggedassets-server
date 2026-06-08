const chainContracts = {
  ethereum: {
    issued: ["0x22aE3D9a738471f405169Af055d31c687087d4c7"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
