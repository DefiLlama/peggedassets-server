
const chainContracts = {
  arbitrum: {
    issued: ["0xF202Ab403Cd7E90197ec0f010ee897E283037706"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;