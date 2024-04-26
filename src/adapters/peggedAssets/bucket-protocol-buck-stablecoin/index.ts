import { sumSingleBalance } from "../helper/generalUtil";
import {
  ChainBlocks,
  Balances,
  PeggedIssuanceAdapter,
} from "../peggedAsset.type";
import { getObject } from "../helper/sui";

type ChainContracts = {
  [chain: string]: {
    [contract: string]: string[];
  };
};

const chainContracts: ChainContracts = {
  sui: {
    issued: [
      "0x9e3dab13212b27f5434416939db5dec6a319d15b89a84fd074d03ece6350d3df",
    ],
  },
};

async function suiMinted() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ): Promise<Balances> {
    let balances = {} as Balances;
    const { fields: buckAmount } = await getObject(
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
