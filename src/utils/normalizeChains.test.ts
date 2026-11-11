import { addToChains } from "./normalizeChain";

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
