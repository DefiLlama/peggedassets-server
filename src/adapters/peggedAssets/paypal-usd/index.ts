const chainContracts = {
  ethereum: {
    issued: ["0x6c3ea9036406852006290770BEdFcAbA0e23A0e8"],
  },
  solana: {
    issued: ["2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
