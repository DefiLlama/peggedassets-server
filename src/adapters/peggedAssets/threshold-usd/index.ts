const sdk = require("@defillama/sdk");
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";
import { sumSingleBalance } from "../helper/generalUtil";

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
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const totalSupply = (
      await sdk.api.abi.call({
        abi: "erc20:totalSupply",
        target: chainContracts.ethereum.issued[0],
        block: _ethBlock,
        chain: "ethereum",
      })
    ).output;
    sumSingleBalance(
      balances,
      "peggedUSD",
      totalSupply / 10 ** 18,
      "issued",
      false
    );
    return balances;
  };
}

async function ethereumUnreleased() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    for (let pcv of chainContracts.ethereum.pcvContracts) {
      const debtToPay = (
        await sdk.api.abi.call({
          abi: {
            stateMutability: "view",
            type: "function",
            name: "debtToPay",
            inputs: [],
            outputs: [
              {
                internalType: "uint256",
                name: "",
                type: "uint256"
              }
            ],
          },
          target: pcv,
          block: _ethBlock,
        })
      ).output;
      sumSingleBalance(balances, "peggedUSD", debtToPay / 10 ** 18);
    }
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
