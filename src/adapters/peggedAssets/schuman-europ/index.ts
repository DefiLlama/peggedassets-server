import { sumSingleBalance } from "../helper/generalUtil";
import { addChainExports } from "../helper/getSupply";
import {
  Balances,
  ChainBlocks,
  ChainContracts,
  PeggedIssuanceAdapter,
} from "../peggedAsset.type";

const axios = require("axios");
const retry = require("async-retry");

const XRPL_NODE_URL = "https://xrplcluster.com";
const XRPL_ISSUER = "rMkEuRii9w9uBMQDnWV5AA43gvYZR9JxVK";
const XRPL_CURRENCY =
  "4555524F50000000000000000000000000000000";

async function rippleMinted(
  _timestamp: number,
  _ethBlock: number,
  _chainBlocks: ChainBlocks
): Promise<Balances> {
  const balances = {} as Balances;

  const payload = {
    method: "gateway_balances",
    params: [
      {
        account: XRPL_ISSUER,
        ledger_index: "validated",
      },
    ],
  };

  const res = await retry(async () => {
    const response = await axios.post(XRPL_NODE_URL, payload);
    if (response.data?.result?.error) {
      throw new Error(
        `XRPL API error: ${response.data.result.error_message || response.data.result.error}`
      );
    }
    return response;
  });

  const supplyStr =
    res.data.result?.obligations?.[XRPL_CURRENCY] || "0";
  const supply = parseFloat(supplyStr);
  sumSingleBalance(
    balances,
    "peggedEUR",
    supply,
    "issued"
  );

  return balances;
}

const chainContracts: ChainContracts = {
  ethereum: {
    issued: [
      "0x888883b5F5D21fb10Dfeb70e8f9722B9FB0E5E51",
    ],
  },
  polygon: {
    issued: [
      "0x888883b5F5D21fb10Dfeb70e8f9722B9FB0E5E51",
    ],
  },
  avax: {
    issued: [
      "0x8835a2f66a7aaccb297cb985831a616b75e2e16c",
    ],
  },
  plasma: {
    issued: [
      "0x98658Bd74EF231158Cadc21d8AbA733a4E947e6a",
    ],
  },
  solana: {
    issued: [
      "euro5sNHrZC2wu2RoLvy6xxoVMc3Qnd1vjxoWf4MftA",
    ],
  },
};

const adapter: PeggedIssuanceAdapter = {
  ...addChainExports(
    chainContracts,
    undefined,
    { pegType: "peggedEUR" }
  ),
  ripple: {
    minted: rippleMinted,
  },
};

export default adapter;
