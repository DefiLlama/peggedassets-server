import type { ChainContracts } from "../peggedAsset.type";

const chainContracts: ChainContracts = {
  celo: {
    issued: ["0x8A567e2aE79CA692Bd748aB832081C45de4041eA"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts, undefined, { pegType: "peggedCOP", });
export default adapter;