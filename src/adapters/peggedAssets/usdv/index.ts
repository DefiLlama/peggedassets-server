import { PeggedIssuanceAdapter } from "../peggedAsset.type";

const XRPL_RPC = "https://s1.ripple.com:51234/";

const USDV_ISSUER = "rfffsukWALJB1PXYk7H8xkR6UJUDT8nMJE";
const USDV_CURRENCY = "5553445600000000000000000000000000000000";

type XrplGatewayBalancesResult = {
  obligations?: Record<string, string>;
  status?: string;
  error?: string;
  error_message?: string;
};

async function xrplRpc<T>(method: string, params: Record<string, unknown>): Promise<T> {
  const response = await fetch(XRPL_RPC, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      method,
      params: [params],
    }),
  });

  if (!response.ok) {
    throw new Error(`XRPL RPC HTTP ${response.status}`);
  }

  const json = await response.json();
  const result = json.result as XrplGatewayBalancesResult | undefined;

  if (!result || result.status === "error") {
    throw new Error(result?.error_message || result?.error || "XRPL RPC failed");
  }

  return result as T;
}

async function minted() {
  const result = await xrplRpc<XrplGatewayBalancesResult>("gateway_balances", {
    account: USDV_ISSUER,
    ledger_index: "validated",
  });

  const obligations = result.obligations || {};

  return {
peggedUSD: Number(obligations[USDV_CURRENCY] || 0),  };
}

const adapter: PeggedIssuanceAdapter = {
  ripple: {
    minted,
    unreleased: async () => ({}),
  },
};

export default adapter;
