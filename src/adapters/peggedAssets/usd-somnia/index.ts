import { addChainExports } from "../helper/getSupply";
import { ChainContracts, PeggedIssuanceAdapter } from "../peggedAsset.type";

const chainContracts: ChainContracts = {
  somnia: {
    issued: ["0x00000022dA000002656c64D9eA6011ea952D008A"],
  },
};

const adapter: PeggedIssuanceAdapter = addChainExports(chainContracts, undefined, {
  decimals: 18,
});

export default adapter;
