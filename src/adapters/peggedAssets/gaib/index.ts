// DefiLlama Stablecoin (Pegged Asset) Adapter for AID
// Repo: DefiLlama/peggedassets-server
// Path: src/adapters/peggedAssets/gaib-aid/index.ts
//
// Lists AID on the DefiLlama Stablecoins dashboard.
// AID is backed 1:1 by US Treasuries + stablecoins (USDC, USDT).
// Minted on Ethereum, bridged cross-chain via LayerZero OFT.
//
// VERIFY: Confirm AID address is identical on all chains.
// AIDa Alpha used the same address cross-chain (CREATE2 pattern).

import { addChainExports } from "../helper/getSupply";

const chainContracts = {
  ethereum: {
    issued: ["0x18F52B3fb465118731d9e0d276d4Eb3599D57596"],
  },
  arbitrum: {
    bridgedFromETH: ["0x18F52B3fb465118731d9e0d276d4Eb3599D57596"],
  },
  base: {
    bridgedFromETH: ["0x18F52B3fb465118731d9e0d276d4Eb3599D57596"],
  },
  bsc: {
    bridgedFromETH: ["0x18F52B3fb465118731d9e0d276d4Eb3599D57596"],
  },
};

const adapter = addChainExports(chainContracts);

export default adapter;

// ============================================================
// METADATA TO SUBMIT VIA DEFILLAMA DISCORD (after PR merged):
//
// Name: AI Dollar
// Symbol: AID
// Peg Type: peggedUSD
// Peg Mechanism: fiat-backed (US Treasuries + stablecoins)
// Price Source: defillama (or coingecko if listed)
// gecko_id: (submit after CoinGecko listing)
// Description: AID is a synthetic dollar backed 1:1 by US Treasuries
//   and stablecoins, the base settlement asset for GAIB's AI
//   infrastructure economic layer.
// Website: https://aid.gaib.ai
// Twitter: https://twitter.com/gaaborhq
// ============================================================
