import type { PeggedAsset } from "./types";

export type { PeggedAsset };

export const peggedCategoryList = ["stablecoins"]; // this should include all strings from union type PeggedCategory

/*
`chain` is the first chain of a protocol we tracked at defillama,
  so if a protocol launches on Ethereum and we start tracking it there, and then it launches on polygon and
  we start tracking it on both polygon and ethereum, then `chain` should be set to `Ethereum`.

`chains` is not used by the current code, but good to fill it out because it is used in our test to detect errors
*/

export default [
  {
    id: "1",
    name: "Tether",
    address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    symbol: "USDT",
    url: "https://tether.to/",
    description:
      "Tether tokens offer the stability and simplicity of fiat currencies coupled with the innovative nature of blockchain technology, representing a perfect combination of both worlds.",
    chain: "Ethereum",
    gecko_id: "tether",
    cmcId: "825",
    category: "stablecoins", // is for the frontend
    pegType: "peggedUSD", // should match balance key returned by adapter
    priceSource: "chainlink",
    chains: [
      "Ethereum",
      "Polygon",
      "BSC",
      "Avalanche",
      "Solana",
      "Arbitrum",
      "Optimism",
      "Boba",
      "Metis",
      "Moonbeam",
      "KCC",
      "Moonriver",
      "Harmony",
      "Syscoin",
      "Heco",
      "OKExChain",
      "IoTeX",
      "Omni",
      "Aurora",
      "Algorand",
      "Milkomeda",
      "Kardia",
      "Telos",
      "Fuse",
      "TomoChain",
      "Meter",
      "Tron",
      "Liquidchain",
      "Bittorrent",
      "Crab",
      "EOS",
      "Statemine",
      "Evmos",
      "Oasis",
      "Terra",
      "Astar",
      "Gnosis",
      "Theta",
      "RSK",
      "REINetwork",
      "Loopring",
      "zkSync",
      "Shiden",
      "Fantom",
    ],
    bridges: {
      Ethereum: {
        bridge: "Portal by Wormhole",
        link: "https://wormholenetwork.com/",
      },
      Solana: {
        bridge: "Portal by Wormhole",
        link: "https://wormholenetwork.com/",
      },
      BSC: {
        bridge: "BSC Bridge",
        link: "https://www.binance.com/",
      },
      Heco: {
        bridge: "HECO Chain Bridge",
        link: "https://www.hecochain.com/",
      },
      Avalanche: {
        bridge: "Avalanche Bridge",
        link: "https://bridge.avax.network/",
      },
      OKExChain: {
        bridge: "OKX Bridge",
        link: "https://www.okx.com/okx-bridge",
      },
      Polygon: {
        bridge: "Polygon PoS Bridge",
        link: "https://polygon.technology/",
      },
      Arbitrum: {
        bridge: "Arbitrum L1 Custom Gateway",
        link: "https://arbitrum.io/",
      },
      Aurora: {
        bridge: "NEAR Rainbow Bridge",
        link: "https://rainbowbridge.app/",
      },
      Harmony: {
        bridge: "Horizon Bridge by Harmony",
        link: "https://bridge.harmony.one/",
      },
      Metis: {
        bridge: "Metis Andromeda Bridge",
        link: "https://www.metis.io/",
      },
      KCC: {
        bridge: "Kucoin Bridge",
        link: "https://www.Kucoin.io/",
      },
      Moonriver: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Optimism: {
        bridge: "Optimism Bridge",
        link: "https://app.optimism.io/bridge",
      },
      Moonbeam: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Milkomeda: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Boba: {
        bridge: "Boba Gateway",
        link: "https://gateway.boba.network/",
      },
      IoTeX: {
        bridge: "ioTube V5",
        link: "https://iotube.org/",
      },
      Kardia: {
        bridge: "KAI Bridge",
        link: "https://bridge.kaidex.io/",
      },
      Telos: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Fuse: {
        bridge: "Fuse Bridge",
        link: "https://voltage.finance/",
      },
      TomoChain: {
        bridge: "TomoBridge",
        link: "https://bridge.TomoChain.com/",
      },
      Meter: {
        bridge: "Meter Passport",
        link: "https://passport.meter.io/",
      },
      Syscoin: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Oasis: {
        bridge: "EVODeFi",
        link: "https://bridge.evodefi.com/",
      },
      Bittorrent: {
        bridge: "Bittorrent Bridge",
        link: "https://bttc.bittorrent.com/",
      },
      Evmos: {
        bridge: "Celer cBridge",
        link: "https://cbridge.celer.network/",
      },
      Terra: {
        bridge: "Portal by Wormhole",
        link: "https://wormholenetwork.com/",
      },
      Crab: {
        bridge: "Celer cBridge",
        link: "https://cbridge.celer.network/",
      },
      Astar: {
        bridge: "Celer cBridge",
        link: "https://cbridge.celer.network/",
      },
      Gnosis: {
        bridge: "Gnosis Chain OmniBridge",
        link: "https://omni.gnosischain.com/",
      },
      Theta: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      RSK: {
        bridge: "RSK Token Bridge",
        link: "https://tokenbridge.rsk.co/",
      },
      REINetwork: {
        bridge: "Celer cBridge",
        link: "https://cbridge.celer.network/",
      },
      Loopring: {
        bridge: "Loopring",
        link: "https://loopring.org/",
      },
      zkSync: {
        bridge: "zkSync",
        link: "https://zksync.io/",
      },
      Shiden: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Fantom: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
    },
    twitter: "https://twitter.com/Tether_to",
  },
  {
    id: "2",
    name: "USD Coin",
    address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    symbol: "USDC",
    url: "https://www.circle.com/usdc/",
    description: "Digital dollars for global business.",
    chain: "Ethereum",
    gecko_id: "usd-coin",
    cmcId: "3408",
    category: "stablecoins",
    pegType: "peggedUSD",
    priceSource: "chainlink",
    chains: [
      "Ethereum",
      "Polygon",
      "BSC",
      "Solana",
      "Avalanche",
      "Arbitrum",
      "Optimism",
      "Boba",
      "Metis",
      "KCC",
      "Moonriver",
      "Harmony",
      "OKExChain",
      "Moonbeam",
      "Syscoin",
      "TomoChain",
      "Ronin",
      "Aurora",
      "Fuse",
      "Meter",
      "Telos",
      "Milkomeda",
      "Elastos",
      "Algorand",
      "Tron",
      "Terra",
      "Oasis",
      "Crab",
      "Evmos",
      "Astar",
      "Hedera",
      "Stellar",
      "Flow",
      "Gnosis",
      "Theta",
      "RSK",
      "REINetwork",
      "Loopring",
      "zkSync",
      "Shiden",
      "Fantom",
      "DFK",
    ],
    bridges: {
      Ethereum: {
        bridge: "Portal by Wormhole",
        link: "https://wormholenetwork.com/",
      },
      Solana: {
        bridge: "Portal by Wormhole",
        link: "https://wormholenetwork.com/",
      },
      Polygon: {
        bridge: "Polygon PoS Bridge",
        link: "https://polygon.technology/",
      },
      BSC: {
        bridge: "BSC Bridge",
        link: "https://www.binance.com/",
      },
      Avalanche: {
        bridge: "Avalanche Bridge",
        link: "https://bridge.avax.network/",
      },
      Harmony: {
        bridge: "Horizon Bridge by Harmony",
        link: "https://bridge.harmony.one/",
      },
      Arbitrum: {
        bridge: "Arbitrum L1 Custom Gateway",
        link: "https://arbitrum.io/",
      },
      OKExChain: {
        bridge: "OKX Bridge",
        link: "https://www.okx.com/okx-bridge",
      },
      Moonriver: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Moonbeam: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Boba: {
        bridge: "Boba Gateway",
        link: "https://gateway.boba.network/",
      },
      Optimism: {
        bridge: "Optimism Bridge",
        link: "https://app.optimism.io/bridge",
      },
      Metis: {
        bridge: "Metis Andromeda Bridge",
        link: "https://www.metis.io/",
      },
      KCC: {
        bridge: "Kucoin Bridge",
        link: "https://www.Kucoin.io/",
      },
      Syscoin: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      TomoChain: {
        bridge: "TomoBridge",
        link: "https://bridge.TomoChain.com/",
      },
      Ronin: {
        bridge: "Ronin Bridge",
        link: "https://bridge.roninchain.com/",
      },
      Aurora: {
        bridge: "NEAR Rainbow Bridge",
        link: "https://rainbowbridge.app/",
      },
      Fuse: {
        bridge: "Fuse Bridge",
        link: "https://voltage.finance/",
      },
      Meter: {
        bridge: "Meter Passport",
        link: "https://passport.meter.io/",
      },
      Telos: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Milkomeda: {
        // may need to be updated
        bridge: "Celer cBridge",
        link: "https://cbridge.celer.network/",
      },
      Elastos: {
        bridge: "ShadowTokens",
        link: "https://tokbridge.net/",
      },
      Terra: {
        bridge: "Portal by Wormhole",
        link: "https://wormholenetwork.com/",
      },
      Oasis: {
        bridge: "Portal by Wormhole",
        link: "https://wormholenetwork.com/",
      },
      Crab: {
        bridge: "Celer cBridge",
        link: "https://cbridge.celer.network/",
      },
      Evmos: {
        bridge: "Celer cBridge",
        link: "https://cbridge.celer.network/",
      },
      Astar: {
        bridge: "Celer cBridge",
        link: "https://cbridge.celer.network/",
      },
      Gnosis: {
        bridge: "Gnosis Chain OmniBridge",
        link: "https://omni.gnosischain.com/",
      },
      Theta: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      RSK: {
        bridge: "RSK Token Bridge",
        link: "https://tokenbridge.rsk.co/",
      },
      REINetwork: {
        bridge: "Celer cBridge",
        link: "https://cbridge.celer.network/",
      },
      Loopring: {
        bridge: "Loopring",
        link: "https://loopring.org/",
      },
      zkSync: {
        bridge: "zkSync",
        link: "https://zksync.io/",
      },
      Shiden: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Fantom: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      DFK: {
        name: "Synapse Bridge",
        link: "https://synapseprotocol.com/",
      },
    },
    twitter: "",
  },
  {
    id: "3",
    name: "TerraUSD",
    address: "",
    symbol: "UST",
    url: "https://www.terra.money/",
    description: "Programmable money for the internet.",
    chain: "Terra",
    gecko_id: "terrausd",
    cmcId: "7129",
    category: "stablecoins",
    pegType: "peggedUSD",
    priceSource: "chainlink",
    chains: [
      "Terra",
      "Ethereum",
      "Polygon",
      "BSC",
      "Solana",
      "Harmony",
      "Fantom",
      "Aurora",
      "Avalanche",
      "Osmosis",
      "Moonbeam",
      "Oasis",
      "Celo",
      "Fuse",
      "Arbitrum",
      "Optimism",
      "Metis",
      "DFK",
    ],
    bridges: {
      Ethereum: {
        bridge: "Portal by Wormhole",
        link: "https://wormholenetwork.com/",
      },
      BSC: {
        bridge: "Terra Shuttle Bridge",
        link: "https://bridge.terra.money/",
      },
      Harmony: {
        bridge: "Terra Shuttle Bridge",
        link: "https://bridge.terra.money/",
      },
      Aurora: {
        bridge: "Allbridge",
        link: "https://allbridge.io/",
      },
      Polygon: {
        bridge: "Portal by Wormhole",
        link: "https://wormholenetwork.com/",
      },
      Solana: {
        bridge: "Portal by Wormhole",
        link: "https://wormholenetwork.com/",
      },
      Fantom: {
        bridge: "Portal by Wormhole",
        link: "https://wormholenetwork.com/",
      },
      Avalanche: {
        bridge: "Portal by Wormhole",
        link: "https://wormholenetwork.com/",
      },
      Osmosis: {
        bridge: "Terra Shuttle Bridge",
        link: "https://bridge.terra.money/",
      },
      Moonbeam: {
        bridge: "Axelar",
        link: "https://axelar.network/",
      },
      Oasis: {
        bridge: "Portal by Wormhole",
        link: "https://wormholenetwork.com/",
      },
      Celo: {
        bridge: "Allbridge",
        link: "https://allbridge.io/",
      },
      Fuse: {
        bridge: "Allbridge",
        link: "https://allbridge.io/",
      },
      Arbitrum: {
        name: "Synapse Bridge",
        link: "https://synapseprotocol.com/",
      },
      Optimism: {
        name: "Synapse Bridge",
        link: "https://synapseprotocol.com/",
      },
      Metis: {
        name: "Synapse Bridge",
        link: "https://synapseprotocol.com/",
      },
      DFK: {
        name: "Synapse Bridge",
        link: "https://synapseprotocol.com/",
      },
    },
    twitter: "https://twitter.com/terra_money",
  },
  {
    id: "4",
    name: "Binance USD",
    address: "0x4fabb145d64652a948d72533023f6e7a623c7c53",
    symbol: "BUSD",
    url: "https://www.binance.com/en/busd",
    description:
      "BUSD is a 1:1 USD-backed stablecoin approved by the New York State Department of Financial Services (NYDFS), issued in partnership with Paxos.",
    chain: "Ethereum",
    gecko_id: "binance-usd",
    cmcId: "4687",
    category: "stablecoins",
    pegType: "peggedUSD",
    priceSource: "chainlink",
    chains: [
      "Ethereum",
      "BSC",
      "Avalanche",
      "Harmony",
      "IoTeX",
      "OKExChain",
      "Moonriver",
      "Solana",
      "Polygon",
      "Fuse",
      "Meter",
      "Moonbeam",
      "Milkomeda",
      "Elastos",
      "Aurora",
      "Oasis",
      "Terra",
      "Shiden",
      "Astar",
      "Evmos",
      "Syscoin",
      "Boba",
      "Metis",
      "Fantom",
      "KCC",
      "RSK",
      "Theta",
    ],
    bridges: {
      Ethereum: {
        bridge: "Portal by Wormhole",
        link: "https://wormholenetwork.com/",
      },
      BSC: {
        bridge: "BSC Bridge",
        link: "https://www.binance.com/",
      },
      Avalanche: {
        bridge: "Avalanche Bridge",
        link: "https://bridge.avax.network/",
      },
      Solana: {
        bridge: "Portal by Wormhole",
        link: "https://wormholenetwork.com/",
      },
      Harmony: {
        bridge: "Horizon Bridge by Harmony",
        link: "https://bridge.harmony.one/",
      },
      IoTeX: {
        bridge: "ioTube V5",
        link: "https://iotube.org/",
      },
      OKExChain: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Moonriver: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Polygon: {
        bridge: "Portal by Wormhole",
        link: "https://wormholenetwork.com/",
      },
      Fuse: {
        bridge: "Fuse Bridge",
        link: "https://voltage.finance/",
      },
      Meter: {
        bridge: "Meter Passport",
        link: "https://passport.meter.io/",
      },
      Moonbeam: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Milkomeda: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Elastos: {
        bridge: "ShadowTokens",
        link: "https://tokbridge.net/",
      },
      Aurora: {
        bridge: "Allbridge",
        link: "https://allbridge.io/",
      },
      Terra: {
        bridge: "Portal by Wormhole",
        link: "https://wormholenetwork.com/",
      },
      Oasis: {
        bridge: "Portal by Wormhole",
        link: "https://wormholenetwork.com/",
      },
      Shiden: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Astar: {
        bridge: "Celer cBridge",
        link: "https://cbridge.celer.network/",
      },
      Evmos: {
        bridge: "Celer cBridge",
        link: "https://cbridge.celer.network/",
      },
      Syscoin: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Boba: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Metis: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Fantom: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      KCC: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      RSK: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Theta: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
    },
    twitter: "https://twitter.com/PaxosGlobal",
  },
  {
    id: "5",
    name: "Dai",
    address: "0x6b175474e89094c44da98b954eedeac495271d0f",
    symbol: "DAI",
    url: "https://makerdao.com/",
    description:
      "Dai is a stable, decentralized currency that does not discriminate. Any individual or business can realize the advantages of digital money.",
    chain: "Ethereum",
    gecko_id: "dai",
    cmcId: "4943",
    category: "stablecoins",
    pegType: "peggedUSD",
    priceSource: "chainlink",
    chains: [
      "Ethereum",
      "Solana",
      "Polygon",
      "BSC",
      "Optimism",
      "Harmony",
      "Avalanche",
      "Arbitrum",
      "Moonriver",
      "Aurora",
      "Fantom",
      "Moonbeam",
      "Syscoin",
      "Milkomeda",
      "Astar",
      "Oasis",
      "Evmos",
      "Gnosis",
      "Terra",
      "RSK",
      "REINetwork",
      "Loopring",
      "zkSync",
      "Aztec",
      "Velas",
      "Shiden",
      "Boba",
    ],
    bridges: {
      Solana: {
        bridge: "Portal by Wormhole",
        link: "https://wormholenetwork.com/",
      },
      Polygon: {
        bridge: "Polygon PoS Bridge",
        link: "https://polygon.technology/",
      },
      BSC: {
        bridge: "BSC Bridge",
        link: "https://www.binance.com/",
      },
      Optimism: {
        bridge: "Optimism Bridge",
        link: "https://app.optimism.io/bridge",
      },
      Harmony: {
        bridge: "Horizon Bridge by Harmony",
        link: "https://bridge.harmony.one/",
      },
      Avalanche: {
        bridge: "Avalanche Bridge",
        link: "https://bridge.avax.network/",
      },
      Arbitrum: {
        bridge: "Arbitrum L1 Custom Gateway",
        link: "https://arbitrum.io/",
      },
      Moonriver: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Aurora: {
        bridge: "NEAR Rainbow Bridge",
        link: "https://rainbowbridge.app/",
      },
      Fantom: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Moonbeam: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Syscoin: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Milkomeda: {
        bridge: "Celer cBridge",
        link: "https://cbridge.celer.network/",
      },
      Astar: {
        bridge: "Celer cBridge",
        link: "https://cbridge.celer.network/",
      },
      Oasis: {
        bridge: "Celer cBridge",
        link: "https://cbridge.celer.network/",
      },
      Evmos: {
        bridge: "Celer cBridge",
        link: "https://cbridge.celer.network/",
      },
      Gnosis: {
        bridge: "Gnosis Chain OmniBridge",
        link: "https://omni.gnosischain.com/",
      },
      Terra: {
        bridge: "Portal by Wormhole",
        link: "https://wormholenetwork.com/",
      },
      RSK: {
        bridge: "RSK Token Bridge",
        link: "https://tokenbridge.rsk.co/",
      },
      REINetwork: {
        bridge: "Celer cBridge",
        link: "https://cbridge.celer.network/",
      },
      Loopring: {
        bridge: "Loopring",
        link: "https://loopring.org/",
      },
      zkSync: {
        bridge: "zkSync",
        link: "https://zksync.io/",
      },
      Aztec: {
        bridge: "Aztec",
        link: "https://zk.money/",
      },
      Velas: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      KCC: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Shiden: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Boba: {
        bridge: "Boba Gateway",
        link: "https://gateway.boba.network/",
      },
    },
    twitter: "https://twitter.com/MakerDAO",
  },
  {
    id: "6",
    name: "Frax",
    address: "0x853d955acef822db058eb8505911ed77f175b99e",
    symbol: "FRAX",
    url: "https://frax.finance/",
    description: "Frax is the world’s first fractional-algorithmic stablecoin.",
    chain: "Ethereum",
    gecko_id: "frax",
    cmcId: "6952",
    category: "stablecoins",
    pegType: "peggedUSD",
    priceSource: "chainlink",
    chains: [
      "Ethereum",
      "BSC",
      "Avalanche",
      "Arbitrum",
      "Aurora",
      "Boba",
      "Fantom",
      "Evmos",
      "Harmony",
      "Moonbeam",
      "Moonriver",
      "Optimism",
      "Polygon",
      "Solana",
      "zkSync",
      "Milkomeda",
    ],
    bridges: {
      BSC: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Avalanche: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Arbitrum: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Aurora: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Boba: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Fantom: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Evmos: {
        bridge: "Nomad",
        link: "https://www.nomad.xyz/",
      },
      Harmony: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Moonbeam: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Moonriver: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Optimism: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Polygon: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Solana: {
        bridge: "Portal by Wormhole",
        link: "https://wormholenetwork.com/",
      },
      zkSync: {
        bridge: "zkSync",
        link: "https://zksync.io/",
      },
      Milkomeda: {
        bridge: "Nomad",
        link: "https://www.nomad.xyz/",
      },
    },
    twitter: "https://twitter.com/fraxfinance",
  },
  {
    id: "7",
    name: "TrueUSD",
    address: "0x0000000000085d4780b73119b644ae5ecd22b376",
    symbol: "TUSD",
    url: "https://trueusd.com/",
    description:
      "The first regulated stablecoin fully backed by the US Dollar.",
    chain: "Ethereum",
    gecko_id: "true-usd",
    cmcId: "2563",
    category: "stablecoins",
    pegType: "peggedUSD",
    priceSource: "chainlink",
    chains: [
      "Ethereum",
      "BSC",
      "Avalanche",
      "Polygon",
      "Arbitrum",
      "Fantom",
      "Tron",
      "Syscoin",
      "Heco",
      "Cronos",
    ],
    bridges: {
      BSC: {
        bridge: "-",
      },
      Polygon: {
        bridge: "-",
      },
      Arbitrum: {
        bridge: "-",
      },
      Fantom: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Syscoin: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Heco: {
        bridge: "-",
      },
    },
    twitter: "https://twitter.com/tusdio",
  },
  {
    id: "8",
    name: "Liquity USD",
    address: "0x5f98805a4e8be255a32880fdec7f6728c6568ba0",
    symbol: "LUSD",
    url: "https://www.liquity.org/",
    description:
      "LUSD is an algorithmic, immutable, governance-free USD-pegged stablecoin used to pay out loans on the Liquity protocol. LUSD can be redeemed against the underlying Ether collateral at face value.",
    chain: "Ethereum",
    gecko_id: "liquity-usd",
    cmcId: "9566",
    category: "stablecoins",
    pegType: "peggedUSD",
    priceSource: "chainlink",
    chains: ["Ethereum", "Polygon", "Optimism"],
    bridges: {
      Polygon: {
        bridge: "Polygon PoS Bridge",
        link: "https://polygon.technology/",
      },
      Optimism: {
        bridge: "Optimism Bridge",
        link: "https://app.optimism.io/bridge",
      },
    },
    twitter: "https://twitter.com/LiquityProtocol",
  },
  {
    id: "9",
    name: "Fei USD",
    address: "0x956f47f50a910163d8bf957cf5846d573e7f87ca",
    symbol: "FEI",
    url: "https://fei.money/",
    description:
      "Fei is a decentralized, scalable, and DeFi-native stablecoin protocol.",
    chain: "Ethereum",
    gecko_id: "fei-usd",
    cmcId: "8642",
    category: "stablecoins",
    pegType: "peggedUSD",
    priceSource: "chainlink",
    chains: ["Ethereum"],
    bridges: {},
    twitter: "https://twitter.com/feiprotocol",
  },
  {
    id: "10",
    name: "Magic Internet Money",
    address: "0x956f47f50a910163d8bf957cf5846d573e7f87ca",
    symbol: "MIM",
    url: "https://abracadabra.money/",
    description:
      "Abracadabra.money is a spell book that allows users to produce magic internet money.",
    chain: "Ethereum",
    gecko_id: "magic-internet-money",
    cmcId: "162",
    category: "stablecoins",
    pegType: "peggedUSD",
    priceSource: "chainlink",
    chains: [
      "Ethereum",
      "Polygon",
      "Avalanche",
      "Arbitrum",
      "Fantom",
      "BSC",
      "Moonriver",
      "Boba",
      "Metis",
    ],
    bridges: {
      Polygon: {
        bridge: "Abracadabra Bridge",
        link: "https://abracadabra.money/",
      },
      Avalanche: {
        bridge: "Abracadabra Bridge",
        link: "https://abracadabra.money/",
      },
      Arbitrum: {
        bridge: "Abracadabra Bridge",
        link: "https://abracadabra.money/",
      },
      Fantom: {
        bridge: "Abracadabra Bridge",
        link: "https://abracadabra.money/",
      },
      BSC: {
        bridge: "Abracadabra Bridge",
        link: "https://abracadabra.money/",
      },
      Moonriver: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Boba: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
      Metis: {
        bridge: "Multichain Bridge",
        link: "https://multichain.org/",
      },
    },
    twitter: "https://twitter.com/MIM_Spell",
  },
  {
    id: "11",
    name: "Pax Dollar",
    address: "0x8e870d67f660d95d5be530380d0ec0bd388289e1",
    symbol: "USDP",
    url: "https://paxos.com/usdp/",
    description:
      "USDP gives customers the ability to store and send US Dollars with freedom, unrestricted by the limits of traditional banking.",
    chain: "Ethereum",
    gecko_id: "paxos-standard",
    cmcId: "3330",
    category: "stablecoins",
    pegType: "peggedUSD",
    priceSource: "chainlink",
    chains: ["Ethereum", "BSC"],
    bridges: {
      BSC: {
        bridge: "BSC Bridge",
        link: "https://www.binance.com/",
      },
    },
    twitter: "https://twitter.com/paxosglobal",
  },
  {
    id: "12",
    name: "Neutrino USD",
    address: "0x674c6ad92fd080e4004b2312b45f796a192d27a0",
    symbol: "USDN",
    url: "https://neutrino.at/",
    description:
      "Neutrino USD (USDN) is an algorithmic stablecoin pegged to the US dollar and backed by WAVES.",
    chain: "Waves",
    gecko_id: "neutrino",
    cmcId: "5068",
    category: "stablecoins",
    pegType: "peggedUSD",
    priceSource: "chainlink",
    chains: ["Waves", "Ethereum", "Polygon", "BSC"],
    bridges: {
      Ethereum: {
        bridge: "Waves Exchange",
        link: "https://waves.exchange/",
      },
      Polygon: {
        bridge: "Waves Exchange",
        link: "https://waves.exchange/",
      },
      BSC: {
        bridge: "Waves Exchange",
        link: "https://waves.exchange/",
      },
    },
    twitter: "https://twitter.com/neutrino_proto",
  },
  {
    id: "13",
    name: "YUSD Stablecoin",
    address: "0x111111111111ed1d73f860f57b2798b683f2d325",
    symbol: "YUSD",
    url: "https://yeti.finance/",
    description:
      "Yeti Finance is a cross-margin lending protocol on Avalanche that allows users to borrow up to 21x against their portfolio and receive YUSD, an overcollateralized stablecoin.",
    chain: "Avalanche",
    gecko_id: "yusd-stablecoin",
    cmcId: "19577",
    category: "stablecoins",
    pegType: "peggedUSD",
    priceSource: "none",
    chains: ["Avalanche"],
    bridges: {},
    twitter: "https://twitter.com/YetiFinance",
  },
  {
    id: "14",
    name: "USDD",
    address: "TPYmHEhy5n8TCEfYGqW2rPxsghSfzghPDn",
    symbol: "USDD",
    url: "https://usdd.io/",
    description:
      "USDD is a cryptocurrency issued by the TRON DAO Reserve with a stable price and diverse use cases.",
    chain: "Tron",
    gecko_id: "usdd",
    cmcId: "19891",
    category: "stablecoins",
    pegType: "peggedUSD",
    priceSource: "uniswap",
    chains: ["Tron", "Bittorrent", "Ethereum", "BSC"],
    bridges: {
      Bittorrent: {
        bridge: "Bittorrent Bridge",
        link: "https://bttc.bittorrent.com/",
      },
      Ethereum: {
        bridge: "Bittorrent Bridge",
        link: "https://bttc.bittorrent.com/",
      },
      BSC: {
        bridge: "Bittorrent Bridge",
        link: "https://bttc.bittorrent.com/",
      },
    },
    twitter: "https://twitter.com/usddio",
  },
] as PeggedAsset[];
