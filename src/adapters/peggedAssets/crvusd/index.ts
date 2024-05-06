const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import { supplyInEthereumBridge } from "../helper/getSupply";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,  ChainContracts,
} from "../peggedAsset.type";


const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E"],
  },
  waves: {
    bridgeOnETH: [
      "0x0de7b091A21BD439bdB2DfbB63146D9cEa21Ea83", // PepeTeam Bridge
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
    const totalDebt = (
      await sdk.api.abi.call({
        abi: {
          stateMutability: "view",
          type: "function",
          name: "total_debt",
          inputs: [],
          outputs: [{ name: "", type: "uint256" }],
        },
        target: "0xC9332fdCB1C491Dcc683bAe86Fe3cb70360738BC",
        block: _ethBlock,
        chain: chain,
      })
    ).output;
    sumSingleBalance(
      balances,
      "peggedUSD",
      totalDebt / 10 ** decimals,
      "issued",
      false
    );
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: chainMinted("ethereum", 18),
  },
  waves: {
    ethereum: supplyInEthereumBridge(
      chainContracts.ethereum.issued[0],
      chainContracts.waves.bridgeOnETH[0],
      18
    ),
  },
};

export default adapter;
