const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import { bridgedSupply } from "../helper/getSupply";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,  ChainContracts,
} from "../peggedAsset.type";

const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0xB58E61C3098d85632Df34EecfB899A1Ed80921cB"],
  },
  polygon: {
    bridgedFromETH: ["0x02567e4b14b25549331fCEe2B56c647A8bAB16FD"], 
  },
  arbitrum: {
    bridgedFromETH: ["0xB33c4255938de7A6ec1200d397B2b2F329397F9B"], 
  },
  optimism: {
    bridgedFromETH: ["0x4F8a84C442F9675610c680990EdDb2CCDDB8aB6f"], 
  },
  base: {
    bridgedFromETH: ["0x20D1c515e38aE9c345836853E2af98455F919637"], 
  },
};

async function chainMinted(chain: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    for (let issued of chainContracts[chain].issued) {
      const totalSupply = (
        await sdk.api.abi.call({
          abi: "erc20:totalSupply",
          target: issued,
          block: _chainBlocks?.[chain],
          chain: chain,
        })
      ).output;
      sumSingleBalance(
        balances,
        "peggedCHF",
        totalSupply / 10 ** decimals,
        "issued",
        false
      );
    }
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: chainMinted("ethereum", 18),
  },
  polygon: {
    ethereum: bridgedSupply(
      "polygon",
      18,
      chainContracts.polygon.bridgedFromETH,
      undefined,
      undefined,
      "peggedCHF"
    )
  },
  arbitrum: {
    ethereum: bridgedSupply(
      "arbitrum",
      18,
      chainContracts.arbitrum.bridgedFromETH,
      undefined,
      undefined,
      "peggedCHF"
    )
  },
  optimism: {
    ethereum: bridgedSupply(
      "optimism",
      18,
      chainContracts.optimism.bridgedFromETH,
      undefined,
      undefined,
      "peggedCHF"
    )
  },
  base: {
    ethereum: bridgedSupply(
      "base",
      18,
      chainContracts.base.bridgedFromETH,
      undefined,
      undefined,
      "peggedCHF"
    )
  },
};

export default adapter;