const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,  ChainContracts,
} from "../peggedAsset.type";
import { call } from "../helper/near";
import { bridgedSupply } from "../helper/getSupply";


const chainContracts: ChainContracts = {
  near: {
    issued: ["usn"],
    unreleased: ["usn-burn.near"]
  },
  aurora: {
    bridgedFromNear: ["0x5183e1B1091804BC2602586919E6880ac1cf2896"],
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
      const totalSupply = await call(issued, "ft_total_supply");

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

async function chainUnreleased(chain: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    for (let issued of chainContracts[chain].issued) {
      const totalSupply = await call(issued, "ft_balance_of", { account_id: chainContracts[chain].unreleased[0] });

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
// usn-burn.near
const adapter: PeggedIssuanceAdapter = {
  near: {
    minted: chainMinted("near", 18),
    unreleased: chainUnreleased("near", 18)
  },
  aurora: {
    near: bridgedSupply("aurora", 18, chainContracts.aurora.bridgedFromNear),
  },
};

export default adapter;
