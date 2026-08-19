// SNR is a fiat-backed Nigerian Naira stablecoin issued natively on BSC,
// Ethereum, and Base. Cross-chain transfers use a burn-and-mint protocol
// (no canonical/locked chain), so each chain's totalSupply is independent
// and circulating supply is the sum across all three.
const ethBaseAddress = "0xfaE7C1AD37b7ad8848f840109332793bC5889563";

const chainContracts = {
  ethereum: {
    issued: [ethBaseAddress],
  },
  bsc: {
    issued: ["0x6B6f93a12705b6eB60490A8b8a9aC15b3B1ce0f2"],
  },
  base: {
    issued: [ethBaseAddress],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts, undefined, { pegType: "peggedNGN" });
export default adapter;
