const chainContracts: ChainContracts = {
  karura: {
    issued: ["0x0000000000000000000300000000000000000001"],
  },
};
import {
  ChainContracts,
} from "../peggedAsset.type";

process.env.KARURA_RPC='https://eth-rpc-karura.aca-api.network'

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
