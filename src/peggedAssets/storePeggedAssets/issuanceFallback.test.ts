import assert from "node:assert/strict";
import { test } from "node:test";
import { PeggedAssetIssuance } from "../../types";
import { ExtrapolationMetadata } from "./chainProtection";
import { calcCirculating, restoreFailedIssuances } from "./getAndStorePeggedAssets";

test("a failed bridge leg is restored before circulating is calculated", async () => {
  const previous = {
    SK: 100,
    ethereum: {
      minted: { peggedUSD: 1000 },
      unreleased: { peggedUSD: 0 },
      circulating: { peggedUSD: 200 },
      bridgedTo: { peggedUSD: 800 },
    },
    polygon: {
      minted: { peggedUSD: 0 },
      unreleased: { peggedUSD: 0 },
      ethereum: { peggedUSD: 800 },
      circulating: { peggedUSD: 800 },
      bridgedTo: { peggedUSD: 800 },
    },
  };
  const current = {
    ethereum: {
      minted: { peggedUSD: 1000 },
      unreleased: { peggedUSD: 0 },
    },
    polygon: {
      minted: { peggedUSD: 0 },
      unreleased: { peggedUSD: 0 },
      ethereum: { peggedUSD: null },
    },
  } as PeggedAssetIssuance;
  const bridgeMapping: Record<string, any[]> = {};
  const metadata: ExtrapolationMetadata = { extrapolated: false, extrapolatedChains: [] };

  restoreFailedIssuances(current, previous, bridgeMapping, "peggedUSD", metadata);
  await calcCirculating(current, bridgeMapping, { id: "2", name: "USD Coin" } as any, "peggedUSD", metadata);

  assert.equal(current.ethereum.circulating.peggedUSD, 200);
  assert.equal(current.polygon.circulating.peggedUSD, 800);
  assert.equal(current.totalCirculating.circulating.peggedUSD, 1000);
  assert.deepEqual(metadata.extrapolatedChains, [{ chain: "polygon", timestamp: 100 }]);
});

test("a failed non-bridge issuance is restored without creating a bridge debit", () => {
  const previous = { SK: 100, ethereum: { minted: { peggedUSD: 500 } } };
  const current = { ethereum: { minted: { peggedUSD: Number.NaN } } } as PeggedAssetIssuance;
  const bridgeMapping: Record<string, any[]> = {};
  const metadata: ExtrapolationMetadata = { extrapolated: false, extrapolatedChains: [] };

  restoreFailedIssuances(current, previous, bridgeMapping, "peggedUSD", metadata);

  assert.equal(current.ethereum.minted.peggedUSD, 500);
  assert.deepEqual(bridgeMapping, {});
});

test("an invalid bridge mapping entry is replaced instead of double-counted", async () => {
  const previous = {
    SK: 100,
    ethereum: { minted: { peggedUSD: 1000 }, unreleased: { peggedUSD: 0 } },
    polygon: { minted: { peggedUSD: 0 }, unreleased: { peggedUSD: 0 }, ethereum: { peggedUSD: 800 } },
  };
  const invalid = { peggedUSD: Number.POSITIVE_INFINITY };
  const current = {
    ethereum: { minted: { peggedUSD: 1000 }, unreleased: { peggedUSD: 0 } },
    polygon: { minted: { peggedUSD: 0 }, unreleased: { peggedUSD: 0 }, ethereum: invalid },
  } as PeggedAssetIssuance;
  const bridgeMapping = { ethereum: [invalid] };
  const metadata: ExtrapolationMetadata = { extrapolated: false, extrapolatedChains: [] };

  restoreFailedIssuances(current, previous, bridgeMapping, "peggedUSD", metadata);
  await calcCirculating(current, bridgeMapping, { id: "2", name: "USD Coin" } as any, "peggedUSD", metadata);

  assert.equal(bridgeMapping.ethereum.length, 1);
  assert.equal(bridgeMapping.ethereum[0].peggedUSD, 800);
  assert.equal(current.totalCirculating.circulating.peggedUSD, 1000);
});
