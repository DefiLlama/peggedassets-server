
const chainContracts = {
  ethereum: {
    issued: ["0x1B84765dE8B7566e4cEAF4D0fD3c5aF52D3DdE4F"],
  },
  bsc: {
    bridgedFromETH: ["0x23b891e5c62e0955ae2bd185990103928ab817b3"],
  },
  polygon: {
    bridgedFromETH: ["0xb6c473756050de474286bed418b77aeac39b02af"],
  },
  avax: {
    bridgedFromETH: ["0xcfc37a6ab183dd4aed08c204d1c2773c0b1bdf46"],
  },
  arbitrum: {
    bridgedFromETH: ["0x2913e812cf0dcca30fb28e6cac3d2dcff4497688"],
  },
  fantom: {
    bridgedFromETH: ["0xed2a7edd7413021d440b09d654f3b87712abab66"],
  },
  harmony: {
    bridgedFromETH: ["0xed2a7edd7413021d440b09d654f3b87712abab66"],
  },
  boba: {
    bridgedFromETH: ["0x6b4712ae9797c199edd44f897ca09bc57628a1cf"],
  },
  optimism: {
    bridgedFromETH: ["0x67c10c397dd0ba417329543c1a40eb48aaa7cd00"],
  },
  cronos: {
    bridgedFromETH: ["0x396c9c192dd323995346632581bef92a31ac623b"],
  },
  metis: {
    bridgedFromETH: ["0x961318fc85475e125b99cc9215f62679ae5200ab"],
  },
  dfk: {
    bridgedFromETH: ["0x52285d426120ab91f378b3df4a15a036a62200ae"],
  },
  aurora: {
    bridgedFromETH: ["0x07379565cD8B0CaE7c60Dc78e7f601b34AF2A21c"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;