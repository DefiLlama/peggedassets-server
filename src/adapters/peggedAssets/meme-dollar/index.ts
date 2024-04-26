const chainContracts = {
  ethereum: {
    issued: "0x02814F435dD04e254Be7ae69F61FCa19881a780D",
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;