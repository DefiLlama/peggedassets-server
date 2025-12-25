import { addChainExports } from "../helper/getSupply";
import { ChainContracts, PeggedIssuanceAdapter } from "../peggedAsset.type";

const chainContracts: ChainContracts = {
  monad: {
    issued: ["0x4917a5ec9fCb5e10f47CBB197aBe6aB63be81fE8"],
  },
};

const adapter: PeggedIssuanceAdapter = {
  ...addChainExports(chainContracts, undefined, { decimals: 18 }),
};

export default adapter;
