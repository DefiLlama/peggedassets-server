const chainContracts = {
  ethereum: {
    issued: ["0x44bb433d29fe966992a9c812da7f252c9c53f285"],
    reserves: ["0xc50ebe57ae937a8ac0bcaab8945777c3be54a511"],
  },
  bsc: {
    issued: ["0x44bb433d29fe966992a9c812da7f252c9c53f285"],
    reserves: ["0xc50ebe57ae937a8ac0bcaab8945777c3be54a511"],
  },
  tron: {
    issued: ["TUvns399UpycBBpVsCVJLCjXFBjzHrNUR1"],
    reserves: [
      "TQ1jtDoSd3m7AP8HHYBLxWJE8ucL8SXyGX",
      "TV2VoR52hEsAPEwkVXFWckfWNb2oRQo8oz",
    ],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
