import axios from "axios";
import { sumSingleBalance } from "../helper/generalUtil";
import { addChainExports } from "../helper/getSupply";
import { Balances, ChainContracts, PeggedIssuanceAdapter } from "../peggedAsset.type";

const NODE_URL = "https://xrplcluster.com";

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

function createPayload(account: string) {
  return {
    method: "gateway_balances",
    params: [{ account, ledger_index: "validated" }],
  };
}

const rippleMinted = async () => {
  const balances: Balances = {};
  const tokenCurrency = "TBL";
  const issuerAddress = "rJNE2NNz83GJYtWVLwMvchDWEon3huWnFn";
  const subscriptionOperatorAddress = "rB56JZWRKvpWNeyqM3QYfZwW4fS9YEyPWM";

  // Fetch issuer obligations
  const { data: issuerData } = await axios.post(NODE_URL, createPayload(issuerAddress));
  const issuerObligations = parseFloat(issuerData.result.obligations[tokenCurrency] ?? "0");

  // Fetch operator balances
  const { data: operatorData } = await axios.post(NODE_URL, createPayload(subscriptionOperatorAddress));
  const operatorAssets = operatorData.result.assets[issuerAddress] || [];

  const heldByOperator = parseFloat(
    operatorAssets.find((asset: any) => asset.currency === tokenCurrency)?.value ?? "0"
  );

  const circulatingSupply = Math.max(0, issuerObligations - heldByOperator);
  sumSingleBalance(balances, "peggedUSD", circulatingSupply, "issued");
  return balances;
};

// Merge everything together using addChainExports, and override ripple with custom minted logic
const adapter: PeggedIssuanceAdapter = {
  ...addChainExports(chainContracts, undefined),
  ripple: {
    minted: rippleMinted,
  },
};

export default adapter;
