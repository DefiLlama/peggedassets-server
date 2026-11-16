const sdk = require("@defillama/sdk");
import axios from "axios";
import { sumSingleBalance } from "../helper/generalUtil";
import {
  bridgedSupply,
  supplyInEthereumBridge,
  solanaMintedOrBridged,
  osmosisSupply,
} from "../helper/getSupply";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,  ChainContracts,
} from "../peggedAsset.type";
import { call as nearCall } from "../helper/near";


// bsc, avax, arbitrum, aurora, boba, fantom, optimism and polygon are Frax's own canonical FRAX, tagged "frax" in bridgeData.ts
const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0x853d955acef822db058eb8505911ed77f175b99e"],
  },
  bsc: {
    bridgedFromETH: ["0x90c97f71e18723b0cf0dfa30ee176ab653e89f40"],
  },
  avax: {
    bridgedFromETH: ["0xD24C2Ad096400B6FBcd2ad8B24E7acBc21A1da64"],
  },
  arbitrum: {
    bridgedFromETH: ["0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F"],
  },
  aurora: {
    bridgedFromETH: ["0xE4B9e004389d91e4134a28F19BD833cBA1d994B6"],
  },
  boba: {
    bridgedFromETH: ["0x7562F525106F5d54E891e005867Bf489B5988CD9"],
  },
  fantom: {
    bridgedFromETH: ["0xdc301622e621166BD8E82f2cA0A26c13Ad0BE355"],
  },
  era: {
    bridgedFromETH: ["0xb4C1544cb4163f4C2ECa1aE9Ce999F63892d912A"],
  },
  evmos: {
    bridgedFromETH: ["0xE03494D0033687543a80c9B1ca7D6237F2EA8BD8"],
  },
  harmony: {
    bridgedFromETH: ["0xFa7191D292d5633f702B0bd7E3E3BcCC0e633200"],
  },
  moonbeam: {
    bridgedFromETH: ["0x322E86852e492a7Ee17f28a78c663da38FB33bfb"],
  },
  moonriver: {
    bridgedFromETH: ["0x1A93B23281CC1CDE4C4741353F3064709A16197d"],
  },
  optimism: {
    bridgedFromETH: ["0x2E3D870790dC77A83DD1d18184Acc7439A53f475"],
  },
  polygon: {
    bridgedFromETH: ["0x45c32fA6DF82ead1e2EF74d17b76547EDdFaFF89"],
  },
  solana: {
    bridgedFromETH: ["FR87nWEUxVgerFGhZM8Y4AggKGLnaXswr1Pd8wZ4kZcp"],
  },
  zksync: {
    bridgeOnETH: ["0xaBEA9132b05A70803a4E85094fD0e1800777fBEF"],
  },
  milkomeda: {
    bridgedFromETH: ["0x362233F1eF554Ca08555Ca191b4887c2C3132834"], // wormhole: not canonical FRAX
  },
  everscale: {
    bridgeOnETH: ["0xF2403a61C7A97a1a1b94A225173F6dD03614B907"], // octus: not canonical FRAX
  },
  dogechain: {
    bridgedFromETH: ["0xf27Ee99622C3C9b264583dACB2cCE056e194494f"], // multichain
  },
  osmosis: {
    bridgedFromETH: [
      "ibc/0E43EDE2E2A3AFA36D0CD38BDDC0B49FECA64FA426A82E102F304E430ECF46EE",
    ], // axelar
  },
  // no fraxtal entry: Fraxtal's 0xfc00...0001 is frxUSD, tracked by Frax USD (id 235)
};

/*
Frax works differently from other stables, bridged amounts don't matter.
See: https://docs.frax.finance/cross-chain/bridge
*/

// Legacy FRAX-family tokens on the Frax balance sheet, matched by address (lowercase).
// The sheet also carries frxUSD, sfrxUSD, FXB bonds, FPI and borrowed USDT, which are not FRAX supply;
// frxUSD is counted by Frax USD (id 235). Match by address, not symbol: the sheet labels Fraxtal's
// frxUSD (0xfc00...0001) as "FRAX".
const FRAX_FAMILY = new Set(
  [
    "0x853d955aCEf822Db058eb8505911ED77F175b99e", // FRAX, ethereum
    "0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F", // FRAX, arbitrum
    "0xE4B9e004389d91e4134a28F19BD833cBA1d994B6", // FRAX, aurora
    "0xD24C2Ad096400B6FBcd2ad8B24E7acBc21A1da64", // FRAX, avalanche
    "0x7562F525106F5d54E891e005867Bf489B5988CD9", // FRAX, boba
    "0x90C97F71E18723b0Cf0dfa30ee176Ab653E89F40", // FRAX, bsc
    "0xdc301622e621166BD8E82f2cA0A26c13Ad0BE355", // FRAX, fantom
    "0x2E3D870790dC77A83DD1d18184Acc7439A53f475", // FRAX, optimism
    "0x45c32fA6DF82ead1e2EF74d17b76547EDdFaFF89", // FRAX, polygon
    "0xb4C1544cb4163f4C2ECa1aE9Ce999F63892d912A", // FRAX, zksync era
    "0xFf8544feD5379D9ffa8D47a74cE6b91e632AC44D", // FRAX, polygon zkevm
    "0xff000000000000000000000000000000000001Fd", // LFRAX (legacy FRAX), fraxtal
    "0xA663B02CF0a4b149d2aD41910CB81e23e1c41c32", // sFRAX (staked FRAX), ethereum: protocol-owned only
  ].map((a) => a.toLowerCase())
);

type BalanceSheetLine = {
  category: string;
  tokenAddress?: string;
  tokenSymbol?: string;
  totalValueUsd: number;
  description?: string;
};

const isFraxFamily = (line: BalanceSheetLine) =>
  FRAX_FAMILY.has((line.tokenAddress ?? "").toLowerCase());

// FRAX the protocol provides as AMM liquidity (Curve/Convex, UniV3, Fraxswap LPs) can be bought by
// anyone, so it stays circulating, as crvUSD counts its PegKeeper liquidity. Matched on the sheet's
// descriptions, e.g. "FRAX staked in Convex FRAX/USDe", "Quantity of FRAX in UniV3 LP #548162 frxETH/FRAX".
const isLiquidityPosition = (line: BalanceSheetLine) =>
  /\bLP\b|staked in Convex/i.test(line.description ?? "");

// circulating legacy FRAX = FRAX-family liabilities (supply on every chain, net of FRAX held in the
// Fraxtal L1 bridge and in FXB bond contracts) minus FRAX-family tokens the protocol owns off-market
// (held directly, sFRAX posted as collateral, FraxFerry inventory, idle Fraxlend FRAX). Its LP
// positions are not subtracted (see isLiquidityPosition). Values are USD, converted back to FRAX units.
async function fraxMinted() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    try {
      const response = await axios.get(
        "https://api.frax.finance/v2/frax/balance-sheet/latest"
      );
      const data = response.data;
      const liabilities: BalanceSheetLine[] = data.liabilities;
      const assets: BalanceSheetLine[] = data.assets;
      const fraxPrice: number = data.tokenPriceUsd?.FRAX;
      if (!Array.isArray(liabilities) || !Array.isArray(assets) || !(fraxPrice > 0))
        throw new Error("unexpected Frax balance-sheet shape");

      // a FRAX-labelled supply line on a token we don't know: likely a new deployment to add above
      for (const l of liabilities)
        if (l.category === "liability:remaining_frax_supply" && /^L?FRAX$/.test(l.tokenSymbol ?? "") &&
          !isFraxFamily(l) && Math.abs(l.totalValueUsd) > 1)
          console.warn(`[frax] unrecognised FRAX supply line, not counted: ${l.tokenAddress} ${l.description}`);

      const fraxLiabilitiesUsd = liabilities
        .filter(isFraxFamily)
        .reduce((sum, l) => sum + l.totalValueUsd, 0);
      const fraxOwnedUsd = assets
        .filter((a) => a.category.startsWith("asset:owned:") && isFraxFamily(a) && !isLiquidityPosition(a))
        .reduce((sum, a) => sum + a.totalValueUsd, 0);

      const supply = (fraxLiabilitiesUsd - fraxOwnedUsd) / fraxPrice;
      sumSingleBalance(balances, "peggedUSD", supply, "issued", false);
      return balances;
    } catch (error) {
      console.error("Error fetching supply data:", error);
    }
    return balances;
  };
}

async function nearBridged(address: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const supply = await nearCall(address, "ft_total_supply");
    sumSingleBalance(
      balances,
      "peggedUSD",
      supply / 10 ** decimals,
      address,
      true
    );
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: fraxMinted(),
  },
  bsc: {
    ethereum: bridgedSupply("bsc", 18, chainContracts.bsc.bridgedFromETH),
  },
  avax: {
    ethereum: bridgedSupply("avax", 18, chainContracts.avax.bridgedFromETH),
  },
  arbitrum: {
    ethereum: bridgedSupply(
      "arbitrum",
      18,
      chainContracts.arbitrum.bridgedFromETH
    ),
  },
  aurora: {
    ethereum: bridgedSupply("aurora", 18, chainContracts.aurora.bridgedFromETH),
  },
  boba: {
    ethereum: bridgedSupply("boba", 18, chainContracts.boba.bridgedFromETH),
  },
  fantom: {
    ethereum: bridgedSupply("fantom", 18, chainContracts.fantom.bridgedFromETH),
  },
  evmos: {
    ethereum: bridgedSupply("evmos", 18, chainContracts.evmos.bridgedFromETH),
  },
  near: {
    ethereum: nearBridged(
      "853d955acef822db058eb8505911ed77f175b99e.factory.bridge.near",
      18
    ),
  },
  harmony: {
    ethereum: bridgedSupply(
      "harmony",
      18,
      chainContracts.harmony.bridgedFromETH
    ),
  },
  moonbeam: {
    ethereum: bridgedSupply(
      "moonbeam",
      18,
      chainContracts.moonbeam.bridgedFromETH
    ),
  },
  moonriver: {
    ethereum: bridgedSupply(
      "moonriver",
      18,
      chainContracts.moonriver.bridgedFromETH
    ),
  },
  optimism: {
    ethereum: bridgedSupply(
      "optimism",
      18,
      chainContracts.optimism.bridgedFromETH
    ),
  },
  polygon: {
    ethereum: bridgedSupply(
      "polygon",
      18,
      chainContracts.polygon.bridgedFromETH
    ),
  },
  solana: {
    ethereum: solanaMintedOrBridged(chainContracts.solana.bridgedFromETH),
  },
  zksync: {
    ethereum: supplyInEthereumBridge(
      chainContracts.ethereum.issued[0],
      chainContracts.zksync.bridgeOnETH[0],
      18
    ),
  },
  milkomeda: {
    ethereum: bridgedSupply(
      "milkomeda",
      18,
      chainContracts.milkomeda.bridgedFromETH
    ),
  },
  everscale: {
    ethereum: supplyInEthereumBridge(
      chainContracts.ethereum.issued[0],
      chainContracts.everscale.bridgeOnETH[0],
      18
    ),
  },
  dogechain: {
    ethereum: bridgedSupply(
      "dogechain",
      18,
      chainContracts.dogechain.bridgedFromETH
    ),
  },
  osmosis: {
    ethereum: osmosisSupply(
      chainContracts.osmosis.bridgedFromETH,
      18,
      "Axelar"
    ),
  },
  era: {
    ethereum: bridgedSupply(
      "era",
      18,
      chainContracts.era.bridgedFromETH
    ),
  },
};

export default adapter;
