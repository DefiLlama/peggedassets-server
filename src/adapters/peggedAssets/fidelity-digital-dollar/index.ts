const chainContracts = {
  ethereum: {
    issued: ["0x7C135549504245B5eAe64fc0E99Fa5ebabb8e35D"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
