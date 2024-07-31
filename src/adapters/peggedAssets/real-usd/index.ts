const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import { bridgedSupply, solanaMintedOrBridged } from "../helper/getSupply";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,  ChainContracts,
} from "../peggedAsset.type";


const chainContracts: ChainContracts = {
  polygon: {
    issued: ["0x40379a439D4F6795B6fc9aa5687dB461677A2dBa"],
  },
  real: {
    bridgedFromPolygon: [
      "0xb2d75f8Aa33608cF15940Ed47bF139F7CD15d073", 
    ],
  },

};

async function chainMinted(chain: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    for (let issued of chainContracts[chain].issued) {
      const totalSupply = (
        await sdk.api.abi.call({
          abi: "erc20:totalSupply",
          target: issued,
          block: _chainBlocks?.[chain],
          chain: chain,
        })
      ).output;
      sumSingleBalance(
        balances,
        "peggedUSD",
        totalSupply / 10 ** decimals,
        "issued",
        false
      );
    }
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  polygon: {
    minted: chainMinted("polygon", 9),
  },
  real: {
    polygon: bridgedSupply(
      "real",
      9,
      chainContracts.real.bridgedFromPolygon,
      undefined,
      "Polygon"
    ),
  },

};

export default adapter;