const chainContracts = {
  polygon: {
    issued: ["0x40379a439D4F6795B6fc9aa5687dB461677A2dBa"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;