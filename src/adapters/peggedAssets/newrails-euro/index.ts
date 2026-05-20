import { addChainExports } from "../helper/getSupply";
import type { ChainContracts, PeggedIssuanceAdapter } from "../peggedAsset.type";

const chainContracts: ChainContracts = {
  monad: {
    issued: ["0x1111b3ded9f1fe1801ad4ebef8e2788183a24111"],
  },
};

const adapter: PeggedIssuanceAdapter = {
  ...addChainExports(chainContracts, undefined, { decimals: 6, pegType: "peggedEUR" }),
};

export default adapter;
