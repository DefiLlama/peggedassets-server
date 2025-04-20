const chainContracts = {
  ethereum: {
    issued: ["0x6c3ea9036406852006290770BEdFcAbA0e23A0e8"],
  },
  solana: {
    issued: ["2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo"],
  },
  berachain: {
    bridgedFromETH: ["0x688e72142674041f8f6Af4c808a4045cA1D6aC82"],
  },
  flow: {
    bridgedFromETH: ["0x2aaBea2058b5aC2D339b163C6Ab6f2b6d53aabED"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts, undefined, { decimals: 6});
export default adapter;
