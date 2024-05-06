const chainContracts = {
  bsc: {
    issued: "0xE68b79e51bf826534Ff37AA9CeE71a3842ee9c70",
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter