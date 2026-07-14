const axios = require("axios");
const retry = require("async-retry");

import { sumSingleBalance } from "../helper/generalUtil";
import { addChainExports } from "../helper/getSupply";
import {
  Balances,
  ChainContracts,
  PeggedIssuanceAdapter,
} from "../peggedAsset.type";

const NODE_URL = "https://xrplcluster.com";
const STELLAR_HORIZON = "https://horizon.stellar.org";
const pegType = "peggedUSD";

const USDV_ISSUER = "rfffsukWALJB1PXYk7H8xkR6UJUDT8nMJE";
const USDV_CURRENCY = "5553445600000000000000000000000000000000";
const STELLAR_USDV_ISSUER =
  "GBLAJOKBIIT7P32BJQFCSRJVOE2SXHI4D5ZGLFJ4DLMFJXI2NN6R37G5";

const chainContracts: ChainContracts = {
  tron: {
    issued: ["TAPR48oEGf6e8EqWsqSkLQ6wQKLfYimHGd"],
    unreleased: [
      "TTGKRCFPYpwuY4MU7NaVoqz2vWoUYy1gXG",
    ],
  },
  base: {
    issued: ["0xB719f73b4a47Fa22e0fA00cedF5B7FB37f1e6866"],
    unreleased: ["0x3c8d9271cc15a225bd3a1345c1412b76f12a3a4d"],
  },
  polygon: {
    issued: ["0x2b9bBfFCF4ACF9A5A545295bDF84713e477B28Cb"],
    unreleased: ["0xd4bD9ffbba98ffA3E5F6a72b5240A9e315668910"],
  },
  bsc: {
    issued: ["0x96c2402d369C8C0aE1dFd4fA066F79F81A98A4b9"],
    unreleased: ["0x2b5967F7Da644e046e202b62Be4b7192d0d6785b"],
  },
};

async function minted() {
  const balances = {} as Balances;
  const payload = {
    method: "gateway_balances",
    params: [{ account: USDV_ISSUER, ledger_index: "validated" }],
  };

  const res = await retry(async (_bail: any) => axios.post(NODE_URL, payload));
  const supply = parseFloat(res.data.result.obligations[USDV_CURRENCY] ?? "0");

  sumSingleBalance(balances, pegType, supply, "issued", false);
  return balances;
}

async function stellarMinted() {
  const balances = {} as Balances;

  const res = await retry(async (_bail: any) =>
    axios.get(
      `${STELLAR_HORIZON}/assets?asset_code=USDV&asset_issuer=${STELLAR_USDV_ISSUER}`
    )
  );

  const record = res.data._embedded?.records?.[0];
  const supply =
    parseFloat(record?.balances?.authorized ?? "0") +
    parseFloat(record?.balances?.authorized_to_maintain_liabilities ?? "0") +
    parseFloat(record?.claimable_balances_amount ?? "0") +
    parseFloat(record?.liquidity_pools_amount ?? "0") +
    parseFloat(record?.contracts_amount ?? "0");

  sumSingleBalance(balances, pegType, supply, "issued", false);
  return balances;
}

const adapter: PeggedIssuanceAdapter = {
  ...addChainExports(chainContracts, undefined, { pegType }),
  ripple: {
    minted,
  },
  stellar: {
    minted: stellarMinted,
  },
};

export default adapter;
