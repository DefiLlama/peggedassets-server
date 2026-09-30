import { sumSingleBalance } from "../helper/generalUtil";
import { addChainExports, rippleGetTotalSupply } from "../helper/getSupply";
import { getTotalSupply as stellarGetTotalSupply } from "../helper/stellar";
import {
  Balances,
  ChainContracts,
  PeggedIssuanceAdapter,
} from "../peggedAsset.type";

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

// XRPL issuer obligations for USDV, already in whole units
async function minted() {
  const balances = {} as Balances;
  const supply = await rippleGetTotalSupply(`${USDV_CURRENCY}.${USDV_ISSUER}`);
  sumSingleBalance(balances, pegType, supply, "issued", false);
  return balances;
}

// Horizon asset record: authorized + authorized-to-maintain-liabilities + claimable balances + liquidity pools + contracts
async function stellarMinted() {
  const balances = {} as Balances;
  const supply = await stellarGetTotalSupply(`USDV:${STELLAR_USDV_ISSUER}`);
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
