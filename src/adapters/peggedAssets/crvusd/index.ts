const sdk = require("@defillama/sdk");
import { addChainExports,supplyInEthereumBridge } from "../helper/getSupply";
import { sumSingleBalance } from "../helper/generalUtil";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,  ChainContracts,
} from "../peggedAsset.type";

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

const chainContracts = {
 
  arbitrum: {
    bridgedFromETH: "0x498Bf2B1e120FeD3ad3D42EA2165E9b73f99C1e5"
  },
  optimism: {
    bridgedFromETH: "0xC52D7F23a2e460248Db6eE192Cb23dD12bDDCbf6"
  },
  base: {
    bridgedFromETH: "0x417Ac0e078398C154EdFadD9Ef675d30Be60Af93"
  },
  xdai: {
    bridgedFromETH: "0xaBEf652195F98A91E490f047A5006B71c85f058d"
  },
  polygon: {
    bridgedFromETH: "0xc4Ce1D6F5D98D65eE25Cf85e9F2E9DcFEe6Cb5d6"
  },
  fraxtal: {
    bridgedFromETH: "0xB102f7Efa0d5dE071A8D37B3548e1C7CB148Caf3"
  },
  bsc: {
    bridgedFromETH: "0xe2fb3F127f5450DeE44afe054385d74C392BdeF4"
  },
  era: {
    bridgedFromETH: "0x43cD37CC4B9EC54833c8aC362Dd55E58bFd62b86"
  }
};

const adapter: PeggedIssuanceAdapter = {
  ...addChainExports(chainContracts),
  ethereum: {
    minted: chainMinted("ethereum", 18),
  },
  waves: {
    ethereum: supplyInEthereumBridge( // PepeTeam Bridge
      "0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E",
      "0x0de7b091A21BD439bdB2DfbB63146D9cEa21Ea83",
      18
    ),
  },
};

export default adapter; 
