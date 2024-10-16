const chainContracts = {
  ethereum: {
    issued: ["0x5ca135cb8527d76e932f34b5145575f9d8cbe08e"], pegType: 'peggedVAR'
  },
  era: {
    issued: ["0xD405617DB7473b0A3158356Be7bC9EbEc6D88b85"], pegType: 'peggedVAR'
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
