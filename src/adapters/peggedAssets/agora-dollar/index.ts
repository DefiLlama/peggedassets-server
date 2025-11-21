import { sumSingleBalance } from "../helper/generalUtil";
import { addChainExports, solanaMintedOrBridged } from "../helper/getSupply";
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
    issued: ["0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a"],
  },
  polygon: {
    issued: ["0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a"],
  },
  arbitrum: {
    issued: ["0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a"],
  },
  core: {
    issued: ["0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a"],
  },
  bsc: {
    issued: ["0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a"],
  },
  imx: {
    issued: ["0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a"],
  },
  "plume_mainnet": {
    issued: ["0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a"],
  },
  solana: {
    issued: ["AUSD1jCcCyPLybk1YnvPWsHQSrZ46dxwoMniN4N2UEB9"],
  },
  katana: {
    issued: ["0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a"],
  },
  monad: {
    issued: ["0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a"],
  },
  plasma: {
    issued: ["0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a"],
  },
};


const adapter: PeggedIssuanceAdapter = {
  ...addChainExports(chainContracts, undefined, { decimals: 6, }),
  sui: {
    minted: suiMinted,
    // unreleased: suiUnreleased,
  },
  solana: {
    minted: solanaMintedOrBridged(chainContracts.solana.issued, "peggedUSD"),
  },
};

export default adapter;
