const chainContracts = {
  ethereum: {
    issued: ["0xd2a530170d71a9cfe1651fb468e2b98f7ed7456b"],
  },
  base: {
    issued: ["0xd2a530170d71a9cfe1651fb468e2b98f7ed7456b"],
  },
  polygon: {
    issued: ["0xd2a530170d71a9cfe1651fb468e2b98f7ed7456b"],
  },
  avax: {
    issued: ["0xd2a530170d71a9cfe1651fb468e2b98f7ed7456b"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts, undefined, { pegType: "peggedAUD" });
export default adapter;
