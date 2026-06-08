import {ChainContracts,} from "../peggedAsset.type";

export const chainContracts: ChainContracts = {
  starknet: {
    issued: [
      "0x719b5092403233201aa822ce928bd4b551d0cdb071a724edd7dc5e5f57b7f34",
    ],
    unreleased: [
      "0x07daadaa043b22429020efb9ac16bcc5f6a9b6ed3305de48e65a0ad5dcb76759",
    ],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;