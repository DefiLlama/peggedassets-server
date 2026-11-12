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
    { test: { ethereum: { "0x1": Date.now() / 1000, "0x3": Date.now() / 1000 }, solana: { mint: Date.now() / 1000 } } }
  );
  expect(result).toEqual({ Ethereum: ["0x1", "0x3"], Solana: ["mint"] });
});

test("uses chain-prefixed asset addresses and keeps coin types intact", async () => {
  const result = await getChainContracts(asset({ address: ["sui:0xabc::usdsui::USDSUI", "aptos:0x6f::mod_coin::MOD"] }));
  expect(result).toEqual({ Sui: ["0xabc::usdsui::USDSUI"], Aptos: ["0x6f::mod_coin::MOD"] });
});

const evm = "0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f";
const now = () => Date.now() / 1000;

test("a bare EVM asset address is ethereum, also next to other chains", async () => {
  expect(await getChainContracts(asset({ address: evm }))).toEqual({ Ethereum: [evm] });
  expect(await getChainContracts(asset({ address: evm }), { test: { base: { "0x9": now() } } })).toEqual({ Base: ["0x9"], Ethereum: [evm] });
});

test("a bare address another source already placed is not repeated under ethereum", async () => {
  const result = await getChainContracts(asset({ address: evm }), { test: { bsc: { [evm.toLowerCase()]: now() } } });
  expect(result).toEqual({ BSC: [evm.toLowerCase()] });
});

test("bare non-EVM identifiers are not labelled ethereum", async () => {
  for (const address of ["SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.usdh-token-v1", "0x" + "ab".repeat(32), "terra1f0eqgy9wxyz"])
    expect(await getChainContracts(asset({ address }))).toBeUndefined();
});

test("recorded addresses older than the ttl are ignored", async () => {
  const result = await getChainContracts(asset({}), { test: { ethereum: { "0xstale": 1, "0xfresh": now() } } });
  expect(result).toEqual({ Ethereum: ["0xfresh"] });
});

test("returns undefined when nothing is known", async () => {
  expect(await getChainContracts(asset({}))).toBeUndefined();
});
