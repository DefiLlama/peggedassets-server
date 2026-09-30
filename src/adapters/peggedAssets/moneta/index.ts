import { chains } from "@defillama/sdk";
import {
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";
import { sumSingleBalance } from "../helper/generalUtil";
import { addressesUtxosAssetAll, getScriptsDatum } from "../helper/cardano";

// the USDM_COUNT NFT sits in a UTXO whose datum holds the total minted amount; the
// script address holding it changes on contract upgrades, so locate it via the asset
const usdm_count_nft_asset = "e319d8e6629ff7991c8ae4f8aec2e0f10463ebdf29b57d26d34914f65553444d5f434f554e54"

async function getCardanoSupply() {
  let balances = {} as Balances;
  const holders = await chains.cardano.getAssetAddresses({ assetId: usdm_count_nft_asset })
  const count_address = holders.find((h) => Number(h.quantity) > 0)?.address
  if (!count_address) throw new Error("moneta: no holder found for the USDM_COUNT nft")
  const utxo = (await addressesUtxosAssetAll(count_address, usdm_count_nft_asset))[0]
  if (!utxo?.data_hash) throw new Error(`moneta: USDM_COUNT utxo at ${count_address} has no datum`)
  const datum = await getScriptsDatum(utxo.data_hash)
  const total_value_locked = datum.json_value.fields[0].int / 1_000_000
  sumSingleBalance(balances, "peggedUSD", total_value_locked, "issued", false);

  return balances;
}

const adapter: PeggedIssuanceAdapter = {
  cardano: {
    minted: getCardanoSupply,
  },
};

export default adapter;
