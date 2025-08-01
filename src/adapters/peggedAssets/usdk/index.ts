import {
 ChainContracts,
} from "../peggedAsset.type";


const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0x1c48f86ae57291f7686349f12601910bd8d470bb"],
  },
  polygon: {
    bridgedFromETH: ["0xD07A7FAc2857901E4bEC0D89bBDAe764723AAB86"],
  },
  okexchain: {
    bridgedFromETH: ["0xdcac52e001f5bd413aa6ea83956438f29098166b"],
  },
  solana: {
    bridgedFromETH: ["43m2ewFV5nDepieFjT9EmAQnc1HRtAF247RBpLGFem5F"], // wormhole
  },
};

import { addChainExports } from "../helper/getSupply";
export default addChainExports(chainContracts);
