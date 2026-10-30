import axios from "axios";
import { addChainExports } from "../helper/getSupply";
import { sumSingleBalance } from "../helper/generalUtil";
import type { Balances, PeggedIssuanceAdapter } from "../peggedAsset.type";

const chainContracts = {
  ethereum: {
    issued: ["0xe343167631d89B6Ffc58B88d6b7fB0228795491D"],
  },
  solana: {
    issued: ["2u1tszSeqZ3qBWF3uNGPFc8TzMk2tdiwknnRMWGWjGWH"],
  },
  ink: {
    bridgedFromETH: ["0xe343167631d89B6Ffc58B88d6b7fB0228795491D"],
  },
  xlayer: {
    issued: ["0x4ae46a509f6b1d9056937ba4500cb143933d2dc8"],
  },
  robinhood: {
    issued: ["0x5fc5360d0400a0fd4f2af552add042d716f1d168"],
  },
  arbitrum: {
    issued: ["0x004B506865409877C9fA29bfb1ebA929984B9bbC"],
  },
  mantle: {
    issued: ["0x063C1d1ef6e9099Ce3E8e9AD5C6173d12C49C086"],
  },
};

async function aleoBridged(): Promise<Balances> {
  // USAD is backed 1:1 by USDG locked in an Ethereum vault:
  // https://aleo.org/usad/
  // token_info[true].supply includes both public and private tokens, and is
  // updated by every mint/burn. AMM wrappers must not be counted again.
  const { data } = await axios.get<string>(
    "https://api.explorer.provable.com/v1/mainnet/program/usad_stablecoin.aleo/mapping/token_info/true",
    { timeout: 30000 }
  );
  const supply = typeof data === "string" && data.match(/\bsupply:\s*(\d+)u128\b/);
  if (!supply || !/\bdecimals:\s*6u8\b/.test(data)) {
    throw new Error("Unable to read Aleo USAD supply from token_info");
  }
  const balances = {} as Balances;
  sumSingleBalance(balances, "peggedUSD", Number(supply[1]) / 1e6, "usad_stablecoin.aleo", true);
  return balances;
}

const adapter: PeggedIssuanceAdapter = {
  ...addChainExports(chainContracts, undefined, { decimals: 6 }),
  aleo: {
    ethereum: aleoBridged,
  },
};

export default adapter;
