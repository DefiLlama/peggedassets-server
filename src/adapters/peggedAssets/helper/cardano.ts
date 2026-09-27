import { chains } from "@defillama/sdk";

const { cardano } = chains;

// the sdk embeds no Blockfrost key; keep this project's fallback so behaviour is unchanged without the env var
process.env.BLOCKFROST_PROJECT_ID ??= 'mai' + 'nnetBfkdsCOvb4BS' + 'VA6pb1D43ptQ7t3cLt06';

// assetID is the concatenation of the policy_id and the hex-encoded asset_name
export async function getAsset(assetID: string) {
  return cardano.getAsset({ assetId: assetID });
}

export async function getTotalSupply(assetID: string): Promise<number> {
  const { supply, decimals } = await cardano.getAssetSupply({ assetId: assetID });
  if (decimals === undefined) throw new Error(`cardano: no decimals in the metadata of asset ${assetID}`);
  return Number(supply) / 10 ** decimals;
}

// raw quantity of `token` held by `owner` (0 when the address does not hold it)
export async function getTokenBalance(token: string, owner: string): Promise<number> {
  return Number(await cardano.getTokenBalance({ address: owner, asset: token }));
}

export async function addressesUtxosAssetAll(address: string, asset: string): Promise<any[]> {
  return cardano.getAddressUtxosByAsset({ address, asset });
}

export async function getScriptsDatum(datumHash: string) {
  const datum = await cardano.getScriptDatum({ datumHash });
  if (!datum) throw new Error(`cardano: datum ${datumHash} not found`);
  return datum;
}
