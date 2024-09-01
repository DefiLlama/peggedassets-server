import { addChainExports } from "../helper/getSupply";
import {
  PeggedIssuanceAdapter,  ChainContracts,
} from "../peggedAsset.type";

const chainContracts = {
  ethereum: {
    issued: "0xFd03723a9A3AbE0562451496a9a394D2C4bad4ab",
  },
};

const adapter: PeggedIssuanceAdapter = addChainExports(chainContracts);

export default adapter;
