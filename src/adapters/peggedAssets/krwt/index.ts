import {
  addChainExports,
  solanaMintedOrBridged,
} from "../helper/getSupply";
import type { PeggedIssuanceAdapter } from "../peggedAsset.type";

const pegType = "peggedKRW" as const;

const chainContracts = {
  ethereum: {
    issued: ["0xc00db6b41473d065027f5ed6fada20fde75f142e"],
  },
  base: {
    bridgedFromETH: ["0x370923d39f139c64813f173a1bf0b4f9ba36a24f"],
  },
  polygon: {
    bridgedFromETH: ["0x44c3950a6ed303c863a6568ea18c1a01e504ffd2"],
  },
  fraxtal: {
    bridgedFromETH: ["0xbe5b2eb217bb04a7ddd1a451e6a1567dc15e2fd6"],
  },
  morph: {
    bridgedFromETH: ["0xe898e1cffa565aae8bacc364aa7d65d6a2d20f16"],
  },
  codex: {
    bridgedFromETH: ["0xe898e1cffa565aae8bacc364aa7d65d6a2d20f16"],
  },
};

const adapter: PeggedIssuanceAdapter = {
  ...addChainExports(chainContracts, undefined, { pegType }),
  solana: {
    ethereum: solanaMintedOrBridged(
      ["GSuBmsfco2DGNLSxHhgbFH1MaEfzqexDWq3aJs9XufkF"],
      pegType
    ),
  },
};

export default adapter;
