import { ChainApi } from "@defillama/sdk";
import {
  getSeenContracts,
  installContractRecorder,
  mergeAssetContracts,
  mergeRecordedContracts,
  isSupplyMethod,
  recordContract,
  recordSupplyRead,
  runWithContractRecording,
} from "./contractRecorder";

const scope = (assetId: string, chain = "ethereum", issuanceType = "minted") => ({ assetId, chain, issuanceType });

test("recordContract attributes addresses to the asset and chain in scope", async () => {
  await Promise.all([
    runWithContractRecording(scope("test-a", "ethereum"), async () => {
      await new Promise((resolve) => setTimeout(resolve, 5));
      recordContract("0xaaa");
    }),
    runWithContractRecording(scope("test-b", "solana"), async () => recordContract("mintB")),
  ]);
  expect(getSeenContracts()["test-a"]).toEqual({ ethereum: ["0xaaa"] });
  expect(getSeenContracts()["test-b"]).toEqual({ solana: ["mintB"] });
});

test("recordContract ignores unreleased fetches and calls outside a scope", () => {
  recordContract("0xoutside");
  runWithContractRecording(scope("test-c", "ethereum", "unreleased"), () => recordContract("0xreserve"));
  expect(getSeenContracts()["test-c"]).toBeUndefined();
});

test("ChainApi patch records totalSupply targets only", async () => {
  installContractRecorder();
  const api = new ChainApi({ chain: "nonexistent-chain" });
  await runWithContractRecording(scope("test-d", "nonexistent-chain"), async () => {
    await api.call({ abi: "erc20:totalSupply", target: "0xtoken" }).catch(() => {});
    await api.multiCall({ abi: "erc20:totalSupply", calls: ["0xtoken2"] }).catch(() => {});
    await api.call({ abi: "erc20:balanceOf", target: "0xcollateral", params: ["0xwallet"] }).catch(() => {});
  });
  expect(getSeenContracts()["test-d"]).toEqual({ "nonexistent-chain": ["0xtoken", "0xtoken2"] });
});

test("multicall records each call target, falling back to the default target", async () => {
  installContractRecorder();
  const api = new ChainApi({ chain: "nonexistent-chain" });
  await runWithContractRecording(scope("test-e", "nonexistent-chain"), async () => {
    await api.multiCall({ abi: "erc20:totalSupply", target: "0xdefault", calls: [{ target: "0xB" }, { params: [] }, "0xC"] } as any).catch(() => {});
  });
  expect(getSeenContracts()["test-e"]).toEqual({ "nonexistent-chain": ["0xB", "0xdefault", "0xC"] });
});

test("mergeRecordedContracts prunes stored assets that recorded nothing this run", () => {
  const now = 1_000_000_000;
  const stored = { gone: { ethereum: { "0xold": now - 30 * 86400 } }, kept: { ethereum: { "0xrecent": now - 86400 } }, fresh: {} };
  expect(mergeRecordedContracts(stored, { added: { base: ["0xnew"] } }, now)).toEqual({
    kept: { ethereum: { "0xrecent": now - 86400 } },
    added: { base: { "0xnew": now } },
  });
});

test("mergeAssetContracts refreshes seen addresses and prunes stale ones", () => {
  const now = 1_000_000_000;
  const day = 86400;
  const stored = { ethereum: { "0xold": now - 8 * day, "0xrecent": now - 2 * day }, solana: { stale: now - 30 * day } };
  expect(mergeAssetContracts(stored, { ethereum: ["0xnew", "0xrecent"] }, now)).toEqual({
    ethereum: { "0xrecent": now, "0xnew": now },
  });
});

test("recordSupplyRead records only supply methods", () => {
  expect(isSupplyMethod("0x1::coin::supply")).toBe(true);
  expect(isSupplyMethod("ft_total_supply")).toBe(true);
  expect(isSupplyMethod("ft_balance_of")).toBe(false);
  runWithContractRecording(scope("test-f", "aptos"), () => {
    recordSupplyRead("0x1::coin::supply", "0xcoin");
    recordSupplyRead("ft_balance_of", "0xnot-a-supply");
  });
  expect(getSeenContracts()["test-f"]).toEqual({ aptos: ["0xcoin"] });
});
