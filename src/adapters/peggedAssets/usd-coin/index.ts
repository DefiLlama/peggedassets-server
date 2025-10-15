const sdk = require("@defillama/sdk");
import { lookupAccountByID } from "../helper/algorand";
import { getTotalSupply as aptosGetTotalSupply, function_view } from "../helper/aptos";
import { getTotalSupply } from "../helper/cardano";
import {
    sumMultipleBalanceFunctions,
    sumSingleBalance,
} from "../helper/generalUtil";
import {
    bridgedSupply,
    cosmosSupply,
    osmosisSupply,
    solanaMintedOrBridged,
    supplyInArbitrumBridge,
    supplyInEthereumBridge,
    terraSupply
} from "../helper/getSupply";
import { getTotalSupply as kavaGetTotalSupply } from "../helper/kava";
import { mixinSupply } from "../helper/mixin";
import { call as nearCall } from "../helper/near";
import { call as nibiruCall } from "../helper/nibiru";
import {
    getBalance as ontologyGetBalance,
    getTotalSupply as ontologyGetTotalSupply,
} from "../helper/ontology";
import { getTokenBalance as solanaGetTokenBalance } from "../helper/solana";
import * as sui from "../helper/sui";
import {
    getTotalSupply as tronGetTotalSupply, // NOTE THIS DEPENDENCY
} from "../helper/tron";
import {
    Balances,
    ChainBlocks,
    PeggedIssuanceAdapter
} from "../peggedAsset.type";
import { chainContracts } from "./config";
const axios = require("axios");
const retry = require("async-retry");

// If you are trying to test the adapter locally and it failed, try to comment out the lines related with dogechain and fuse

/*
Sora: cannot find API query that gives supply.

Cronos: they have not provided details about the wallets holding the USDC.

Flow: A.b19436aae4d94622.FiatToken. HTTP API has no info about tokens. Using Circle API for now.

Hedera missing 7M unreleased, is not in treasury account. Using Circle API because of this.

Stellar: 1 explorer doesn't work, 1 doesn't list it as an asset. Using Circle API for now.

Conflux: don't know how to make calls. celer: 0x6963EfED0aB40F6C3d7BdA44A05dcf1437C44372

Should check again for more unreleased tokens.

Gnosis: note there is 83M minted, 2.1M bridged, rest is here: 0x87D48c565D0D85770406D248efd7dc3cbd41e729

Velas: amount on chain does not match amount in multichain bridge, so it has not been added yet.

Juno, Crescent: missing Axelar bridged, no simple API to use, maybe can use axelarscan's

Sifchain: not sure where it's coming from/how to track
*/

async function chainMinted(chain: string, decimals: number) {
  return async function(_: any, _1: any, chainBlocks: ChainBlocks) {
    let balances = {} as Balances;
    for (let issued of chainContracts[chain].issued) {
      const totalSupply = (
        await sdk.api.abi.call({
          abi: "erc20:totalSupply",
          target: issued,
          block: chainBlocks?.[chain],
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

async function chainUnreleased(chain: string, decimals: number, owner: string) {
  return async function(_: any, _1: any, chainBlocks: ChainBlocks) {
    let balances = {} as Balances;
    for (let issued of chainContracts[chain].issued) {
      const reserve = (
        await sdk.api.erc20.balanceOf({
          target: issued,
          owner: owner,
          block: chainBlocks?.[chain],
          chain: chain,
        })
      ).output;
      sumSingleBalance(balances, "peggedUSD", reserve / 10 ** decimals);
    }
    return balances;
  };
}

async function solanaUnreleased() {
  return async function() {
    let balances = {} as Balances;
    for (let unreleasedAddress of chainContracts["solana"].unreleased) {
      sumSingleBalance(balances, "peggedUSD", await solanaGetTokenBalance(
        chainContracts["solana"].issued[0],
        unreleasedAddress
      ));
    }
    return balances;
  };
}

const getBal = (address: string) => lookupAccountByID(address).then(r => r.account.assets.find((t: any) => t["asset-id"] == 31566704).amount / 10 ** 6)
async function algorandMinted() {
  // I gave up on trying to use the SDK for this
  return async function() {
    let balances = {} as Balances;
    const supplyRes = await retry(
      async (_bail: any) =>
        await axios.get("https://mainnet-idx.algonode.cloud/v2/assets/31566704")
    );
    const supply = supplyRes?.data?.asset?.params?.total;
    let balance = (supply / 10 ** 6 - await getBal("2UEQTE5QDNXPI7M3TU44G6SYKLFWLPQO7EBZM7K7MHMQQMFI4QJPLHQFHM"));
    sumSingleBalance(balances, "peggedUSD", balance, "issued", false);
    return balances;
  };
}

async function algorandUnreleased() {
  return async function() {
    let balances = {} as Balances;

    sumSingleBalance(balances, "peggedUSD",
      (await getBal("OSS3CEB3KK2QGVW4DZYMHLDJMJIY7WKFQCPXV7KOZCGF6GPILAARBOGZHM")) +
      (await getBal("SO6ZNE255CHM56JNA6SYDAKIMHC266DGM4G47O6N66UT57HZZ7VV6Y2N7Y")));
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

async function hederaMinted() {
  return async function() {
    let balances = {} as Balances;
    const issuance = await retry(
      async (_bail: any) =>
        await axios.get(
          "https://mainnet-public.mirrornode.hedera.com/api/v1/tokens/0.0.456858"
        )
    );
    const supply = issuance?.data?.total_supply;
    let balance = supply / 10 ** 6;
    sumSingleBalance(balances, "peggedUSD", balance, "issued", false);
    return balances;
  };
}

async function circleAPIChainMinted(chain: string) {
  return async function() {
    let balances = {} as Balances;
    const issuance = await retry(
      async (_bail: any) =>
        await axios.get("https://api.circle.com/v1/stablecoins")
    );
    const usdcData = issuance.data.data.filter(
      (obj: any) => obj.symbol === "USDC"
    );
    const filteredChainsData = await usdcData[0].chains.filter(
      (obj: any) => obj.chain === chain
    );
    const supply = parseInt(filteredChainsData[0].amount);
    sumSingleBalance(balances, "peggedUSD", supply, "issued", false);
    return balances;
  };
}

async function suiMinted(): Promise<Balances> {
  let balances = {} as Balances;
  const supply = await sui.getTokenSupply(
    "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC"
  );
  sumSingleBalance(balances, "peggedUSD", supply, 'issued', false);
  return balances;
}

async function suiBridged(chain: string) {
  return async function() {
    let balances = {} as Balances;
    const res = await axios.get(
      `https://kx58j6x5me.execute-api.us-east-1.amazonaws.com/sui/usdc`
    );
    const totalSupply = parseInt(
      res.data.find((t: any) => t.coin === `USDC_${chain}`).cumulative_balance
    );
    sumSingleBalance(
      balances,
      "peggedUSD",
      totalSupply,
      "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf",
      true
    );
    return balances;
  };
}

async function reinetworkBridged(address: string, decimals: number) {
  return async function() {
    let balances = {} as Balances;
    const res = await retry(
      async (_bail: any) =>
        await axios.get(
          `https://scan.rei.network/api?module=token&action=getToken&contractaddress=${address}`
        )
    );
    const totalSupply =
      parseInt(res?.data?.result?.totalSupply) / 10 ** decimals;
    sumSingleBalance(balances, "peggedUSD", totalSupply, address, true);
    return balances;
  };
}

async function karuraMinted(address: string, decimals: number) {
  return async function() {
    let balances = {} as Balances;
    const res = await retry(
      async (_bail: any) =>
        await axios.get(
          `https://blockscout.karura.network/api?module=token&action=getToken&contractaddress=getToken&contractaddress=${address}`
        )
    );
    const supply = res?.data?.result?.totalSupply / 10 ** decimals;
    sumSingleBalance(
      balances,
      "peggedUSD",
      supply,
      "wormhole",
      false,
      "Ethereum"
    );
    return balances;
  };
}

async function ontologyBridged() {
  return async function() {
    let balances = {} as Balances;
    const polyUSDCAddress = chainContracts.ontology.bridgedFromETH[0];
    const polyUSDCReserveAddress = chainContracts.ontology.unreleased[0];
    const polyNetworkSupply = await ontologyGetTotalSupply(
      polyUSDCAddress,
      "oep4"
    );
    const polyNetworkReserve = await ontologyGetBalance(
      polyUSDCAddress,
      "oep4",
      polyUSDCReserveAddress
    );
    sumSingleBalance(
      balances,
      "peggedUSD",
      polyNetworkSupply - polyNetworkReserve,
      polyUSDCAddress,
      true
    );

    const celerUSDCAddress = chainContracts.ontology.bridgedFromETH[1];
    const celerSupply = await ontologyGetTotalSupply(celerUSDCAddress, "orc20");
    sumSingleBalance(
      balances,
      "peggedUSD",
      celerSupply,
      celerUSDCAddress,
      true
    );
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

async function nearMint(address: string, decimals: number) {
  return async function() {
    let balances = {} as Balances;
    const mintedAmount = await nearCall(address, "ft_total_supply");
    sumSingleBalance(
      balances,
      "peggedUSD",
      mintedAmount / 10 ** decimals,
      address,
      false
    );
    return balances;
  };
}

async function elrondBridged(tokenID: string, decimals: number) {
  return async function() {
    let balances = {} as Balances;
    const res = await retry(
      async (_bail: any) =>
        await axios.get(
          `https://gateway.elrond.com/network/esdt/supply/${tokenID}`
        )
    );
    const supply = res?.data?.data?.supply / 10 ** decimals;
    sumSingleBalance(
      balances,
      "peggedUSD",
      supply,
      "adastra",
      false,
    );
    return balances;
  };
}

async function kavaBridged() {
  return async function() {
    let balances = {} as Balances;
    for (const contract of chainContracts.kava.bridgedFromETH) {
      const totalSupply = await kavaGetTotalSupply(contract);
      sumSingleBalance(balances, "peggedUSD", totalSupply, contract, true);
    }
    return balances;
  };
}

async function aptosBridged() {
  return async function() {
    let balances = {} as Balances;
    const contractStargate =
      "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa";
    const typeStargate =
      "0x1::coin::CoinInfo<0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC>";
    const totalSupplyStargate = await aptosGetTotalSupply(
      contractStargate,
      typeStargate
    );
    sumSingleBalance(
      balances,
      "peggedUSD",
      totalSupplyStargate,
      contractStargate,
      true
    );
    const contractPortal =
      "0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea";
    const typePortal =
      "0x1::coin::CoinInfo<0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::coin::T>";
    const totalSupplyPortal = await aptosGetTotalSupply(
      contractPortal,
      typePortal
    );
    sumSingleBalance(
      balances,
      "peggedUSD",
      totalSupplyPortal,
      contractPortal,
      true
    );
    return balances;
  };
}

async function injectiveBridged() {
  return async function() {
    const issuance = await retry(async (_bail: any) =>
      axios.get("https://injective-nuxt-api.vercel.app/api/tokens")
    );

    const targetDenom = "ibc/2CBC2EA121AE42563B08028466F37B600F2D7D4282342DE938283CC3FB2BC00E";
    const targetToken = issuance?.data?.supply?.find(
      (token: any) => token.denom === targetDenom
    );

    const circulatingSupply = targetToken ? targetToken.amount / 1e6 : 0;
    let balances = {};
    sumSingleBalance(balances, "peggedUSD", circulatingSupply, "issued", false);

    return balances;
  };
}

async function flowBridged(address: string, decimals: number) {
  return async function() {
    let balances = {} as Balances;
    const res = await retry(
      async (_bail: any) =>
        await axios.get(
          `https://evm.flowscan.io/api/v2/addresses/${address}`
        )
    );
    const totalSupply =
      parseInt(res?.data?.token?.total_supply) / 10 ** decimals;
    sumSingleBalance(balances, "peggedUSD", totalSupply, address, true);
    return balances;
  };
}

async function moveSupply(): Promise<Balances> {
  const balances = {} as Balances;

  const resp = await function_view({
    functionStr: '0x1::fungible_asset::supply',
    type_arguments: ['0x1::object::ObjectCore'],
    args: [chainContracts.move.bridgedFromETH[0]],
  });
  balances["peggedUSD"] = Number(resp.vec[0]) / 1e6;

  return balances;
}

async function getCardanoSupply() {
  return async function() {
    let balances = {} as Balances;
    const supply = await getTotalSupply(chainContracts.cardano.bridgedFromETH[0]);
    sumSingleBalance(balances, "peggedUSD", supply, "wan", true);
    return balances;
  };
}

async function rippleMinted() {
  return async function() {
    const balances = {} as Balances;

    const NODE_URL = "https://xrplcluster.com";

    // Get the USDC token info from config
    const usdcToken = chainContracts.ripple.issued[0]; // "5553444300000000000000000000000000000000.rGm7WCVp9gb4jZHWTEtGUr4dd74z2XuWhE"
    const [currencyCode, issuerAddress] = usdcToken.split('.');

    const payload = {
      method: "gateway_balances",
      params: [
        {
          account: issuerAddress,
          ledger_index: "validated",
        },
      ],
    };

    const res = await retry(async (_bail: any) => axios.post(NODE_URL, payload));

    if (res.data.result && res.data.result.obligations && res.data.result.obligations[currencyCode]) {
      const supplyStr = res.data.result.obligations[currencyCode];
      const supply = parseFloat(supplyStr); // XRPL API returns value in correct decimal format

      sumSingleBalance(balances, "peggedUSD", supply, "issued", false);
    }

    return balances;
  };
}

async function nibiruBridged() {
  return async function() {
    const balances = {} as Balances;
    
    for (const contract of chainContracts.nibiru.bridgedFromETH) {
      const totalSupply = await nibiruCall({
        target: contract,
        abi: { name: 'totalSupply' }
      });
      
      // Convert from hex to number and divide by 1e6 (USDC has 6 decimals)
      const supply = parseInt(totalSupply, 16) / 1e6;
      sumSingleBalance(balances, "peggedUSD", supply, contract, true);
    }
    
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: chainMinted("ethereum", 6),
    unreleased: chainUnreleased(
      "ethereum",
      6,
      chainContracts.ethereum.unreleased[0]
    ),
    solana: bridgedSupply(
      "ethereum",
      6,
      chainContracts.ethereum.bridgedFromSol
    ),
    polygon: bridgedSupply(
      "ethereum",
      6,
      chainContracts.ethereum.bridgedFromPolygon
    ),
    bsc: bridgedSupply("ethereum", 18, chainContracts.ethereum.bridgedFromBSC),
  },
  polygon: {
    minted: chainMinted("polygon", 6),
    ethereum: bridgedSupply(
      "polygon",
      6,
      chainContracts.polygon.bridgedFromETH
    ),
    solana: bridgedSupply("polygon", 6, chainContracts.polygon.bridgedFromSol),
  },
  solana: {
    minted: solanaMintedOrBridged(chainContracts.solana.issued),
    unreleased: solanaUnreleased(),
    ethereum: solanaMintedOrBridged(chainContracts.solana.bridgedFromETH),
    bsc: solanaMintedOrBridged(chainContracts.solana.bridgedFromBSC),
    polygon: solanaMintedOrBridged(chainContracts.solana.bridgedFromPolygon),
    avax: solanaMintedOrBridged(chainContracts.solana.bridgedFromAvax),
    celo: solanaMintedOrBridged(chainContracts.solana.bridgedFromCelo),
    fantom: solanaMintedOrBridged(chainContracts.solana.bridgedFromFantom),
  },
  bsc: {
    ethereum: sumMultipleBalanceFunctions(
      [
        bridgedSupply("bsc", 6, chainContracts.bsc.bridgedFromETH),
        bridgedSupply("bsc", 18, chainContracts.bsc.bridgedFromETH18),
      ],
      "peggedUSD"
    ),
    solana: bridgedSupply("bsc", 6, chainContracts.bsc.bridgedFromSol),
    polygon: bridgedSupply("bsc", 6, chainContracts.bsc.bridgedFromPolygon),
    avax: bridgedSupply("bsc", 6, chainContracts.bsc.bridgedFromAvax),
  },
  avax: {
    minted: chainMinted("avax", 6),
    ethereum: bridgedSupply("avax", 6, chainContracts.avax.bridgedFromETH),
    solana: bridgedSupply("avax", 6, chainContracts.avax.bridgedFromSol),
    bsc: bridgedSupply("avax", 18, chainContracts.avax.bridgedFromBSC),
    polygon: bridgedSupply("avax", 6, chainContracts.avax.bridgedFromPolygon),
  },
  /* hacked, trading at $0.06
  harmony: {
    ethereum: bridgedSupply(
      "harmony",
      6,
      chainContracts.harmony.bridgedFromETH
    ),
  },
  */
  arbitrum: {
    minted: chainMinted("arbitrum", 6),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "arbitrum",
      6,
      chainContracts.arbitrum.bridgedFromETH
    ),
  },
  era: {
    minted: chainMinted("era", 6),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("era", 6, chainContracts.era.bridgedFromETH),
  },
  polygon_zkevm: {
    ethereum: bridgedSupply(
      "polygon_zkevm",
      6,
      chainContracts.polygon_zkevm.bridgedFromETH
    ),
  },
  okexchain: {
    ethereum: bridgedSupply(
      "okexchain",
      18,
      chainContracts.okexchain.bridgedFromETH
    ),
  },
  moonriver: {
    ethereum: bridgedSupply(
      "moonriver",
      6,
      chainContracts.moonriver.bridgedFromETH,
      "multichain",
      "Ethereum"
    ),
  },
  moonbeam: {
    ethereum: bridgedSupply(
      "moonbeam",
      6,
      chainContracts.moonbeam.bridgedFromETH
    ),
  },
  boba: {
    ethereum: bridgedSupply("boba", 6, chainContracts.boba.bridgedFromETH),
  },
  optimism: {
    minted: chainMinted("optimism", 6),
    ethereum: bridgedSupply(
      "optimism",
      6,
      chainContracts.optimism.bridgedFromETH
    ),
  },
  metis: {
    ethereum: bridgedSupply("metis", 6, chainContracts.metis.bridgedFromETH),
  },
  kcc: {
    ethereum: bridgedSupply("kcc", 18, chainContracts.kcc.bridgedFromETH),
  },
  syscoin: {
    ethereum: bridgedSupply(
      "syscoin",
      6,
      chainContracts.syscoin.bridgedFromETH,
      "multichain",
      "Ethereum"
    ),
  },
  tomochain: {
    ethereum: bridgedSupply(
      "tomochain",
      6,
      chainContracts.tomochain.bridgedFromETH
    ),
  },
  ronin: {
    ethereum: supplyInEthereumBridge(
      chainContracts.ethereum.issued[0],
      chainContracts.ronin.bridgeOnETH[0],
      6
    )
  },
  aurora: {
    near: bridgedSupply("aurora", 6, chainContracts.aurora.bridgedFromNear),
  },
  fuse: {
    ethereum: bridgedSupply("fuse", 6, chainContracts.fuse.bridgedFromETH),
  },
  meter: {
    ethereum: bridgedSupply("meter", 6, chainContracts.meter.bridgedFromETH),
  },
  telos: {
    ethereum: bridgedSupply("telos", 6, chainContracts.telos.bridgedFromETH),
  },
  milkomeda: {
    ethereum: bridgedSupply(
      "milkomeda",
      6,
      chainContracts.milkomeda.bridgedFromETH
    ),
  },
  elastos: {
    ethereum: bridgedSupply(
      "elastos",
      6,
      chainContracts.elastos.bridgedFromETH
    ),
  },
  algorand: {
    minted: algorandMinted(),
    unreleased: algorandUnreleased(),
  },
  tron: {
    minted: tronMinted(),
  },
  terra: {
    ethereum: terraSupply(chainContracts.terra.bridgedFromETH, 6),
    solana: terraSupply(chainContracts.terra.bridgedFromSol, 6),
    bsc: terraSupply(chainContracts.terra.bridgedFromBSC, 6),
    avax: terraSupply(chainContracts.terra.bridgedFromAvax, 6),
  },
  oasis: {
    ethereum: bridgedSupply("oasis", 6, chainContracts.oasis.bridgedFromETH),
    solana: bridgedSupply("oasis", 6, chainContracts.oasis.bridgedFromSol),
    bsc: bridgedSupply("oasis", 18, chainContracts.oasis.bridgedFromBSC),
    polygon: bridgedSupply("oasis", 6, chainContracts.oasis.bridgedFromPolygon),
    avax: bridgedSupply("oasis", 6, chainContracts.oasis.bridgedFromAvax),
  },
  crab: {
    ethereum: bridgedSupply("crab", 6, chainContracts.crab.bridgedFromETH),
  },
  evmos: {
    ethereum: bridgedSupply("evmos", 6, chainContracts.evmos.bridgedFromETH),
  },
  astar: {
    ethereum: bridgedSupply("astar", 6, chainContracts.astar.bridgedFromETH),
  },
  hedera: {
    minted: circleAPIChainMinted("HBAR"),
  },
  stellar: {
    minted: circleAPIChainMinted("XLM"),
  },

  xdai: {
    ethereum: bridgedSupply("xdai", 6, chainContracts.xdai.bridgedFromETH),
  },
  theta: {
    ethereum: bridgedSupply("theta", 6, chainContracts.theta.bridgedFromETH),
  },
  rsk: {
    ethereum: sumMultipleBalanceFunctions(
      [
        bridgedSupply("rsk", 6, chainContracts.rsk.bridgedFromETH6Decimals),
        bridgedSupply("rsk", 18, chainContracts.rsk.bridgedFromETH18Decimals),
      ],
      "peggedUSD"
    ),
  },
  reinetwork: {
    ethereum: reinetworkBridged(chainContracts.reinetwork.bridgedFromETH[0], 6),
  },
  loopring: {
    ethereum: supplyInEthereumBridge(
      chainContracts.ethereum.issued[0],
      chainContracts.loopring.bridgeOnETH[0],
      6
    ),
  },
  zksync: {
    ethereum: supplyInEthereumBridge(
      chainContracts.ethereum.issued[0],
      chainContracts.zksync.bridgeOnETH[0],
      6
    ),
  },
  osmosis: {
    ethereum: osmosisSupply(chainContracts.osmosis.bridgedFromETH, 6, "Axelar"),
    noble: osmosisSupply(chainContracts.osmosis.bridgedFromNoble, 6, "Noble"),
  },
  fantom: {
    ethereum: bridgedSupply("fantom", 6, chainContracts.fantom.bridgedFromETH),
    solana: bridgedSupply("fantom", 6, chainContracts.fantom.bridgedFromSol),
  },
  dfk: {
    ethereum: bridgedSupply("dfk", 18, chainContracts.dfk.bridgedFromETH),
  },
  celo: {
    minted: chainMinted("celo", 6),
    ethereum: sumMultipleBalanceFunctions(
      [
        bridgedSupply("celo", 6, chainContracts.celo.bridgedFromETH6Decimals),
        bridgedSupply("celo", 18, chainContracts.celo.bridgedFromETH18Decimals),
      ],
      "peggedUSD"
    ),
    avax: bridgedSupply("celo", 18, chainContracts.celo.bridgedFromAvax),
    polygon: bridgedSupply("celo", 6, chainContracts.celo.bridgedFromPolygon),
    solana: bridgedSupply("celo", 18, chainContracts.celo.bridgedFromSol),
  },
  kava: {
    ethereum: kavaBridged(),
  },
  karura: {
    ethereum: karuraMinted(chainContracts.karura.bridgedFromETH[0], 6),
  },
  /*
  ontology: {
    ethereum: ontologyBridged(),
  },*/
  sx: {
    ethereum: bridgedSupply("sx", 6, chainContracts.sx.bridgedFromETH),
  },
  ethereumclassic: {
    ethereum: bridgedSupply(
      "ethereumclassic",
      6,
      chainContracts.ethereumclassic.bridgedFromETH
    ),
  },
  wan: {
    ethereum: bridgedSupply("wan", 6, chainContracts.wan.bridgedFromETH),
  },
  near: {
    minted: nearMint(chainContracts.near.issued[0], 6),
    ethereum: nearBridged(chainContracts.near.bridgedFromETH[0], 6),
  },
  defichain: {
    ethereum: supplyInEthereumBridge(
      chainContracts.ethereum.issued[0],
      chainContracts.defichain.bridgeOnETH[0],
      6
    ),
  },
  klaytn: {
    ethereum: bridgedSupply("klaytn", 6, chainContracts.klaytn.bridgedFromETH),
  },
  elrond: { // both amounts end up as USDC-c76f1f
    ethereum: elrondBridged("ETHUSDC-220753", 6),
    bsc: elrondBridged("BSCUSDC-887875", 18),
  },
  canto: {
    ethereum: bridgedSupply("canto", 6, chainContracts.canto.bridgedFromETH),
  },
  everscale: {
    ethereum: supplyInEthereumBridge(
      chainContracts.ethereum.issued[0],
      chainContracts.everscale.bridgeOnETH[0],
      6
    ),
  },
  dogechain: {
    ethereum: bridgedSupply(
      "dogechain",
      6,
      chainContracts.dogechain.bridgedFromETH
    ),
  },
  kadena: {
    ethereum: supplyInEthereumBridge(
      chainContracts.ethereum.issued[0],
      chainContracts.kadena.bridgeOnETH[0],
      6
    ),
  },
  kardia: {
    ethereum: bridgedSupply("kardia", 6, chainContracts.kardia.bridgedFromETH),
  },
  arbitrum_nova: {
    ethereum: bridgedSupply(
      "arbitrum_nova",
      6,
      chainContracts.arbitrum_nova.bridgedFromETH
    ),
  },
  aptos: {
    minted: circleAPIChainMinted("APTOS"),
    ethereum: aptosBridged(),
  },
  mixin: {
    ethereum: mixinSupply(chainContracts.mixin.ethAssetIds, "Ethereum"),
    polygon: mixinSupply(chainContracts.mixin.polygonAssetIds, "Polygon"),
    bsc: mixinSupply(chainContracts.mixin.BSCAssetIds, "BSC"),
  },
  thundercore: {
    ethereum: bridgedSupply(
      "thundercore",
      6,
      chainContracts.thundercore.bridgedFromETH
    ),
  },
  base: {
    minted: chainMinted("base", 6),
    ethereum: bridgedSupply("base", 6, chainContracts.base.bridgedFromETH),
  },
  /* kujira: {
     ethereum: kujiraSupply(chainContracts.kujira.bridgedFromETH, 6, "Axelar"),
     noble: kujiraSupply(chainContracts.kujira.bridgedFromNoble, 6, "Noble"),
   },*/
  waves: {
    ethereum: supplyInEthereumBridge(
      chainContracts.ethereum.issued[0],
      chainContracts.waves.bridgeOnETH[0],
      6
    ),
  },
  sui: {
    minted: suiMinted,
    ethereum: suiBridged("ETH"),
    bsc: suiBridged("BSC"),
    solana: suiBridged("SOLANA"),
    arbitrum: suiBridged("ARBITRUM_BRIDGED"),
  },
  starknet: {
    ethereum: supplyInEthereumBridge(
      chainContracts.ethereum.issued[0],
      chainContracts.starknet.bridgeOnETH[0],
      6
    ),
  },
  mode: {
    ethereum: bridgedSupply("mode", 6, chainContracts.mode.bridgedFromETH),
  },
  manta: {
    ethereum: bridgedSupply("manta", 6, chainContracts.manta.bridgedFromETH),
  },
  pulse: {
    ethereum: bridgedSupply("pulse", 6, chainContracts.pulse.bridgedFromETH),
  },
  imx: {
    ethereum: supplyInEthereumBridge(
      chainContracts.ethereum.issued[0],
      chainContracts.imx.bridgeOnETH[0],
      6
    ),
  },
  iotex: {
    ethereum: bridgedSupply("iotex", 6, chainContracts.iotex.bridgedFromETH),
  },
  icp: {
    ethereum: supplyInEthereumBridge('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', '0xb25eA1D493B49a1DeD42aC5B1208cC618f9A9B80', 6),
  },
  scroll: {
    ethereum: bridgedSupply("scroll", 6, chainContracts.scroll.bridgedFromETH),
  },
  taiko: {
    ethereum: bridgedSupply("taiko", 6, chainContracts.taiko.bridgedFromETH),
  },
  mantle: {
    ethereum: bridgedSupply("mantle", 6, chainContracts.mantle.bridgedFromETH),
  },
  linea: {
    ethereum: bridgedSupply("linea", 6, chainContracts.linea.bridgedFromETH),
  },
  injective: {
    noble: cosmosSupply('injective', ['ibc/2CBC2EA121AE42563B08028466F37B600F2D7D4282342DE938283CC3FB2BC00E'], 6, 'noble'),
  },
  noble: {
    minted: circleAPIChainMinted("NOBLE"),
  },
  flow: {
    ethereum: bridgedSupply("flow", 6, chainContracts.flow.bridgedFromETH),
  },
  polkadot: {
    minted: circleAPIChainMinted("PAH"),
  },
  morph: {
    ethereum: supplyInEthereumBridge(
      chainContracts.ethereum.issued[0],
      chainContracts.morph.bridgeOnETH[0],
      6
    )
  },
  occ: {
    ethereum: bridgedSupply("occ", 6, chainContracts.occ.bridgedFromETH),
  },
  hyperliquid: {
    arbitrum: supplyInArbitrumBridge(
      chainContracts.arbitrum.issued[0],
      chainContracts.hyperliquid.bridgeOnARB[0],
      6
    ),
  },
  sonic: {
    ethereum: bridgedSupply("sonic", 6, chainContracts.sonic.bridgedFromETH),
  },
  soneium: {
    ethereum: bridgedSupply("soneium", 6, chainContracts.soneium.bridgedFromETH),
  },
  unichain: {
    minted: chainMinted("unichain", 6),
  },
  superposition: {
    ethereum: bridgedSupply("spn", 6, chainContracts.superposition.bridgedFromETH),
  },
  lisk: {
    ethereum: bridgedSupply("lisk", 6, chainContracts.lisk.bridgedFromETH),
  },
  xai: {
    ethereum: bridgedSupply("xai", 6, chainContracts.xai.bridgedFromETH),
  },
  zircuit: {
    ethereum: bridgedSupply("zircuit", 6, chainContracts.zircuit.bridgedFromETH),
  },
  wc: {
    ethereum: bridgedSupply("wc", 6, chainContracts.wc.bridgedFromETH),
  },
  shape: {
    ethereum: bridgedSupply("shape", 6, chainContracts.shape.bridgedFromETH),
  },
  btr: {
    ethereum: bridgedSupply("btr", 6, chainContracts.btr.bridgedFromETH),
  },
  /*galxe: {
    ethereum: bridgedSupply("galxe", 6, chainContracts.galxe.bridgedFromETH),
  },
  vitruveo: {
    ethereum: bridgedSupply("vitruveo", 6, chainContracts.vitruveo.bridgedFromPolygon),
  },*/
  zkfair: {
    ethereum: bridgedSupply("zkfair", 18, chainContracts.zkfair.bridgedFromETH),
  },
  wemix: {
    ethereum: bridgedSupply("wemix", 6, chainContracts.wemix.bridgedFromETH),
  },
  kroma: {
    ethereum: bridgedSupply("kroma", 6, chainContracts.kroma.bridgedFromETH),
  },
  berachain: {
    ethereum: bridgedSupply("berachain", 6, chainContracts.berachain.bridgedFromETH),
  },
  core: {
    ethereum: bridgedSupply("core", 6, chainContracts.core.bridgedFromETH),
  },
  cronos: {
    ethereum: bridgedSupply("cronos", 6, chainContracts.cronos.bridgedFromETH),
  },
  bsquared: {
    ethereum: bridgedSupply("bsquared", 6, chainContracts.bsquared.bridgedFromETH),
  },
  bob: {
    ethereum: bridgedSupply("bob", 6, chainContracts.bob.bridgedFromETH),
  },
  ink: {
    ethereum: bridgedSupply("ink", 6, chainContracts.ink.bridgedFromETH, "stargate"),
  },
  nibiru: {
    ethereum: nibiruBridged(),
  },
  sei: {
    noble: bridgedSupply("sei", 6, chainContracts.sei.bridgedFromNoble),
    minted: circleAPIChainMinted("SEI"),
  },
  corn: {
    ethereum: bridgedSupply("corn", 6, chainContracts.corn.bridgedFromETH),
  },
  xlayer: {
    ethereum: bridgedSupply("xlayer", 6, chainContracts.xlayer.bridgedFromETH),
  },
  abstract: {
    ethereum: bridgedSupply("abstract", 6, chainContracts.abstract.bridgedFromETH, "stargate"),
  },
  flare: {
    ethereum: bridgedSupply("flare", 6, chainContracts.flare.bridgedFromETH, "stargate"),
  },
  xdc: {
    minted: chainMinted("xdc", 6),
    ethereum: supplyInEthereumBridge(
      chainContracts.ethereum.issued[0],
      chainContracts.xdc.bridgeOnETH[0],
      6
    ),
    arbitrum: supplyInArbitrumBridge(
      chainContracts.arbitrum.issued[0],
      chainContracts.xdc.bridgeOnARB[0],
      6
    )
  },
  move: {
    ethereum: moveSupply,
  },
  hemi: {
    ethereum: bridgedSupply("hemi", 6, chainContracts.hemi.bridgedFromETH, "stargate"),
  },
  plume_mainnet: {
    ethereum: bridgedSupply("plume_mainnet", 6, chainContracts.plume_mainnet.bridgedFromETH),
  },
  story: {
    ethereum: bridgedSupply("sty", 6, chainContracts.story.bridgedFromETH, "stargate"),
  },
  nero: {
    arbitrum: bridgedSupply("nero", 6, chainContracts.nero.bridgedFromARB, "VIA Labs"),
  },
  perennial: {
    ethereum: bridgedSupply("perennial", 6, chainContracts.perennial.bridgedFromETH, "conduit"),
  },
  apechain: {
    ethereum: bridgedSupply("apechain", 6, chainContracts.apechain.bridgedFromETH, "stargate"),
  },
  glue: {
    ethereum: bridgedSupply("glue", 6, chainContracts.glue.bridgedFromETH, "stargate"),
  },
  goat: {
    ethereum: bridgedSupply("goat", 6, chainContracts.goat.bridgedFromETH, "stargate"),
  },
  ripple: {
    minted: rippleMinted(),
  },
  cardano: {
    ethereum: getCardanoSupply(),
  },
};

export default adapter;
