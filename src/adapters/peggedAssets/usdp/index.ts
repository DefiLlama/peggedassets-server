const chainContracts = {
  ethereum: {
    issued: ["0x1456688345527be1f37e9e627da0837d6f08c925"],
  },
  xdai: {
    bridgedFromETH: ["0xFe7ed09C4956f7cdb54eC4ffCB9818Db2D7025b8"],
  },
  bsc: {
    issued: ["0xDACD011A71f8c9619642bf482f1D4CeB338cfFCf"],
  },
  fantom: {
    issued: ["0x3129aC70c738D398d1D74c87EAB9483FD56D16f8"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
