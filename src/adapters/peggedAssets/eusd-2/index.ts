const chainContracts = {
  ethereum: {
    issued: ["0x14913815bcfde78baead2111f463d038ac9c2949"],
  },
  polygon: {
    issued: ["0x14913815bcfde78baead2111f463d038ac9c2949"],
  },
  base: {
    issued: ["0x14913815bcfde78baead2111f463d038ac9c2949"],
  },
  solana: {
    issued: ["HQMYCZTDq9g3oZejDRUeQsFtLKgyfvBpD3yHaTnain3L"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
