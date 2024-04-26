const chainContracts = {
  polygon: {
    issued: "0x65517425ac3ce259a34400bb67ceb39ff3ddc0bd",
    unreleased: ["0x8388A0f91875e74Dc4705Abf2C9bBDD1bD40C585"], pegType: "peggedARS",
  },
};


import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;