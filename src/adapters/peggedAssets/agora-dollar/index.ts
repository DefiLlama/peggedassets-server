import { sumSingleBalance } from "../helper/generalUtil";
import { addChainExports } from "../helper/getSupply";
import * as sui from "../helper/sui";
import { Balances, ChainContracts, PeggedIssuanceAdapter } from "../peggedAsset.type";


async function suiMinted(): Promise<Balances> {
  let balances = {} as Balances;
  const supply = await sui.getTokenSupply(
    "0x2053d08c1e2bd02791056171aab0fd12bd7cd7efad2ab8f6b9c8902f14df2ff2::ausd::AUSD"
  );
  sumSingleBalance(balances, "peggedUSD", supply, 'issued', false);
        return balances;
}

// async function suiUnreleased(): Promise<Balances> {
//   let balances = {} as Balances;
//   const { fields: unreleasedFields } = await sui.getObject(
//     "0x916294b841355104e01f68d3f6afba32942a4a0d5c350e64228b48d5069cfd8a"
//   );
//   const unreleasedAmount = unreleasedFields.balance;

//   sumSingleBalance(
//     balances,
//     "peggedUSD",
//     unreleasedAmount / 10 ** 6, 
//     undefined,
//     true
//   );

//   return balances;
// }

const chainContracts: ChainContracts = {
  avax: {
    issued: ["0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a"],
  },
  ethereum: {
    issued: ["0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a"],
  },
  mantle: {
    bridgedFromETH: ["0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a"],
  },
};


const adapter: PeggedIssuanceAdapter = {
  ...addChainExports(chainContracts, undefined, { decimals: 6, }),
  sui: {
    minted: suiMinted,
    // unreleased: suiUnreleased,
  },
};

export default adapter;
