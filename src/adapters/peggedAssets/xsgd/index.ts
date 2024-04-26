const sdk = require("@defillama/sdk");
import axios from "axios";
import { sumSingleBalance } from "../helper/generalUtil";
import { bridgedSupply } from "../helper/getSupply";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances, ChainContracts,
} from "../peggedAsset.type";


const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0x70e8de73ce538da2beed35d14187f6959a8eca96"],
  },
  polygon: {
    bridgedFromETH: ["0x769434dcA303597C8fc4997Bf3DAB233e961Eda2"],
  },
  zilliqa: {
    issued: ["zil180v66mlw007ltdv8tq5t240y7upwgf7djklmwh"],
  },
};
async function zilliqaMinted() {
  const { data: { result } } = await axios.post('https://api.zilliqa.com/', {
    method: 'GetSmartContractState',
    params: ['0x173ca6770aa56eb00511dac8e6e13b3d7f16a5a5'],
    id: 1,
    jsonrpc: '2.0'
  })
  let balances = {} as Balances;
  sumSingleBalance(balances, "peggedSGD", result.total_supply / 1e6, "issued", false);
  return balances
}

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
        "peggedSGD",
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
  polygon: {
    ethereum: bridgedSupply(
      "polygon",
      18,
      chainContracts.polygon.bridgedFromETH,
      "polygon",
      "Ethereum",
      "peggedSGD"
    ),
  },
  zilliqa: {
    minted: zilliqaMinted(), // can't figure out how to get token supply
  },
};

export default adapter;
