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
  zksync: {
    issued: "0x7715c206A14Ac93Cb1A6c0316A6E5f8aD7c9Dc31",
  },
};


import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;