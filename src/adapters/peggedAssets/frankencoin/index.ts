import { ChainContracts,
} from "../peggedAsset.type";

const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0xB58E61C3098d85632Df34EecfB899A1Ed80921cB"],
  },
  polygon: {
    issued: ["0xD4dD9e2F021BB459D5A5f6c24C12fE09c5D45553"],
    bridgedFromETH: ["0x02567e4b14b25549331fCEe2B56c647A8bAB16FD"], 
  },
  arbitrum: {
    issued: ["0xD4dD9e2F021BB459D5A5f6c24C12fE09c5D45553"],
    bridgedFromETH: ["0xB33c4255938de7A6ec1200d397B2b2F329397F9B"], 
  },
  optimism: {
    issued: ["0xD4dD9e2F021BB459D5A5f6c24C12fE09c5D45553"],
    bridgedFromETH: ["0x4F8a84C442F9675610c680990EdDb2CCDDB8aB6f"], 
  },
  base: {
    issued: ["0xD4dD9e2F021BB459D5A5f6c24C12fE09c5D45553"],
    bridgedFromETH: ["0x20D1c515e38aE9c345836853E2af98455F919637"], 
  },
  xdai: { // gnosis chain
    issued: ["0xD4dD9e2F021BB459D5A5f6c24C12fE09c5D45553"],
    bridgedFromETH: ["0x4cde2b4e7254e6ec5b450d50e3607bade6be3980"], 
  },
  avax: { // avalanche chain
    issued: ["0xD4dD9e2F021BB459D5A5f6c24C12fE09c5D45553"],
  },
  sonic: {
    issued: ["0xD4dD9e2F021BB459D5A5f6c24C12fE09c5D45553"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts, undefined, {
  pegType: "peggedCHF",
});
export default adapter;