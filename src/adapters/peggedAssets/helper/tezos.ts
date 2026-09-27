import { chains } from "@defillama/sdk";
const BigNumber = require("bignumber.js");

const { tezos } = chains;

// `TEZOS_TZKT` env overrides the TzKT url. `decimals` overrides the token metadata; 0 is a valid value.
export async function getTotalSupply(contract: string, decimals?: number) {
  const [token] = await tezos.tzkt({ path: '/v1/tokens', params: { contract, limit: 1 } });
  if (!token) throw new Error(`tezos: no token found for contract ${contract}`);
  const d = decimals ?? tezos.parseDecimals(token.metadata?.decimals);
  if (d === undefined) throw new Error(`tezos: no decimals for token ${contract}`);
  return new BigNumber(token.totalSupply).div(10 ** d).toNumber();
}

// tokenID is the TzKT internal token id
export async function getBalance(
  address: string,
  tokenID: string,
  decimals?: number
) {
  const [row] = await tezos.tzkt({ path: '/v1/tokens/balances', params: { account: address, 'token.id': tokenID, limit: 1 } });
  const d = decimals ?? tezos.parseDecimals(row?.token?.metadata?.decimals);
  if (d === undefined) throw new Error(`tezos: no decimals for token ${tokenID}`);
  return new BigNumber(row?.balance ?? 0).div(10 ** d).toNumber();
}
