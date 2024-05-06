const chainContracts = {
  ethereum: {
    issued: ["0x83131242843257bc6C43771762ba467346Efb2CF"], //USDi
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;