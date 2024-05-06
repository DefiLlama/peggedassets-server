
const chainContracts = {
  ethereum: {
    issued: ["0x97de57eC338AB5d51557DA3434828C5DbFaDA371"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
