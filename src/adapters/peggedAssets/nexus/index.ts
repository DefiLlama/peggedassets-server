const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances
} from "../peggedAsset.type";


async function minted(chain:string,address: string) {
return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
) {
    let balances = {} as Balances;
    const totalSupply = (
      await sdk.api.abi.call({
        abi: "erc20:totalSupply",
        target: address,
        block: _ethBlock,
        chain: chain,
      })
    ).output;
    sumSingleBalance(
        balances,
        "peggedUSD",
        totalSupply / 10 ** 6,
        "issued",
        false
    );
    return balances;
  };
}



const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: minted('ethereum','0x92211b6B68a39F4f68E722f3A3A4810A2Ebc8383'),
    unreleased: async () => ({}),
  },
  arbitrum: {
    minted: minted('arbitrum','0x773fAf6B9424abFc199cc28A5320C3C2d151E3bF'),
    unreleased: async () => ({})
  },
};

export default adapter;