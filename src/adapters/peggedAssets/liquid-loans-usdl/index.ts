const chainContracts = {
  pulse: {
    issued: ["0x0deed1486bc52aa0d3e6f8849cec5add6598a162"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;