import {
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";
import { sumSingleBalance } from "../helper/generalUtil";
import { ChainApi } from "@defillama/sdk";

const chainContracts = {
  ethereum: {
    issued: ["0xcfc5bd99915aaa815401c5a41a927ab7a38d29cf"],
    pcvContracts: [
      "0x097f1ee62E63aCFC3Bf64c1a61d96B3771dd06cB", // Protocol Controlled Value tBTC Collateral
      "0x1a4739509F50E683927472b03e251e36d07DD872", // Protocol Controlled Value ETH Collateral
    ],
  },
};

async function ethereumMinted() {
  return async function (api: ChainApi) {
    let balances = {} as Balances;
    const totalSupply = await api.call({ abi: "erc20:totalSupply", target: chainContracts.ethereum.issued[0], })
    sumSingleBalance(balances, "peggedUSD", totalSupply / 1e18, "issued", false);
    return balances;
  };
}

async function ethereumUnreleased() {
  return async function (api: ChainApi) {
    let balances = {} as Balances;
    const debts = await api.multiCall({  abi: 'uint256:debtToPay', calls: chainContracts.ethereum.pcvContracts})
    for (const debt of debts) 
      sumSingleBalance(balances, "peggedUSD", debt / 1e18)
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: ethereumMinted(),
    unreleased: ethereumUnreleased(),
  },
};

export default adapter;
