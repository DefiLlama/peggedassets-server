const sdk = require("@defillama/sdk");
import {
  sumMultipleBalanceFunctions,
  sumSingleBalance,
} from "../helper/generalUtil";
import {
  bridgedSupply,
  supplyInEthereumBridge,
  solanaMintedOrBridged,
  terraSupply,
  osmosisSupply,
} from "../helper/getSupply";
import {
  getTotalSupply as ontologyGetTotalSupply,
  getBalance as ontologyGetBalance,
} from "../helper/ontology";
import { getTotalSupply as kavaGetTotalSupply } from "../helper/kava";
import { call as nearCall } from "../llama-helper/near";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
  PeggedAssetType,
} from "../peggedAsset.type";
import { mixinSupply } from "../helper/mixin";
import { chainContracts } from "./config";
const axios = require("axios");
const retry = require("async-retry");

/*
Sora: can't find API call that works 0x0001d8f1f93b103d8619d367dbecea3182e5546bea164355fe7decc8be301f63

Cronos: they have not provided any proof the circulating DAI is real DAI.

Possible multichain destinations that were missed missed: etc (can't find address), conflux,
fusion (has 0 supply?), oasis (can't find address), rei (can't find address)

Orbit: has no provider, no API.

Conflux: don't know how to get calls to work. 0x74eaE367d018A5F29be559752e4B67d01cc6b151 (celer),
0x87929dda85a959f52cab6083a2fba1b9973f15e0 (don't know source)

Evmos: can't find multichain contract, no liquidity on dexes.
*/

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
      const dsr = (
        await sdk.api.abi.call({
          abi: {
            constant: true,
            inputs: [{ internalType: "address", name: "", type: "address" }],
            name: "dai",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            payable: false,
            stateMutability: "view",
            type: "function",
          },
          target: "0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b",
          block: _chainBlocks?.[chain],
          chain: chain,
          params: ["0x197E90f9FAD81970bA7976f33CbD77088E5D7cf7"],
        })
      ).output;
      sumSingleBalance(
        balances,
        "peggedUSD",
        (Number(totalSupply) + dsr / 1e27) / 10 ** decimals,
        "issued",
        false
      );
    }
    return balances;
  };
}

async function fromETH(
  owner: string,
  decimals: number,
  pegType?: PeggedAssetType
) {
  const targets = [
    "0x83F20F44975D03b1b09e64809B757c47f942BEeA",
    "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  ];

  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    let assetPegType = pegType ? pegType : ("peggedUSD" as PeggedAssetType);

    for (const target of targets) {
      let bridged = (
        await sdk.api.erc20.balanceOf({
          target: target,
          owner: owner,
          block: _ethBlock,
        })
      ).output;
      if (target === "0x83F20F44975D03b1b09e64809B757c47f942BEeA") {
        bridged = (
          await sdk.api.abi.call({
            target: target,
            abi: "function convertToAssets(uint256 shares) public view returns (uint256)",
            params: [bridged],
            block: _ethBlock,
          })
        ).output;
      }

      sumSingleBalance(
        balances,
        assetPegType,
        bridged / 10 ** decimals,
        target,
        false
      );
    }

    return balances;
  };
}

async function reinetworkMinted(address: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const res = await retry(
      async (_bail: any) =>
        await axios.get(
          `https://scan.rei.network/api?module=token&action=getToken&contractaddress=${address}`
        )
    );
    const totalSupply = parseInt(res.data.result.totalSupply) / 10 ** decimals;
    sumSingleBalance(balances, "peggedUSD", totalSupply, address, true);
    return balances;
  };
}

async function ontologyBridged() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const polyDAIAddress = chainContracts.ontology.bridgedFromETH[0];
    const polyDAIReserveAddress = chainContracts.ontology.unreleased[0];
    const polyNetworkSupply = await ontologyGetTotalSupply(
      polyDAIAddress,
      "oep4"
    );
    const polyNetworkReserve = await ontologyGetBalance(
      polyDAIAddress,
      "oep4",
      polyDAIReserveAddress
    );
    sumSingleBalance(
      balances,
      "peggedUSD",
      polyNetworkSupply - polyNetworkReserve,
      polyDAIAddress,
      true
    );
    return balances;
  };
}

async function nearBridged(address: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
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

async function kavaBridged() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    for (const contract of chainContracts.kava.bridgedFromETH) {
      const totalSupply = await kavaGetTotalSupply(contract);
      sumSingleBalance(balances, "peggedUSD", totalSupply, contract, true);
    }
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: chainMinted("ethereum", 18),
    unreleased: async () => ({}),
  },
  solana: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: solanaMintedOrBridged(chainContracts.solana.bridgedFromETH),
    polygon: solanaMintedOrBridged(chainContracts.solana.bridgedFromPolygon),
    avalanche: solanaMintedOrBridged(chainContracts.solana.bridgedFromAvax),
    fantom: solanaMintedOrBridged(chainContracts.solana.bridgedFromFantom),
  },
  polygon: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "polygon",
      18,
      chainContracts.polygon.bridgedFromETH
    ),
  },
  bsc: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("bsc", 18, chainContracts.bsc.bridgedFromETH),
  },
  optimism: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "optimism",
      18,
      chainContracts.optimism.bridgedFromETH,
      "optimism",
      "Ethereum"
    ),
  },
  harmony: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    /* hacked, trading at $0.06
    ethereum: bridgedSupply(
      "harmony",
      18,
      chainContracts.harmony.bridgedFromETH
    ),
     */
  },
  avalanche: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("avax", 18, chainContracts.avax.bridgedFromETH),
  },
  arbitrum: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "arbitrum",
      18,
      chainContracts.arbitrum.bridgedFromETH,
      "arbitrum",
      "Ethereum"
    ),
  },
  moonriver: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "moonriver",
      18,
      chainContracts.moonriver.bridgedFromETH
    ),
  },
  aurora: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    near: bridgedSupply("aurora", 18, chainContracts.aurora.bridgedFromNear),
  },
  fantom: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("fantom", 18, chainContracts.fantom.bridgedFromETH),
  },
  moonbeam: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "moonbeam",
      18,
      chainContracts.moonbeam.bridgedFromETH
    ),
  },
  syscoin: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "syscoin",
      18,
      chainContracts.syscoin.bridgedFromETH
    ),
  },
  milkomeda: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "milkomeda",
      18,
      chainContracts.milkomeda.bridgedFromETH
    ),
  },
  astar: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("astar", 18, chainContracts.astar.bridgedFromETH),
  },
  oasis: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("oasis", 18, chainContracts.oasis.bridgedFromETH),
  },
  evmos: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("evmos", 18, chainContracts.evmos.bridgedFromETH),
  },
  xdai: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: fromETH("0x4aa42145Aa6Ebf72e164C9bBC74fbD3788045016", 18),
    bsc: bridgedSupply("xdai", 18, chainContracts.xdai.bridgedFromBSC),
  },
  terra: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: terraSupply(chainContracts.terra.bridgedFromETH, 8),
  },
  rsk: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("rsk", 18, chainContracts.rsk.bridgedFromETH),
  },
  /* 0 supply, historically has not exceeded $25
  reinetwork: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: reinetworkMinted(chainContracts.reinetwork.bridgedFromETH[0], 18),
  },
  */
  loopring: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: supplyInEthereumBridge(
      chainContracts.ethereum.issued[0],
      chainContracts.loopring.bridgeOnETH[0],
      18
    ),
  },
  zksync: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: supplyInEthereumBridge(
      chainContracts.ethereum.issued[0],
      chainContracts.zksync.bridgeOnETH[0],
      18
    ),
  },
  aztec: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: sumMultipleBalanceFunctions(
      [
        supplyInEthereumBridge(
          chainContracts.ethereum.issued[0],
          chainContracts.aztec.bridgeOnETH[0],
          18
        ),
        supplyInEthereumBridge(
          chainContracts.ethereum.issued[0],
          chainContracts.aztec.bridgeOnETH[1],
          18
        ),
      ],
      "peggedUSD"
    ),
  },
  velas: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("velas", 18, chainContracts.velas.bridgedFromETH),
  },
  kcc: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("kcc", 18, chainContracts.kcc.bridgedFromETH),
  },
  shiden: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("shiden", 18, chainContracts.shiden.bridgedFromETH),
  },
  boba: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("boba", 18, chainContracts.boba.bridgedFromETH),
  },
  osmosis: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: osmosisSupply(
      chainContracts.osmosis.bridgedFromETH,
      18,
      "Axelar"
    ),
  },
  starknet: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: supplyInEthereumBridge(
      chainContracts.ethereum.issued[0],
      chainContracts.starknet.bridgeOnETH[0],
      18
    ),
  },
  /*
  ontology: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: ontologyBridged(),
  },
  */
  sx: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("sx", 18, chainContracts.sx.bridgedFromETH),
  },
  /*
  ethereumclassic: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "ethereumclassic",
      18,
      chainContracts.ethereumclassic.bridgedFromETH
    ),
  },
  */
  near: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: nearBridged(chainContracts.near.bridgedFromETH[0], 18),
  },
  klaytn: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("klaytn", 18, chainContracts.klaytn.bridgedFromETH),
  },
  everscale: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: supplyInEthereumBridge(
      chainContracts.ethereum.issued[0],
      chainContracts.everscale.bridgeOnETH[0],
      18
    ),
  },

  dogechain: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    /*ethereum: bridgedSupply(
      "dogechain",
      18,
      chainContracts.dogechain.bridgedFromETH
    ),*/
  },
  
  thundercore: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "thundercore",
      18,
      chainContracts.thundercore.bridgedFromETH
    ),
  },
  metis: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("metis", 18, chainContracts.metis.bridgedFromETH),
  },
  arbitrum_nova: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "arbitrum_nova",
      18,
      chainContracts.arbitrum_nova.bridgedFromETH
    ),
  },
  /*
  kava: { broke the adapter
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: kavaBridged(), 
  },
  */
  mixin: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: mixinSupply(chainContracts.mixin.ethAssetIds, "Ethereum"),
  },
  era: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("era", 18, chainContracts.era.bridgedFromETH),
  },
  pulse: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("pulse", 18, chainContracts.pulse.bridgedFromETH),
  },
};

export default adapter;
