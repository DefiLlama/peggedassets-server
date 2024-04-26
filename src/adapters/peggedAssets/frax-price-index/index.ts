const chainContracts = {
  ethereum: {
    issued: ["0x5ca135cb8527d76e932f34b5145575f9d8cbe08e"], pegType: 'peggedVAR'
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
