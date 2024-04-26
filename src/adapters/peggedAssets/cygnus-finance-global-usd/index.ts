

const chainContracts = {
  base: {
    issued: "0xCa72827a3D211CfD8F6b00Ac98824872b72CAb49",
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter