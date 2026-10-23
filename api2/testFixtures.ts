import { secondsInDay } from "../src/utils/date";

export const d3 = 1790985600;
export const d4 = 1791072000;
export const d5 = 1791158400;
export const d6 = 1791244800;
const usdnStaleSK = 1781654400;
export const usdnSupply = 408891137.096548;

export function balanceRecord(SK: number, tokens: number, shares: Record<string, number>) {
  const chains = Object.fromEntries(
    Object.entries(shares).map(([chain, share]) => [chain, { circulating: { peggedUSD: tokens * share } }])
  );
  return { SK, ...chains, totalCirculating: { circulating: { peggedUSD: tokens }, unreleased: { peggedUSD: 0 } } };
}

function assetData(tokens: number, shares: Record<string, number>, lastSK = d6 + 3600) {
  return {
    balances: [balanceRecord(lastSK - 2 * secondsInDay, tokens, shares), balanceRecord(lastSK - secondsInDay, tokens, shares)],
    lastBalance: balanceRecord(lastSK, tokens, shares),
  };
}

export function priceRecords() {
  return [
    { PK: "dailyPeggedPrices", SK: d4, prices: { neutrino: 0.015770918154435674, yu: 0.3837216356397152 } },
    { PK: "dailyPeggedPrices", SK: d5, prices: {} },
  ];
}

export function peggedAssetsData() {
  return {
    "12": assetData(usdnSupply, { waves: 0.984, ethereum: 0.016 }, usdnStaleSK),
    "268": assetData(22720815.008181628, { ethereum: 1 }),
    "340": assetData(487400000, { ethereum: 1 }),
  };
}
