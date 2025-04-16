import { sumSingleBalance } from "../helper/generalUtil";
import { addChainExports } from "../helper/getSupply";
import { Balances, ChainContracts, ChainBlocks, PeggedIssuanceAdapter } from "../peggedAsset.type";
const axios = require("axios");
const retry = require("async-retry");

const NODE_URL = "https://xrplcluster.com";

export async function rippleMinted(
  _timestamp: number,
  _ethBlock: number,
  _chainBlocks: ChainBlocks
): Promise<Balances> {
  const balances = {} as Balances;

  const issuerAddress = "rJNE2NNz83GJYtWVLwMvchDWEon3huWnFn";
  const tokenCurrency = "TBL";
  const subscriptionOperatorAddress = "rHzvHZ1EYAJQCepz9SwfAwZux6XZQ5sXQx"; // replace with actual operator if different

  const payload = {
    method: "gateway_balances",
    params: [
      {
        account: issuerAddress,
        ledger_index: "validated",
      },
    ],
  };

  const res = await retry(async (_bail: any) => axios.post(NODE_URL, payload));
  const result = res.data?.result;

  const obligations = result?.obligations;
  const otherBalances = result?.balances?.[subscriptionOperatorAddress];

  if (!obligations || !obligations[tokenCurrency]) {
    console.error("Ripple obligations:", obligations);
    throw new Error(`Token ${tokenCurrency} not found in obligations`);
  }

  const totalIssued = parseFloat(obligations[tokenCurrency]);

  if (!otherBalances) {
    console.error("Ripple balances:", result?.balances);
    throw new Error(`No balances found for subscription operator: ${subscriptionOperatorAddress}`);
  }

  // Find the TBL balance held by the subscription operator
  const operatorTBL = otherBalances.find((b: [string, string]) => b[1] === tokenCurrency);

  if (!operatorTBL) {
    throw new Error(`Token ${tokenCurrency} not held by subscription operator`);
  }

  const operatorHeld = parseFloat(operatorTBL[0]);

  const circulatingSupply = totalIssued - operatorHeld;

  if (isNaN(circulatingSupply)) {
    throw new Error(`Invalid circulating supply calculation`);
  }

  sumSingleBalance(balances, "peggedUSD", circulatingSupply, "issued");

  return balances;
}

// Contracts on different chains
const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0xdd50c053c096cb04a3e3362e2b622529ec5f2e8a"],
  },
  arbitrum: {
    issued: ["0xf84d28a8d28292842dd73d1c5f99476a80b6666a"],
  },
  solana: {
    issued: ["4MmJVdwYN8LwvbGeCowYjSx7KoEi6BJWg8XXnW4fDDp6"],
  },
};

// Merge everything together using addChainExports, and override ripple with custom minted logic
const adapter: PeggedIssuanceAdapter = {
  ...addChainExports(chainContracts, undefined),
  ripple: {
    minted: rippleMinted,
  },
};

export default adapter;
