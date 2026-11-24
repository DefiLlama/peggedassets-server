// ICON JSON-RPC transport lives in @defillama/sdk (`sdk.chains.icon`, `ICON_RPC` overrides the endpoint)
import { chains } from "@defillama/sdk";
import { sumSingleBalance } from './generalUtil';

const { icon } = chains

const BNUSD = 'cx88fd7df7ddff82f7cc735c871dc519838cb235bb' // bnUSD contract address

// total supply of bnUSD minted natively on the external chain `net` (e.g. `0xa86a.avax`, `injective-1`)
export async function getXSupply(net: string) {
  const supply = await icon.call({ to: BNUSD, method: 'xSupply', params: { net } })

  let balances = {}
  sumSingleBalance(balances, "peggedUSD", icon.fromLoop(supply), "issued", false);
  return balances;
}

// total supply of bnUSD minted on ICON
export async function getICONSupply() {
  const supply = await icon.getTokenTotalSupply({ token: BNUSD })

  let balances = {}
  sumSingleBalance(balances, "peggedUSD", icon.fromLoop(supply), "issued", false);
  return balances;
}
