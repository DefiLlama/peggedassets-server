
const pegType = "peggedSGD";

const chainContracts = {
  ethereum: {
    issued: ["0x58A849E1f3c7044bB317DB4611269c352c53d399"], pegType,
  },
  polygon: {
    issued: ["0x58A849E1f3c7044bB317DB4611269c352c53d399"], pegType,
  },
  bsc: {
    issued: ["0x58A849E1f3c7044bB317DB4611269c352c53d399"], pegType,
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;