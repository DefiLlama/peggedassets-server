const chainContracts = {
  bsc: {
    issued: ["0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d"],
  },
  ethereum: {
    issued: ["0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d"],
  },
  tron: {
    issued: ["TPFqcBAaaUMCSVRCqPaQ9QnzKhmuoLR6Rc"],
  },
  solana: {
    issued: ["USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB"],
  },
  aptos: {
    issued: ["0x05fabd1b12e39967a3c24e91b7b8f67719a6dacee74f3c8b9fb7d93e855437d2"],
  },
  plume-mainnet: {
    issued: ["0x111111d2bf19e43C34263401e0CAd979eD1cdb61"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
