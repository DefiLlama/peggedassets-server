import { getChainContracts } from "./chainContracts";

const asset = (overrides: any) => ({ id: "test", gecko_id: "does-not-exist", ...overrides });

test("takes issued and bridgedFrom addresses from chainConfig, not reserve wallets", async () => {
  const result = await getChainContracts(
    asset({
      chainConfig: {
        chains: {
          ethereum: { issued: ["0x1"], reserves: ["0xreserve"], unreleased: ["0xwallet"], bridgeOnETH: ["0xescrow"] },
          arbitrum: { bridgedFromETH: ["0x2"], bridge: "ccip" },
          agoric: { cosmosIssued: ["uist"] },
          osmosis: { cosmosBridgedFromAgoric: ["ibc/ABC"] },
        },
      },
    })
  );
  expect(result).toEqual({ Ethereum: ["0x1"], Arbitrum: ["0x2"], Agoric: ["uist"], Osmosis: ["ibc/ABC"] });
});

test("adds recorded addresses and dedupes them against the config", async () => {
  const result = await getChainContracts(
    asset({ chainConfig: { chains: { ethereum: { issued: ["0x1"] } } } }),
    { test: { ethereum: { "0x1": 1, "0x3": 1 }, solana: { mint: 1 } } }
  );
  expect(result).toEqual({ Ethereum: ["0x1", "0x3"], Solana: ["mint"] });
});

test("uses chain-prefixed asset addresses and keeps coin types intact", async () => {
  const result = await getChainContracts(asset({ address: ["sui:0xabc::usdsui::USDSUI", "aptos:0x6f::mod_coin::MOD"] }));
  expect(result).toEqual({ Sui: ["0xabc::usdsui::USDSUI"], Aptos: ["0x6f::mod_coin::MOD"] });
});

test("a bare asset address counts as ethereum only when nothing else is known", async () => {
  expect(await getChainContracts(asset({ address: "0xbare" }))).toEqual({ Ethereum: ["0xbare"] });
  expect(await getChainContracts(asset({ address: "0xbare" }), { test: { base: { "0x9": 1 } } })).toEqual({ Base: ["0x9"] });
});

test("returns undefined when nothing is known", async () => {
  expect(await getChainContracts(asset({}))).toBeUndefined();
});
