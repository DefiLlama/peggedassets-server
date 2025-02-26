import { addChainExports } from "../helper/getSupply";
import { PeggedIssuanceAdapter } from "../peggedAsset.type";

const chainContracts = {
  sei: {
    issued: ["0x059A6b0bA116c63191182a0956cF697d0d2213eC"],
  }
};

const adapter: PeggedIssuanceAdapter = {
  ...addChainExports(chainContracts),
};

export default adapter; 
