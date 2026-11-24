import axios from "axios";
import { chains } from "@defillama/sdk";

// Circle lists its Solana pre-mint SPL token accounts (not owner wallets) per token in centre-ecosystem, e.g.
// https://www.circle.com/blog/circle-gateway-new-pre-mint-address-for-eurc-on-solana
const premintAccountsUrl = (token: "eurc" | "usdc") =>
  `https://raw.githubusercontent.com/circlefin/centre-ecosystem/master/${token}/solana/minters.json`;

export async function getCircleSolanaPremint(token: "eurc" | "usdc", mint: string): Promise<number> {
  const label = token.toUpperCase();
  const { data } = await axios.get(premintAccountsUrl(token), { timeout: 30_000 });
  if (!Array.isArray(data?.mainnet) || !data.mainnet.length ||
      !data.mainnet.every((account: unknown) => chains.svm.isValidPublicKey(account))) {
    throw new Error(`Invalid Circle ${label} Solana pre-mint registry`);
  }

  const tokenAccounts = [...new Set<string>(data.mainnet)];
  const balances = await chains.svm.getTokenAccountBalances({
    tokenAccounts,
    individual: true,
  });
  if (balances.length !== tokenAccounts.length) {
    throw new Error(`Incomplete Circle ${label} Solana pre-mint balances`);
  }

  let unreleased = BigInt(0);
  for (const balance of balances) {
    if (balance.mint !== mint || !/^\d+$/.test(balance.amount)) {
      throw new Error(`Invalid Circle ${label} Solana pre-mint token account`);
    }
    unreleased += BigInt(balance.amount);
  }

  return Number(unreleased) / 1e6;
}
