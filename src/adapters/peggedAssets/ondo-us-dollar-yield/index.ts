const chainContracts = {
  ethereum: {
    issued: "0x96F6eF951840721AdBF46Ac996b59E0235CB985C",
  },
  polygon: {
    issued: "0x96F6eF951840721AdBF46Ac996b59E0235CB985C",
  },
  mantle: {
    issued: "0x5bE26527e817998A7206475496fDE1E68957c5A6",
    unreleased: ["0x94FEC56BBEcEaCC71c9e61623ACE9F8e1B1cf473"],
  },
  sui: {
    issued: [
      "0x960b531667636f39e85867775f52f6b1f220a058c4de786905bdf761e06a56bb",
    ],
  },
  solana: {
    issued: ["A1KLoBrKBde8Ty9qtNQUtq3C2ortoC3u7twggz7sEto6"],
  },
  aptos: {
    issued: [
      "0xcfea864b32833f157f042618bd845145256b1bf4c0da34a7013b76e42daa53cc",
    ],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
