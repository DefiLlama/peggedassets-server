const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import { bridgedSupply, getApi, } from "../helper/getSupply";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances, ChainContracts,
} from "../peggedAsset.type";
import {
  getTotalSupply as tronGetTotalSupply, // NOTE THIS DEPENDENCY
} from "../helper/tron";
import { call as nearCall } from "../helper/near";
import { ChainApi } from "@defillama/sdk";


const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0x0000000000085d4780B73119b644AE5ecd22b376"],
  },
  bsc: {
    bridgedFromETH: ["0x14016e85a25aeb13065688cafb43044c2ef86784"],
  },
  avax: {
    issued: ["0x1c20e891bab6b1727d14da358fae2984ed9b59eb"],
  },
  harmony: {
    bridgedFromETH: ["0x553a1151f3df3620fc2b5a75a6edda629e3da350"],
  },
  polygon: {
    bridgedFromETH: ["0x2e1ad108ff1d8c782fcbbb89aad783ac49586756"],
  },
  arbitrum: {
    bridgedFromETH: ["0x4d15a3a2286d883af0aa1b3f21367843fac63e07"],
  },
  fantom: {
    bridgedFromETH: ["0x9879abdea01a879644185341f7af7d8343556b7a"], // multichain
  },
  tron: {
    issued: ["TUpMhErZL2fhh4sVNULAbNKLokS4GjC1F4"],
  },
  syscoin: {
    bridgedFromETH: ["0x461d52769884ca6235B685EF2040F47d30C94EB5"], // multichain
  },
  heco: {
    bridgedFromETH: ["0x5eE41aB6edd38cDfB9f6B4e6Cf7F75c87E170d98"],
  },
  cronos: {
    issued: ["0x87EFB3ec1576Dec8ED47e58B832bEdCd86eE186e"], // not clear whether this is held by crypto.com and where
  },
  near: {
    bridgedFromETH: [
      "0000000000085d4780b73119b644ae5ecd22b376.factory.bridge.near",
    ], // rainbow
  },
  aurora: {
    bridgedFromNear: ["0x5454ba0a9e3552f7828616d80a9d2d869726e6f5"], // rainbow
  },
};

/* 
Sora: 0x006d336effe921106f7817e133686bbc4258a4e0d6fed3a9294d8a8b27312cee, don't know how to query API.
*/

function chainMinted(chain: string) {
  return async function (_api: ChainApi) {
    const api = await getApi(chain, _api)
    let balances = {} as Balances;
    const issued = await api.multiCall({ abi: "erc20:totalSupply", calls: chainContracts[chain].issued })
    const decimals = await api.multiCall({ abi: "erc20:decimals", calls: chainContracts[chain].issued })

    for (let i = 0; i < issued.length; i++)
      sumSingleBalance(balances, "peggedUSD", issued[i] / 10 ** decimals[i], "issued", false);

    return balances;
  };
}

async function tronMinted() {
  return async function() {
    let balances = {} as Balances;
    const totalSupply = await tronGetTotalSupply(
      chainContracts["tron"].issued[0]
    );
    sumSingleBalance(balances, "peggedUSD", totalSupply, "issued", false);
    return balances;
  };
}

async function bscMinted() {
  return async function() {
    let balances = {} as Balances;
    /*     const totalSupply = 9 * 10 ** 10; // this is hardcoded because Binance API doesn't seem to give 'token' or 'tokens' info that includes TUSD
        const responseMint = await retry(
          async (_bail: any) =>
            await axios.get(
              "https://dex.binance.org/api/v1/account/bnb1hn8ym9xht925jkncjpf7lhjnax6z8nv24fv2yq"
            )
        );
        const responseReserve = await retry(
          async (_bail: any) =>
            await axios.get(
              "https://dex.binance.org/api/v1/account/bnb100dxzy02a6k7vysc5g4kk4fqamr7jhjg4m83l0"
            )
        );
        const mintingAccountObj = responseMint.data.balances.filter(
          (obj: any) => obj.symbol === "TUSDB-888"
        )[0] ?? { free: 0, frozen: 0};
        const reserveAccountObj = responseReserve.data.balances.filter(
          (obj: any) => obj.symbol === "TUSDB-888"
        )[0] ?? { free: 0, frozen: 0};
        const circulating =
          totalSupply -
          mintingAccountObj.free -
          reserveAccountObj.free -
          reserveAccountObj.frozen;
        if (typeof circulating !== "number") {
          throw new Error("Binance Chain API for TUSD is broken.");
        }
        sumSingleBalance(balances, "peggedUSD", circulating, "issued", false); */
    return balances;
  };
}

async function nearBridged(address: string, decimals: number) {
  return async function() {
    let balances = {} as Balances;
    const supply = await nearCall(address, "ft_total_supply");
    sumSingleBalance(
      balances,
      "peggedUSD",
      supply / 10 ** decimals,
      address,
      true
    );
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: chainMinted("ethereum"),
  },
  /*
   * This is to get Ethereum balance to be 0.
   * This amount on BSC does match the amount bridged from Ethereum, and frequently exceeds it,
   * causing the circulating value on Ethereum to be negative.
   */
  /*
  ethereum: {
    minted: multiFunctionBalance(
      [
        bridgedSupply("bsc", 18, chainContracts.bsc.bridgedFromETH),
        bridgedSupply("polygon", 18, chainContracts.polygon.bridgedFromETH),
        bridgedSupply("arbitrum", 18, chainContracts.arbitrum.bridgedFromETH),
        bridgedSupply("fantom", 18, chainContracts.fantom.bridgedFromETH),
        bridgedSupply("syscoin", 18, chainContracts.syscoin.bridgedFromETH),
        bridgedSupply("heco", 18, chainContracts.heco.bridgedFromETH),
      ],
      "peggedUSD"
    ),
  },
  */
  bsc: {
    minted: bscMinted(),
    ethereum: bridgedSupply("bsc", 18, chainContracts.bsc.bridgedFromETH),
  },
  avax: {
    minted: chainMinted("avax"),
  },
  /* this has 0 supply?
  harmony: {
    ethereum: bridgedSupply("harmony", 18, chainContracts.harmony.bridgedFromETH),
  },
  */
  polygon: {
    ethereum: bridgedSupply(
      "polygon",
      18,
      chainContracts.polygon.bridgedFromETH
    ),
  },
  arbitrum: {
    ethereum: bridgedSupply(
      "arbitrum",
      18,
      chainContracts.arbitrum.bridgedFromETH
    ),
  },
  fantom: {
    ethereum: bridgedSupply("fantom", 18, chainContracts.fantom.bridgedFromETH),
  },
  tron: {
    minted: tronMinted(),
  },
  syscoin: {
    ethereum: bridgedSupply(
      "syscoin",
      18,
      chainContracts.syscoin.bridgedFromETH,
      "multichain",
      "Ethereum"
    ),
  },
  heco: {
    // ethereum: bridgedSupply("heco", 18, chainContracts.heco.bridgedFromETH),
  },
  /*
  cronos: {
    minted: chainMinted("cronos", 18),
  },
  */
  near: {
    ethereum: nearBridged(chainContracts.near.bridgedFromETH[0], 18),
  },
  /* 0 supply
  aurora: {
    near: bridgedSupply("aurora", 18, chainContracts.aurora.bridgedFromNear),
  }
  */
};

export default adapter;
