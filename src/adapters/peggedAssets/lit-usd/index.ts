const chainContracts = {
  ethereum: {
    issued: "0x3B5F2810fB2168FfA9C73160F97BF9f2461fFa5c",
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;