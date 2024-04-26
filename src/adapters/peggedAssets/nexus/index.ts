const chainContracts = {
  ethereum: {
    issued: ["0x92211b6B68a39F4f68E722f3A3A4810A2Ebc8383"],
  },
  arbitrum: {
    issued: ["0x773fAf6B9424abFc199cc28A5320C3C2d151E3bF"],
  },
};


import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;