const chainContracts = {
  avax: {
    issued: ["0xab05b04743e0aeaf9d2ca81e5d3b8385e4bf961e"],
  },
  ethereum: {
    issued: ["0x45fdb1b92a649fb6a64ef1511d3ba5bf60044838"],
    unreleased: ["0xe85131becf5298db58d60e5d628f2c927c7f88cc"],
  },
  polygon: {
    issued: ["0x2f1b1662a895c6ba01a99dcaf56778e7d77e5609"],
  },
  bsc: {
    issued: ["0xde7d1ce109236b12809c45b23d22f30dba0ef424"],
  },
}

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;