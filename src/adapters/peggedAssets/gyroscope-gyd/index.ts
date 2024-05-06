const chainContracts = {
  ethereum: {
    issued: ["0xe07f9d810a48ab5c3c914ba3ca53af14e4491e8a"],
  },
  polygon: {
    issued: ["0x37b8E1152fB90A867F3dccA6e8d537681B04705E"]
  }
}

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;