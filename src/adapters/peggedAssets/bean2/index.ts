const chainContracts = {
  ethereum: {
    issued: ["0xBEA0000029AD1c77D3d5D23Ba2D8893dB9d1Efab"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;