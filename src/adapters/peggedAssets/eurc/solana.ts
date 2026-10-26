import axios from "axios";
import { chains } from "@defillama/sdk";
import { Balances } from "../peggedAsset.type";

// Circle identifies these as pre-mint SPL token accounts, not owner wallets:
// https://www.circle.com/blog/circle-gateway-new-pre-mint-address-for-eurc-on-solana
const PREMINT_ACCOUNTS_URL =
  "https://raw.githubusercontent.com/circlefin/centre-ecosystem/master/eurc/solana/minters.json";

export async function getSolanaUnreleased(mint: string): Promise<Balances> {
  const { data } = await axios.get(PREMINT_ACCOUNTS_URL, { timeout: 30_000 });
  if (!Array.isArray(data?.mainnet) || !data.mainnet.length ||
      !data.mainnet.every((account: unknown) => chains.svm.isValidPublicKey(account))) {
    throw new Error("Invalid Circle EURC Solana pre-mint registry");
  }

  const tokenAccounts = [...new Set<string>(data.mainnet)];
  const balances = await chains.svm.getTokenAccountBalances({
    tokenAccounts,
    individual: true,
  });
  if (balances.length !== tokenAccounts.length) {
    throw new Error("Incomplete Circle EURC Solana pre-mint balances");
  }

  let unreleased = BigInt(0);
  for (const balance of balances) {
    if (balance.mint !== mint || !/^\d+$/.test(balance.amount)) {
      throw new Error("Invalid Circle EURC Solana pre-mint token account");
    }
    unreleased += BigInt(balance.amount);
  }

  return { peggedEUR: Number(unreleased) / 1e6 };
}
