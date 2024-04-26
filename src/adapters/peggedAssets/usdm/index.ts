const chainContracts = {
  ethereum: {
    issued: "0x59d9356e565ab3a36dd77763fc0d87feaf85508c",
  },
  polygon: {
    issued: "0x59d9356e565ab3a36dd77763fc0d87feaf85508c",
  },
  base: {
    issued: "0x59d9356e565ab3a36dd77763fc0d87feaf85508c",
  },
  optimism: {
    issued: "0x59d9356e565ab3a36dd77763fc0d87feaf85508c",
  },
  arbitrum: {
    issued: "0x59d9356e565ab3a36dd77763fc0d87feaf85508c",
  },
};


import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;