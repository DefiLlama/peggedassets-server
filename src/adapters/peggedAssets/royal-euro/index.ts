const pegType = "peggedEUR";

const chainContracts = {
  ethereum: {
    issued: ["0x3ed0b3c4c0168a560d34e361b8130dcca4677736"],
    reserves: ["0xc50ebe57ae937a8ac0bcaab8945777c3be54a511"],
  },
  bsc: {
    issued: ["0x3ed0b3c4c0168a560d34e361b8130dcca4677736"],
    reserves: ["0xc50ebe57ae937a8ac0bcaab8945777c3be54a511"],
  },
  tron: {
    issued: ["TXUi9vL8Ltz4dVpC6RM8CdtKSTHxFZuFbz"],
    reserves: ["TQ1jtDoSd3m7AP8HHYBLxWJE8ucL8SXyGX"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts, undefined, { pegType });
export default adapter;
