import {
  ChainContracts,
} from "../peggedAsset.type";

process.env.KARURA_RPC='https://eth-rpc-karura.aca-api.network'

const chainContracts: ChainContracts = {
  acala: {
    // issued: ["0x0000000000000000000100000000000000000001"],  // // hacked, inflated circulating, not trading acalaMinted(chainContracts.acala.issued[0], 12),
  },
  karura: {
    // issued: ["0x0000000000000000000100000000000000000081"],  // hacked and redeemed for aSeed
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;

  
