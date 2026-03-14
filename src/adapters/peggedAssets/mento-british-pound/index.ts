import type { ChainContracts } from "../peggedAsset.type";

const chainContracts: ChainContracts = {
  celo: {
    issued: ["0xCCF663b1fF11028f0b19058d0f7B674004a40746"],
  },
  monad: {
    bridgedFromCelo: ["0x39bb4E0a204412bB98e821d25e7d955e69d40Fd1"], // portal
  },
};

import { addChainExports } from "../helper/getSupply";
export default addChainExports(chainContracts);
