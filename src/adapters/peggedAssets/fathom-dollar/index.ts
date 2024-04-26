const chainContracts = {
  xdc: {
    issued: ["0x49d3f7543335cf38Fa10889CCFF10207e22110B5"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;