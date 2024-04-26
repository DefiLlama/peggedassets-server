const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import { bridgedSupply } from "../helper/getSupply";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";

type ChainContracts = {
  [chain: string]: {
    [contract: string]: string[];
  };
};

const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0x15f74458aE0bFdAA1a96CA1aa779D715Cc1Eefe4"],
  },
  optimism: {
    bridgedFromETH: ["0x894134a25a5faC1c2C26F1d8fBf05111a3CB9487"],
  },
  arbitrum: {
    bridgedFromETH: ["0x894134a25a5faC1c2C26F1d8fBf05111a3CB9487"],
  },
  era: {
    bridgedFromETH: ["0x5FC44E95eaa48F9eB84Be17bd3aC66B6A82Af709"],
  },
  polygon_zkevm: {
    bridgedFromETH: ["0xCA68ad4EE5c96871EC6C6dac2F714a8437A3Fe66"],
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
  ethereum: {
    minted: chainMinted("ethereum", 18),
  },
  optimism: {
    ethereum: bridgedSupply(
      "optimism",
      18,
      chainContracts.optimism.bridgedFromETH
    ),
  },
  arbitrum: {
    ethereum: bridgedSupply(
      "arbitrum",
      18,
      chainContracts.arbitrum.bridgedFromETH
    ),
  },
  era: {
    ethereum: bridgedSupply("era", 18, chainContracts.era.bridgedFromETH),
  },
  polygon_zkevm: {
    ethereum: bridgedSupply(
      "polygon_zkevm",
      18,
      chainContracts.polygon_zkevm.bridgedFromETH
    ),
  },
};

export default adapter;
