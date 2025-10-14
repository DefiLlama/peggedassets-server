const sdk = require("@defillama/sdk");
import { addChainExports,supplyInEthereumBridge } from "../helper/getSupply";
import { sumSingleBalance } from "../helper/generalUtil";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,  ChainContracts,
} from "../peggedAsset.type";

const pegkeepers = [
  "0x9201da0d97caaaff53f01b2fb56767c7072de340", //crvUSD/USDC
  "0xfb726f57d251ab5c731e5c64ed4f5f94351ef9f3", //crvUSD/USDT
  "0x3fa20eaa107de08b38a8734063d605d5842fe09c", //crvUSD/pyUSD
  "0x338cb2d827112d989a861cde87cd9ffd913a1f9d"  //crvUSD/frxUSD
]

const yb_amms = [
  "0xB42e34Bf1f8627189e099ABDB069B9D73B521E4F", //cbBTC YB AMM
  "0xb0faaBE84076c6330A9642a6400e87CE4cAec9d4", //tBTC YB AMM
  "0xa25306937dbA98378c32F167588F5Dc17A95c94b", //WBTC YB AMM
]

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
    
    // Get debt from all pegkeepers
    const pegkeeperDebtCalls = pegkeepers.map(keeper => ({
      target: keeper,
      params: []
    }));
    
    const pegkeeperDebts = await sdk.api.abi.multiCall({
      abi: {
        stateMutability: "view",
        type: "function",
        name: "debt",
        inputs: [],
        outputs: [{ name: "", type: "uint256" }],
      },
      calls: pegkeeperDebtCalls,
      block: _ethBlock,
      chain: chain,
    });
    
    // Sum up all pegkeeper debts
    let totalPegkeeperDebt = 0;
    pegkeeperDebts.output.forEach((call: any) => {
        totalPegkeeperDebt += Number(call.output);
    });
    
    // Get debt from all YB AMMs
    const ybAmmDebtCalls = yb_amms.map(amm => ({
      target: amm,
      params: []
    }));
    
    const ybAmmDebts = await sdk.api.abi.multiCall({
      abi: {
        stateMutability: "view",
        type: "function",
        name: "get_debt",
        inputs: [],
        outputs: [{ name: "", type: "uint256" }],
      },
      calls: ybAmmDebtCalls,
      block: _ethBlock,
      chain: chain,
    });
    
    // Sum up all YB AMM debts
    let totalYbAmmDebt = 0;
    ybAmmDebts.output.forEach((call: any) => {
        totalYbAmmDebt += Number(call.output);
    });
    
    // Add total_debt and pegkeeper debt together
    const totalSupply = Number(totalDebt) + totalPegkeeperDebt + totalYbAmmDebt;
    
    sumSingleBalance(
      balances,
      "peggedUSD",
      totalSupply / 10 ** decimals,
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
  },
  sonic: {
    bridgedFromETH: "0x7fff4c4a827c84e32c5e175052834111b2ccd270"
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
