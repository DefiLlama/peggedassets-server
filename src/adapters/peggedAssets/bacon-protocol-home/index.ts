const chainContracts = {
  ethereum: {
    issued: "0xb8919522331C59f5C16bDfAA6A121a6E03A91F62",
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;