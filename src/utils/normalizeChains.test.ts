import { addToChains, normalizeChain } from "./normalizeChain";
import { chainUtils } from "@defillama/sdk";

test("distinguish Elysium Kinetiq from Elysium", () => {
  expect(normalizeChain("Elysium Kinetiq")).toBe("elysium");
  expect(normalizeChain("elysium-kinetiq")).toBe("elysium");
  expect(chainUtils.getChainLabelFromKey("elysium")).toBe("Elysium Kinetiq");
  expect(normalizeChain("Elysium")).toBe("elsm");
});

test("addToChains", () => {
  const chains = [] as string[];
  addToChains(chains, "Ethereum");
  expect(chains).toEqual(["Ethereum"]);
  addToChains(chains, "Ethereum-borrowed");
  expect(chains).toEqual(["Ethereum"]);
  addToChains(chains, "BSC-staking");
  expect(chains).toEqual(["Ethereum", "BSC"]);
  addToChains(chains, "Heco");
  expect(chains).toEqual(["Ethereum", "BSC", "Heco"]);
});
