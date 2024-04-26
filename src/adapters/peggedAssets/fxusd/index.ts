const chainContracts = {
  ethereum: {
    issued: [
      "0x085780639CC2cACd35E474e71f4d000e2405d8f6",
      "0xD6B8162e2fb9F3EFf09bb8598ca0C8958E33A23D",
      "0xa87F04c9743Fd1933F82bdDec9692e9D97673769",
    ],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;