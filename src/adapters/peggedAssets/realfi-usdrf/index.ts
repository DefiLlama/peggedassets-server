import { PeggedIssuanceAdapter, Balances } from "../peggedAsset.type";
import { sumSingleBalance } from "../helper/generalUtil";
import { chains } from "@defillama/sdk";
import { getTotalSupply, getTokenBalance } from "../helper/cardano";

const { cardano } = chains;

// USDrf, minted on Cardano under the RealFi mint proxy script hash.
const USDRF =
  "7d9e4a0ee1a3f5d5ff8159ea91a83310cf2795ee7a87170c7aea05ae55534472";

// The unstaked yield pot: staking fees, yield forfeited on unstake, and the
// unstaked share of positive yield. It is protocol-owned until governance
// sweeps it, so none of it is owed to a holder yet. This is an enterprise
// address with no stake key, so it is listed directly.
const YIELD_POT =
  "addr1v9xdjv4h22pv2tq7vugvmyuw0uruue6hmwa86wy624ygs7gq22hrg";

// RealFi's operator wallet: a fee and funding wallet used by the rebalancer and
// by operational tooling. USDrf reaching it is protocol working capital, not a
// liability to any holder. Listed by stake account rather than payment address
// because it is a mnemonic-derived wallet and can spend from more than one
// address under the same stake key.
const OPERATOR_ACCOUNTS = [
  "stake1uyc35qw7ghg4ema2hthwu5xs56zsen48ygkyktfp54w38ecy3ytdd",
];

async function minted() {
  const balances = {} as Balances;
  sumSingleBalance(
    balances,
    "peggedUSD",
    await getTotalSupply(USDRF),
    "issued",
    false
  );
  return balances;
}

async function unreleased() {
  const balances = {} as Balances;
  // Scale by the registry decimals rather than a literal, so this stays
  // consistent with getTotalSupply above, which reads them from the same
  // metadata. Hardcoding 1e6 here would silently diverge if they ever changed.
  const { decimals } = await cardano.getAssetSupply({ assetId: USDRF });
  if (decimals === undefined)
    throw new Error(`realfi: no decimals in the metadata of asset ${USDRF}`);
  const operator = await Promise.all(
    OPERATOR_ACCOUNTS.map((stakeAddress) =>
      cardano.getAccountAddresses({ stakeAddress })
    )
  );
  const owners = [YIELD_POT, ...operator.flat()];
  for (const owner of owners) {
    const balance = await getTokenBalance(USDRF, owner);
    sumSingleBalance(balances, "peggedUSD", balance / 10 ** decimals);
  }
  return balances;
}

const adapter: PeggedIssuanceAdapter = {
  cardano: {
    minted,
    unreleased,
  },
};

export default adapter;
