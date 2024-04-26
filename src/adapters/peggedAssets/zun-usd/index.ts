const chainContracts = {
  ethereum: {
    issued: ["0x8C0D76C9B18779665475F3E212D9Ca1Ed6A1A0e6"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;