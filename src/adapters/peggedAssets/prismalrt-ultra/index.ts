
const chainContracts = {
  ethereum: {
    issued: ["0x35282d87011f87508D457F08252Bc5bFa52E10A0"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
