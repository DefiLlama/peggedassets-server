import { ChainApi } from '@defillama/sdk';
import { sumSingleBalance } from "../helper/generalUtil";
import { getApi, solanaMintedOrBridged } from "../helper/getSupply";
import { Balances, PeggedIssuanceAdapter } from "../peggedAsset.type";

function chainMinted(chain: string, address: string) {
  return async function (_api: ChainApi) {
    const api = await getApi(chain, _api)
    let balances = {} as Balances;
    const issued = await api.multiCall({ abi: "erc20:totalSupply", calls: [{ target: address }] })
    const decimals = await api.multiCall({ abi: "erc20:decimals", calls: [{ target: address }] })

    for (let i = 0; i < issued.length; i++)
      sumSingleBalance(balances, "peggedUSD", issued[i] / 10 ** decimals[i], "issued", false);

    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  solana: {
    minted: solanaMintedOrBridged([
      "DUSDt4AeLZHWYmcXnVGYdgAzjtzU5mXUVnTMdnSzAttM",
    ]),
  },
  bsc: {
    minted: chainMinted("bsc", "0xaf44A1E76F56eE12ADBB7ba8acD3CbD474888122"),
  },
};

export default adapter;