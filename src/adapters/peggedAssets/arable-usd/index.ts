const chainContracts = {
  avax: {
    issued: ["0x025AB35fF6AbccA56d57475249baaEae08419039"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;