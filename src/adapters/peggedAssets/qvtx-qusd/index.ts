import { sumSingleBalance } from "../helper/generalUtil";
import { getApi } from "../helper/getSupply";
import {
  PeggedIssuanceAdapter,
  Balances,
  ChainContracts,
} from "../peggedAsset.type";
import { ChainApi } from "@defillama/sdk";

const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0xb57bf3c50f20096723b46645f741f632aef220fa"],
  },
  bsc: {
    issued: ["0x63C4664CeB3e93ef22d1E56826395Fb1C927C118"],
  },
  polygon: {
    issued: ["0x8d58dEbF89740Da1416d5f1904E4286096174B5A"],
  },
  base: {
    issued: ["0x02DAE538b3Cf726c04990520454Dd7AD42550b3F"],
  },
  arbitrum: {
    issued: ["0x04321b4Dd2A87dc285E51Fb809acF23D5ca18E17"],
  },
};

function chainMinted(chain: string, decimals: number) {
  return async function (_api: ChainApi) {
    const api = await getApi(chain, _api);
    let balances = {} as Balances;
    const issued = await api.multiCall({
      abi: "erc20:totalSupply",
      calls: chainContracts[chain].issued,
    });
    for (let i = 0; i < issued.length; i++) {
      sumSingleBalance(balances, "peggedUSD", issued[i] / 10 ** decimals, "issued", false);
    }
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  ethereum: { minted: chainMinted("ethereum", 18) },
  bsc: { minted: chainMinted("bsc", 18) },
  polygon: { minted: chainMinted("polygon", 18) },
  base: { minted: chainMinted("base", 6) },
  arbitrum: { minted: chainMinted("arbitrum", 6) },
};

export default adapter;