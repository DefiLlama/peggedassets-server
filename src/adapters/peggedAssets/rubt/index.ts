const chainContracts = {
  ethereum: {
    issued: ["0xe103f85c23577675f82438a2866C7EE3bBC9c8C8"],
  },
  tron: {
    bridgedFromETH: ["TAufZEJdyKLBjBKAPCVBjciabaTci2sUPv"]
  },
  hyperliquid: {
    bridgedFromETH: ["0xead4BCe5B9b5777cDc45B94DFa88209dE7A4EfBe"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts, undefined, { pegType: 'peggedRUB', decimals: 6 });
export default adapter;
