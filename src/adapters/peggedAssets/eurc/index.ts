const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import { bridgedSupply, solanaMintedOrBridged, supplyInEthereumBridge } from "../helper/getSupply";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,  ChainContracts,
} from "../peggedAsset.type";
const axios = require("axios");
const retry = require("async-retry");

import { getTokenBalance as solanaGetTokenBalance } from "../helper/solana";
import { getTotalSupply } from "../helper/cardano";

const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0x1abaea1f7c830bd89acc67ec4af516284b1bc33c"],
    unreleased: ["0x55fe002aeff02f77364de339a1292923a15844b8"],
  },
  polygon: {
    bridgedFromETH: ["0x8a037dbcA8134FFc72C362e394e35E0Cad618F85"],
  },
  avax: {
    issued: ["0xc891eb4cbdeff6e073e859e987815ed1505c2acd"],
  },
  base: {
    issued: ["0x60a3e35cc302bfa44cb288bc5a4f316fdb1adb42"],
  },
  solana: {
    issued: ["HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr"],
    unreleased: ["7VHUFJHWu2CuExkJcJrzhQPJ2oygupTWkL2A2For4BmE"], 
  },
  sonic: {
    bridgedFromETH: ["0xe715cbA7B5cCb33790ceBFF1436809d36cb17E57"],
  },
  cardano: {
    bridgedFromETH: ["25c5de5f5b286073c593edfd77b48abc7a48e5a4f3d4cd9d428ff93545555243"],
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
        "peggedEUR",
        totalSupply / 10 ** decimals,
        "issued",
        false
      );
    }
    return balances;
  };
}

async function chainUnreleased(chain: string, decimals: number, owner: string) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    for (let issued of chainContracts[chain].issued) {
      const reserve = (
        await sdk.api.erc20.balanceOf({
          target: issued,
          owner: owner,
          block: _chainBlocks?.[chain],
          chain: chain,
        })
      ).output;
      sumSingleBalance(balances, "peggedEUR", reserve / 10 ** decimals);
    }
    return balances;
  };
}

async function solanaUnreleased() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const unreleased = await solanaGetTokenBalance(
      chainContracts["solana"].issued[0],
      chainContracts["solana"].unreleased[0]
    );
    sumSingleBalance(balances, "peggedEUR", unreleased);
    return balances;
  };
}

async function circleAPIChainMinted(chain: string) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const issuance = await retry(
      async (_bail: any) =>
        await axios.get("https://api.circle.com/v1/stablecoins")
    );
    const eurcData = issuance.data.data.filter(
      (obj: any) => obj.symbol === "EUROC"
    );
    const filteredChainsData = await eurcData[0].chains.filter(
      (obj: any) => obj.chain === chain
    );
    const supply = parseInt(filteredChainsData[0].amount);
    sumSingleBalance(balances, "peggedEUR", supply, "issued", false);
    return balances;
  };
}

async function getCardanoSupply() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const supply = await getTotalSupply(chainContracts.cardano.bridgedFromETH[0]);
    sumSingleBalance(balances, "peggedEUR", supply, "issued", false);
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: chainMinted("ethereum", 6),
    unreleased: chainUnreleased(
      "ethereum",
      6,
      chainContracts.ethereum.unreleased[0]
    ),
  },
  polygon: {
    ethereum: bridgedSupply(
      "polygon",
      6,
      chainContracts.polygon.bridgedFromETH,
      "polygon",
      "Ethereum",
      "peggedEUR"
    ),
  },
  avax: {
    minted: chainMinted("avax", 6),
  },
  stellar: {
    minted: circleAPIChainMinted("XLM"),
  },
  base: {
    minted: chainMinted("base", 6),
  },
  solana: {
    minted: solanaMintedOrBridged(chainContracts.solana.issued, "peggedEUR"),
    unreleased: solanaUnreleased(),
  },
  icp: {
    ethereum: supplyInEthereumBridge(
      '0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c', 
      '0xb25eA1D493B49a1DeD42aC5B1208cC618f9A9B80', 
      6, 
      "peggedEUR"
    ),
  },
  sonic: {
    ethereum: bridgedSupply(
      "sonic",
      6,
      chainContracts.sonic.bridgedFromETH,
      "sonic",
      "Ethereum",
      "peggedEUR"
    ),
  },
  cardano: {
    ethereum: getCardanoSupply(),
  },
};

export default adapter