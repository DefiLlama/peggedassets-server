import { ChainApi } from "@defillama/sdk";
import { addChainExports, getApi } from "../helper/getSupply";
import { sumSingleBalance } from "../helper/generalUtil";
import { Balances, PeggedIssuanceAdapter } from "../peggedAsset.type";

const USDS = "0xdC035D45d973E3EC169d2276DDab16f1e407384F";
const SUSDS = "0xa3931d71877C0E7a3148CB7Eb4463524FEc27fbD";
const XDAI_BRIDGE = "0x4aa42145Aa6Ebf72e164C9bBC74fbD3788045016"; // xDAI bridge on Ethereum
// GIP-118: the xDAI bridge swapped its DAI/sDAI collateral for USDS/sUSDS on 2025-11-07 (the DAI
// adapter counts the DAI/sDAI era). It held no USDS or sUSDS before, so earlier days skip the calls.
const XDAI_USDS_FROM = 1762473600; // 2025-11-07 00:00 UTC

const chainContracts = {
  ethereum: {
    issued: [USDS],
  },
  base: {
    issued: ["0x820c137fa70c8691f0e44dc420a5e53c168921dc"],
  },
  arbitrum: {
    bridgedFromETH: ["0x6491c05A82219b8D1479057361ff1654749b876b"],
  },
  optimism: {
    issued: ["0x4F13a96EC5C4Cf34e442b46Bbd98a0791F20edC3"],
  },
  unichain: {
    issued: ["0x7E10036Acc4B56d4dFCa3b77810356CE52313F9C"],
  },
  solana: {
    bridgedFromETH: ["USDSwr9ApdHk5bvJKMjzff41FfuX8bSxdKcR81vTwcA"],
  },
};

// xDAI on Gnosis is minted against the USDS and sUSDS (as assets) the bridge holds on Ethereum.
function xdaiBridgeCollateral() {
  return async (_api: ChainApi) => {
    if (_api.timestamp && _api.timestamp < XDAI_USDS_FROM) return {};
    const api = await getApi("ethereum", _api);
    await api.getBlock(); // pin every call below to one block
    const [usds, shares] = await Promise.all([
      api.call({ abi: "erc20:balanceOf", target: USDS, params: [XDAI_BRIDGE] }),
      api.call({ abi: "erc20:balanceOf", target: SUSDS, params: [XDAI_BRIDGE] }),
    ]);
    const assets = await api.call({
      abi: "function convertToAssets(uint256 shares) view returns (uint256)",
      target: SUSDS,
      params: [shares],
    });
    const balances = {} as Balances;
    const total = BigInt(usds) + BigInt(assets);
    sumSingleBalance(balances, "peggedUSD", Number(total) / 1e18, "xdaibridge", false, "ethereum");
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = addChainExports(chainContracts, undefined, { pegType: "peggedUSD" });
adapter.xdai = { ethereum: xdaiBridgeCollateral() };

export default adapter;
