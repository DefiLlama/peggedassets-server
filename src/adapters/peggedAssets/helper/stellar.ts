import { chains } from "@defillama/sdk";

const { stellar } = chains;

// assetID is "CODE:ISSUER" (or "CODE-ISSUER"); returns the circulating supply in whole units (7 decimals):
// authorized trustlines + accounts authorized to maintain liabilities + Soroban contracts + liquidity pools + claimable balances
export async function getTotalSupply(assetID: string): Promise<number> {
  const { supply, authorizedToMaintainLiabilities, decimals } = await stellar.getAssetSupply({ asset: assetID });
  return Number(BigInt(supply) + BigInt(authorizedToMaintainLiabilities)) / 10 ** decimals;
}

// resolve a Soroban contract: a Stellar Asset Contract maps back to its classic asset, any other token
// exposes total_supply() / decimals()
export async function getTotalSupplyByContract(contract: string): Promise<number> {
  const classic = await stellar.getSacClassicAsset({ contractId: contract });
  if (classic) return getTotalSupply(stellar.assetToString(classic));
  const supply = await stellar.getSorobanTokenTotalSupply({ contractId: contract });
  if (supply === undefined) throw new Error(`stellar: contract ${contract} exposes no total_supply()`);
  const decimals = await stellar.getSorobanTokenDecimals({ contractId: contract });
  return Number(supply) / 10 ** decimals;
}
