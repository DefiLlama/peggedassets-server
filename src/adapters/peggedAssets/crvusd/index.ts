import { addChainExports, supplyInEthereumBridge } from "../helper/getSupply";
import { sumSingleBalance } from "../helper/generalUtil";
import {
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";
import { ChainApi } from "@defillama/sdk";

const pegkeepers = [
  "0x9201da0d97caaaff53f01b2fb56767c7072de340", //crvUSD/USDC
  "0xfb726f57d251ab5c731e5c64ed4f5f94351ef9f3", //crvUSD/USDT
  "0x3fa20eaa107de08b38a8734063d605d5842fe09c", //crvUSD/pyUSD
  "0x338cb2d827112d989a861cde87cd9ffd913a1f9d"  //crvUSD/frxUSD
]

const curve_lend_operators = [
  "0x6119e210e00d4be2df1b240d82b1c3decedbbbf0", //lend operator for sreUSD llamalend market
  // "" new operator coming soon: https://www.curve.finance/dao/ethereum/proposals/1259-ownership
]

const yb_amms = [
  "0xB42e34Bf1f8627189e099ABDB069B9D73B521E4F", //cbBTC YB AMM (legacy)
  "0xb0faaBE84076c6330A9642a6400e87CE4cAec9d4", //tBTC YB AMM (legacy)
  "0xa25306937dbA98378c32F167588F5Dc17A95c94b", //WBTC YB AMM (legacy)
  "0xDC90F6B111DF0c26e349d3cC8d3C357b191e109a", //cbBTC YB AMM (new)
  "0x61ED017468C8A3bE3Bac972b54fdae6eAfcbcd79", //tBTC YB AMM (new)
  "0x10B663da78055bDA0c7c26712CE1A0613AF0Ae66", //WBTC YB AMM (new)
]

async function minted(api: ChainApi) {
  let balances = {} as Balances;
  const totalDebt = await api.call({ abi: "uint256:total_debt", target: "0xC9332fdCB1C491Dcc683bAe86Fe3cb70360738BC", })
  const pegkeeperDebts = await api.multiCall({ abi: "uint256:debt", calls: pegkeepers, })
  const ybAmmDebts = await api.multiCall({ abi: "uint256:get_debt", calls: yb_amms, })
  const curveLendOperatorsDebts = await api.multiCall({ abi: "uint256:mintedAmount", calls: curve_lend_operators, })  

  const totalSupply = pegkeeperDebts.concat([totalDebt], ybAmmDebts, curveLendOperatorsDebts).reduce((a, b) => a + Number(b), 0) / 1e18

  sumSingleBalance(balances, "peggedUSD", totalSupply, "issued", false);
  return balances;
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
  },
  taiko: {
    bridgedFromETH: "0xc8F4518ed4bAB9a972808a493107926cE8237068"
  }
};

const adapter: PeggedIssuanceAdapter = {
  ...addChainExports(chainContracts),
  ethereum: {
    minted,
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
