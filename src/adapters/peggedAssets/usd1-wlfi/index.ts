const chainContracts = {
  bsc: {
    issued: ["0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d"],
  },
  ethereum: {
    issued: ["0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d"],
  },
  tron: {
    issued: ["TPFqcBAaaUMCSVRCqPaQ9QnzKhmuoLR6Rc"],
  }
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;