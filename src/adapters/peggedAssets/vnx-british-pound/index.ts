const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import { solanaMintedOrBridged,  } from "../helper/getSupply";
import {
  Balances,
  ChainBlocks,
  PeggedIssuanceAdapter,  ChainContracts,
} from "../peggedAsset.type";
import { getTotalSupply as tezosGetTotalSupply } from "../helper/tezos";
import { getTotalSupply as stellarGetTotalSupply } from "../helper/stellar";

const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0x34c9c643becd939c950bb9f141e35777559817cb"],
  },
  solana: {
    issued: ["5H4voZhzySsVvwVYDAKku8MZGuYBC7cXaBKDPW4YHWW1"],
  },
  base: {
    issued: ["0xaeb4bb7debd1e5e82266f7c3b5cff56b3a7bf411"],
  },
  celo: {
    issued: ["0x7aE4265eCFC1F31bc0E112DfCFe3D78E01f4BB7f"],
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
        "peggedGBP",
        totalSupply / 10 ** decimals,
        "issued",
        false
      );
    }
    return balances;
  };
}
 
const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: chainMinted("ethereum", 18),
  },
  solana: {
    minted: solanaMintedOrBridged(chainContracts.solana.issued, "peggedGBP"),
  },  
  base: {
    minted: chainMinted("base", 18),
  },
  celo: {
    minted: chainMinted("celo", 18),
  }
};
export default adapter;