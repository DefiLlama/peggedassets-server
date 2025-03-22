const chainContracts = {
  ethereum: {
    issued: ["0x7712c34205737192402172409a8F7ccef8aA2AEc","0x6a9DA2D710BB9B700acde7Cb81F10F1fF8C89041"],
  },
  aptos: {
    issued: ["0x50038be55be5b964cfa32cf128b5cf05f123959f286b4cc02b86cafd48945f89"],
  },
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