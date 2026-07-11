const chainContracts = {
  ethereum: {
    issued: ["0x3fa142dd3f384414e05e71ad0939274edc82ec0a"],
  },
  base: {
    issued: ["0xa15705e6fc8b3e08e7253f3758de1a754baa0761"],
  },
  solana: {
    issued: ["EeBX9JLdvsp4HnBbMgC1HnAjBkBQxgxtWxspcCLtT6ci"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts, undefined, { pegType: "peggedCAD" });
export default adapter;
