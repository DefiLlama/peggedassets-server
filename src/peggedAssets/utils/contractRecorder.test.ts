import { ChainApi } from "@defillama/sdk";
import {
  getSeenContracts,
  installContractRecorder,
  mergeAssetContracts,
  recordContract,
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

test("mergeAssetContracts refreshes seen addresses and prunes stale ones", () => {
  const now = 1_000_000_000;
  const day = 86400;
  const stored = { ethereum: { "0xold": now - 8 * day, "0xrecent": now - 2 * day }, solana: { stale: now - 30 * day } };
  expect(mergeAssetContracts(stored, { ethereum: ["0xnew", "0xrecent"] }, now)).toEqual({
    ethereum: { "0xrecent": now, "0xnew": now },
  });
});
