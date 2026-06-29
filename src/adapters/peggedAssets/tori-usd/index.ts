const chainContracts = {
  ethereum: {
    issued: ["0xd0580192E98eA6CEB9c7b6191Ed2E27560911697"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
