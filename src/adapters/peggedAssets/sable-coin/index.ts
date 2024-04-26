
const chainContracts = {
  bsc: {
    issued: ["0x0c6Ed1E73BA73B8441868538E210ebD5DD240FA0"],
  },
  base: {
    issued: ["0xecf3e9B8ccb6F4A6EFD68058FD706561c1727031"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;