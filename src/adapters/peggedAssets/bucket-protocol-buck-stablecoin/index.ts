import { sumSingleBalance } from "../helper/generalUtil";
import {
  Balances,
  PeggedIssuanceAdapter, ChainContracts,
} from "../peggedAsset.type";
import * as sui from "../helper/sui";


const chainContracts: ChainContracts = {
  sui: {
    issued: [
      "0x9e3dab13212b27f5434416939db5dec6a319d15b89a84fd074d03ece6350d3df",
    ],
  },
}

async function suiMinted() {
  return async function (): Promise<Balances> {
    let balances = {} as Balances;
    const { fields: buckAmount } = await sui.getObject(
      chainContracts.sui.issued[0]
    );
    const mintedAmount =
      buckAmount.buck_treasury_cap.fields.total_supply.fields.value;

    sumSingleBalance(
      balances,
      "peggedUSD",
      mintedAmount / 10 ** 9,
      undefined,
      true
    );
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  sui: {
    minted: suiMinted(),
  },
};

export default adapter;
