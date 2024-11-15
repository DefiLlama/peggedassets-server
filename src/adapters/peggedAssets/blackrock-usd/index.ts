const chainContracts = {
  ethereum: {
    issued: ["0x7712c34205737192402172409a8F7ccef8aA2AEc"],
  },
  // aptos: {
  //   issued: ["0x4de5876d8a8e2be7af6af9f3ca94d9e4fafb24b5f4a5848078d8eb08f08e808a"],
  // },
  arbitrum: {
    issued: ["0xA6525Ae43eDCd03dC08E775774dCAbd3bb925872"],
  },
  avax: {
    issued: ["0x53FC82f14F009009b440a706e31c9021E1196A2F"],
  },
  optimism: {
    issued: ["0xa1CDAb15bBA75a80dF4089CaFbA013e376957cF5"],
  },
  polygon: {
    issued: ["0x2893Ef551B6dD69F661Ac00F11D93E5Dc5Dc0e99"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;