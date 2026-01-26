import { addChainExports } from "../helper/getSupply";
import { getTotalSupply } from "../helper/cardano";
import { sumSingleBalance } from "../helper/generalUtil";
import { Balances, ChainBlocks, PeggedIssuanceAdapter } from "../peggedAsset.type";

const assetIDs = {
  cardano: {
    issued: [
      "25c5de5f5b286073c593edfd77b48abc7a48e5a4f3d4cd9d428ff9355059555344",
    ],
  },
};

async function getCardanoSupply() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const supply = await getTotalSupply(assetIDs.cardano.issued[0]);
    sumSingleBalance(balances, "peggedUSD", supply, "wan", true);
    return balances;
  };
}

const chainContracts = {
  ethereum: {
    issued: ["0x6c3ea9036406852006290770BEdFcAbA0e23A0e8"],
  },
  arbitrum: {
    issued: ["0x46850ad61c2b7d64d08c9c754f45254596696984"],
  },
  solana: {
    issued: ["2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo"],
  },
  berachain: {
    bridgedFromETH: ["0x688e72142674041f8f6Af4c808a4045cA1D6aC82"],
  },
  flow: {
    bridgedFromETH: ["0x2aaBea2058b5aC2D339b163C6Ab6f2b6d53aabED"],
    bridgedFromArbitrum: ['0x99aF3EeA856556646C98c8B9b2548Fe815240750'],
  },
  plume_mainnet: {
    bridgedFromETH: ["0xe9e8330a71912F03E54E7D93795acD9a56f070Aa"],
  },
};

const adapter: PeggedIssuanceAdapter = {
  ...addChainExports(chainContracts, undefined, { decimals: 6 }),
  cardano: {
    ethereum: getCardanoSupply(),
  },
};

export default adapter;
