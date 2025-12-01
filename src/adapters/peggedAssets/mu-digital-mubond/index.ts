import { addChainExports } from "../helper/getSupply";
import { ChainContracts, PeggedIssuanceAdapter } from "../peggedAsset.type";

const chainContracts: ChainContracts = {
  monad: {
    issued: ["0x336d414754967c6682b5a665c7daf6f1409e63e8"],
  },
};

const adapter: PeggedIssuanceAdapter = {
  ...addChainExports(chainContracts, undefined, { decimals: 18 }),
};

export default adapter;
