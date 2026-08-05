import type { PeggedAsset } from "./types";

export type { PeggedAsset };

/*
both `name` and `gecko_id` must be included. `name` is used to fetch icon and in API Config. `gecko_id` is used to fetch adapters and prices.

`description` should be brief but still include: Issuer, function of asset, and asset stablecoin is pegged to.

`mintRedeemDescription` should include brief details on minting and redemption.
*/

export default [
  {
    id: "1",
    name: "Tether", // name is normalized to get icon in frontend
    address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    symbol: "USDT",
    url: "https://tether.to/",
    description:
      "Launched in 2014, Tether tokens pioneered the stablecoin model. Tether tokens are pegged to real-world currencies on a 1-to-1 basis. This offers traders, merchants and funds a low volatility solution when exiting positions in the market.",
    mintRedeemDescription:
      "Tether customers who have undergone a verification process can exchange USD for USDT and redeem USDT for USD.",
    onCoinGecko: "true",
    gecko_id: "tether", // required: is used as coin's unique id throughout peggedassets-server
    cmcId: "825",
    pegType: "peggedUSD", // must match balance key returned by adapter
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: ["https://tether.to/en/transparency/#reports"],
    twitter: "https://twitter.com/Tether_to",
    wiki: "https://wiki.defillama.com/wiki/USDT",
    bridgeConfig: {
      lzConfig: {
        symbols: ["USDT0", 'USDT'],
      },
      hyperlaneConfig: {
        // "USD₮0" uses the Unicode Tugrik Sign (U+20AE), NOT ASCII "T". Visually
        // similar, distinct bytes. Do not normalize or substitute when editing.
        // "USDT0" is the ASCII-T variant; both appear in the Hyperlane registry.
        symbols: ["USDT", "USD₮0", "USDT0"],
      },
    }
  },
  {
    id: "2",
    name: "USD Coin",
    address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    symbol: "USDC",
    url: "https://www.circle.com/usdc/",
    description:
      "USDC is a fully regulated dollar digital stablecoin launched by Circle and Coinbase. USDC is fully backed by cash and short-dated U.S. government obligations, so that it is always redeemable 1:1 for U.S. dollars.",
    mintRedeemDescription:
      "An eligible business can exchange USD for USDC and redeem USDC for USD through a Circle Account.",
    onCoinGecko: "true",
    gecko_id: "usd-coin",
    cmcId: "3408",
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: ["https://www.centre.io/usdc-transparency"],
    twitter: "https://twitter.com/circlepay",
    wiki: "https://wiki.defillama.com/wiki/USDC",
    bridgeConfig: {
      lzConfig: {
        symbols: ["USDC", 'USDC.e'],
      },
      hyperlaneConfig: {
        // Default matching by gecko_id "usd-coin" and symbol "USDC".
      },
    }
  },
  {
    id: "3",
    name: "TerraClassicUSD",
    address: null,
    symbol: "USTC",
    url: "https://www.terra.money/",
    description:
      "Terra is a digital currency. The supply of Terra is adjusted in response to changes in demand to keep its price stable. This is achieved using Luna, the mining token whose stable rewards are designed to absorb volatility from changing economic cycles.",
    mintRedeemDescription:
      "Using Terra Station, $1 worth of LUNA can be burned to mint 1 UST, and vice-versa.",
    onCoinGecko: "true",
    gecko_id: "terrausd",
    cmcId: "7129",
    pegType: "peggedUSD",
    pegMechanism: "algorithmic",
    priceSource: "coingecko",
    auditLinks: null,
    deadFrom: "2022-05-09",
    twitter: "https://twitter.com/terra_money",
    wiki: "https://wiki.defillama.com/wiki/UST",
  },
  {
    id: "4",
    name: "Binance USD",
    address: "0x4fabb145d64652a948d72533023f6e7a623c7c53",
    symbol: "BUSD",
    url: "https://www.binance.com/en/busd",
    description:
      "BUSD is a 1:1 USD-backed stablecoin approved by the New York State Department of Financial Services (NYDFS), issued in partnership with Paxos.",
    mintRedeemDescription:
      "Paxos customers who have undergone a verification process can exchange USD for BUSD and redeem BUSD for USD.",
    onCoinGecko: "true",
    gecko_id: "binance-usd",
    cmcId: "4687",
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: ["https://paxos.com/attestations/"],
    twitter: "https://twitter.com/PaxosGlobal",
    wiki: "https://wiki.defillama.com/wiki/Binance_USD",
  },
  {
    id: "5",
    name: "Dai",
    address: "0x6b175474e89094c44da98b954eedeac495271d0f",
    symbol: "DAI",
    url: "https://app.sky.money/",
    description:
      "The Dai stablecoin is a decentralized, unbiased, collateral-backed cryptocurrency soft-pegged to the US Dollar. Dai is held in cryptocurrency wallets or within platforms, and is supported on Ethereum and other popular blockchains.",
    mintRedeemDescription:
      "Users mint Dai by depositing accepted collateral assets into Maker Vaults within the Maker Protocol. When the loan is repaid to retrieve the collateral, the paid back Dai is burned.",
    onCoinGecko: "true",
    gecko_id: "dai",
    cmcId: "4943",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/MakerDAO",
    wiki: "https://wiki.defillama.com/wiki/Dai",
    bridgeConfig: {
      lzConfig: {
        symbols: ["DAI"],
      },
      hyperlaneConfig: {
        // Pin to arbitrum: Hyperlane locks DAI collateral on arbitrum, so
        // the linea synthetic must use a different source key than the
        // manual `linea.ethereum` entry to avoid the collision-skip
        // dropping its supply. Pinning also stabilises against the 3-way
        // alphabetical tie (arbitrum/bsc/polygon) the voting algorithm hits.
        sourceChain: "arbitrum",
      },
    }
  },
  {
    id: "6",
    name: "Frax",
    address: "0x853d955acef822db058eb8505911ed77f175b99e",
    symbol: "FRAX",
    url: "https://frax.com/",
    description:
      "Frax attempts to be the first stablecoin protocol to implement design principles of both collateralized and algorithmic stablecoins to create a highly scalable, trustless, extremely stable, and ideologically pure on-chain money.",
    mintRedeemDescription:
      "Using the Frax Finance app, FRAX can be minted by locking USDC and burning FXS in a proportion determined by the protocol's collateral ratio.",
    onCoinGecko: "true",
    gecko_id: "frax",
    cmcId: "6952",
    pegType: "peggedUSD",
    pegMechanism: "algorithmic",
    priceSource: "defillama",
    auditLinks: ["https://www.certik.org/projects/fraxfinance"],
    twitter: "https://twitter.com/fraxfinance",
    wiki: "https://wiki.defillama.com/wiki/Frax",
  },
  {
    id: "7",
    name: "TrueUSD",
    address: "0x0000000000085d4780b73119b644ae5ecd22b376",
    symbol: "TUSD",
    url: "https://trueusd.com/",
    description:
      "TrueUSD (TUSD) is an independently-verified digital asset redeemable 1-for-1 for US Dollars.",
    mintRedeemDescription:
      "TrueUSD customers who have undergone a verification process can exchange USD for TUSD and redeem TUSD for USD.",
    onCoinGecko: "true",
    gecko_id: "true-usd",
    cmcId: "2563",
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: ["https://real-time-attest.trustexplorer.io/truecurrencies"],
    twitter: "https://twitter.com/tusdio",
    wiki: "https://wiki.defillama.com/wiki/TUSD",
  },
  {
    id: "8",
    name: "Liquity USD",
    address: "0x5f98805a4e8be255a32880fdec7f6728c6568ba0",
    symbol: "LUSD",
    url: "https://www.liquity.org/",
    description:
      "Liquity is a decentralized borrowing protocol that allows you to draw interest-free loans against Ether used as collateral. Loans are paid out in LUSD (a USD pegged stablecoin).",
    mintRedeemDescription:
      "Using a Liquity frontend, users mint LUSD by depositing ETH as collateral into a Trove. When the loan is repaid to retrieve the collateral, the paid back LUSD is burned.",
    onCoinGecko: "true",
    gecko_id: "liquity-usd",
    cmcId: "9566",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/LiquityProtocol",
    wiki: "https://wiki.defillama.com/wiki/Liquity",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x5f98805a4e8be255a32880fdec7f6728c6568ba0"],
        },
        polygon: {
          bridgedFromETH: ["0x23001f892c0C82b79303EDC9B9033cD190BB21c7"],
        },
        optimism: {
          bridgedFromETH: ["0xc40F949F8a4e094D1b49a23ea9241D289B7b2819"],
        },
        bsc: {
          bridgedFromETH: ["0x181002D60d504d30a39601Ae13Af3191cb102580"],
        },
        avax: {
          bridgedFromETH: ["0xDA0019E7e50Ee4990440b1aa5dFFCAC6E27Ee27B"],
        },
        fantom: {
          bridgedFromETH: ["0x16365b45EB269B5B5dACB34B4a15399Ec79b95eB"],
        },
        arbitrum: {
          bridgedFromETH: ["0x93b346b6BC2548dA6A1E7d98E9a421B42541425b"],
        },
        polygon_zkevm: {
          bridgedFromETH: ["0x01E9A866c361eAd20Ab4e838287DD464dc67A50e"],
        },
        era: {
          bridgeOnETH: ["0xD7f9f54194C633F36CCD5F3da84ad4a1c38cB2cB"],
          bridgedFromETH: ["0x503234f203fc7eb888eec8513210612a43cf6115"],
        },
        scroll: {
          bridgedFromETH: ["0xeDEAbc3A1e7D21fE835FFA6f83a710c70BB1a051"],
        },
      },
    },
  },
  {
    id: "9",
    name: "Fei USD",
    address: "0x956f47f50a910163d8bf957cf5846d573e7f87ca",
    symbol: "FEI",
    url: "https://fei.money/",
    description:
      "Fei is a decentralized, scalable, and DeFi-native stablecoin protocol. Fei Protocol's goal is to scalably issue a $1 pegged decentralized stablecoin, FEI.",
    mintRedeemDescription:
      "New FEI is minted via a buy-only bonding curve denominated in ETH. The Fei Protocol deploys its Protocol Controlled Value as liquidity for trading, and FEI is minted or burned to maintain the peg whenever it is traded.",
    onCoinGecko: "true",
    gecko_id: "fei-usd",
    cmcId: "8642",
    pegType: "peggedUSD",
    pegMechanism: "algorithmic",
    priceSource: "defillama",
    auditLinks: ["https://docs.fei.money/audit"],
    twitter: "https://twitter.com/feiprotocol",
    wiki: "https://wiki.defillama.com/wiki/FEI",
    deadUrl: true,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x956F47F50A910163D8BF957Cf5846D573E7f87CA"],
        },
      },
    },
  },
  {
    id: "10",
    name: "Magic Internet Money",
    address: "0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3",
    symbol: "MIM",
    url: "https://abracadabra.money/",
    description:
      "Abracadabra.money is a lending platform that uses interest-bearing tokens as collateral to borrow a USD pegged stablecoin (Magic Internet Money - MIM), that can be used as any other traditional stablecoin.",
    mintRedeemDescription:
      "Using Abracadabra.money, users mint MIM by depositing interest-bearing tokens as collateral into an Abracadabra cauldron. When the loan is repaid to retrieve the collateral, the paid back MIM is burned.",
    onCoinGecko: "true",
    gecko_id: "magic-internet-money",
    cmcId: "162",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/MIM_Spell",
    wiki: "https://wiki.defillama.com/wiki/MIM",
  },
  {
    id: "11",
    name: "Pax Dollar",
    address: "0x8e870d67f660d95d5be530380d0ec0bd388289e1",
    symbol: "USDP",
    url: "https://paxos.com/usdp/",
    description:
      "USDP is a regulated stablecoin by Paxos that is redeemable one-to-one for US Dollars.",
    mintRedeemDescription:
      "Paxos customers who have undergone a verification process can exchange USD for USDP and redeem USDP for USD.",
    onCoinGecko: "true",
    gecko_id: "paxos-standard",
    cmcId: "3330",
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: ["https://paxos.com/attestations/"],
    twitter: "https://twitter.com/paxosglobal",
    wiki: "https://wiki.defillama.com/wiki/USDP",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x8E870D67F660D95d5be530380D0eC0bd388289E1"],
        },
        bsc: {
          bridgedFromETH: ["0xb3c11196A4f3b1da7c23d9FB0A3dDE9c6340934F"],
        },
        linea: {
          bridgedFromETH: ["0xd2bc272EA0154A93bf00191c8a1DB23E67643EC5"],
        },
        solana: {
          issued: ["HVbpJAQGNpkgBaYBZQBR1t7yFdvaYVp2vCQQfKKEN4tM"],
        },
      },
    },
  },
  {
    id: "12",
    name: "Neutrino USD",
    address: null,
    symbol: "USDN",
    url: "https://neutrino.at/",
    description:
      "Neutrino USD (USDN) is an algorithmic stablecoin pegged to the US dollar and backed by WAVES.",
    mintRedeemDescription:
      "NSBT stakers can mint 1 USDN by burning $1 worth of WAVES, and vice-versa.",
    onCoinGecko: "true",
    gecko_id: "neutrino",
    cmcId: "5068",
    pegType: "peggedUSD",
    pegMechanism: "algorithmic",
    priceSource: "defillama",
    auditLinks: null,
    deadFrom: "2023-02-01",
    twitter: "https://twitter.com/neutrino_proto",
    wiki: "https://wiki.defillama.com/wiki/Neutrino",
  },
  {
    id: "13",
    name: "YUSD Stablecoin",
    address: "avax:0x111111111111ed1d73f860f57b2798b683f2d325",
    symbol: "YUSD",
    url: "https://yeti.finance/",
    description:
      "Yeti Finance is a cross-margin lending protocol on Avalanche that allows users to borrow up to 21x against their portfolio and receive YUSD, an overcollateralized stablecoin.",
    mintRedeemDescription:
      "Using the Yeti Finance app, users mint YUSD by depositing an accepted collateral asset into a Trove. When the loan is repaid to retrieve the collateral, the paid back YUSD is burned.",
    onCoinGecko: "true",
    gecko_id: "yusd-stablecoin",
    cmcId: "19577",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: [
      "https://docs.google.com/document/d/1i3PWxOCt_EaFU51aI1YOgWkmPp0EbsV3d3G_ZtvS4Ko/view",
      "https://docs.google.com/document/d/1DxfCo6KqfKOJfmlQmAlb2UySyFaMDwBNKkDo_nZPIsw/view",
      "https://drive.google.com/file/d/1fpU4V-9iQKUTXRd8ZvmSThdib44bA4xi/view",
      "https://docs.google.com/document/d/1qYVwps1KgUxdmOoKFdgTDmhhMk4fY9tf0ukYxOAf_CQ/view",
      "https://code4rena.com/reports/2021-12-yetifinance/"
    ],
    twitter: "https://twitter.com/YetiFinance",
    wiki: "https://wiki.defillama.com/wiki/Yeti_Finance",
    chainConfig: {
      chains: {
        avax: {
          issued: ["0x111111111111ed1d73f860f57b2798b683f2d325"],
        },
      },
    },
  },
  {
    id: "14",
    name: "USDD",
    address: "tron:TXDk8mbtRbXeYuMNS83CfKPaYYT8XWv9Hz",
    symbol: "USDD",
    url: "https://usdd.io/",
    description:
      "USDD is a decentralized, over-collateralized stablecoin that is designed to be pegged 1:1 to the US dollar with enhanced stability and transparency.",
    mintRedeemDescription:
      "Users can stake assets like TRX, sTRX or USDT to mint USDD. The minimum collateral ratio differs according to vault and collateral type.",
    onCoinGecko: "true",
    gecko_id: "usdd",
    cmcId: "19891",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://usdd.io/SlowMistAuditReport-USDDTRC20.pdf"],
    twitter: "https://twitter.com/usddio",
    wiki: "https://wiki.defillama.com/wiki/USDD",
  },
  {
    id: "15",
    name: "Dola",
    address: "0x865377367054516e17014ccded1e7d814edc9ce4",
    symbol: "DOLA",
    url: "https://www.inverse.finance/",
    description:
      "DOLA is an over-collateralized stablecoin pegged to the US Dollar.  It can also be used as collateral within the Frontier protocol to achieve high capital efficiency, leverage and native yield.",
    mintRedeemDescription:
      "Using FiRM, users mint DOLA by depositing an accepted collateral asset. When the loan is repaid to retrieve the collateral, the paid back DOLA is burned.",
    onCoinGecko: "true",
    gecko_id: "dola-usd",
    cmcId: "19191",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: "https://inverse.finance/audits",
    twitter: "https://twitter.com/InverseFinance",
    wiki: "https://wiki.defillama.com/wiki/DOLA",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x865377367054516e17014CcdED1e7d814EDC9ce4"],
        },
        fantom: {
          bridgedFromETH: ["0x3129662808bEC728a27Ab6a6b9AFd3cBacA8A43c"],
        },
        optimism: {
          bridgedFromETH: ["0x8aE125E8653821E851F12A49F7765db9a9ce7384"],
        },
        bsc: {
          bridgedFromETH: ["0x2f29bc0ffaf9bff337b31cbe6cb5fb3bf12e5840"],
        },
        arbitrum: {
          bridgedFromETH: ["0x6a7661795c374c0bfc635934efaddff3a7ee23b6"],
        },
        polygon: {
          bridgedFromETH: ["0xbc2b48bc930ddc4e5cfb2e87a45c379aab3aac5c"],
        },
        avax: {
          bridgedFromETH: ["0x221743dc9e954be4f86844649bf19b43d6f8366d"],
        },
        base: {
          bridgedFromETH: ["0x4621b7A9c75199271F773Ebd9A499dbd165c3191"],
        },
      },
    },
  },
  {
    id: "16",
    name: "Parrot USD",
    address: "solana:Ea5SjE2Y6yvCeW5dYTn7PYMuW5ikXkvbGdcmSnXeaLjS",
    symbol: "PAI",
    url: "https://parrot.fi/",
    description:
      "PAI is an over-collateralized stablecoin created by the Parrot Protocol on Solana.",
    mintRedeemDescription:
      "Using the Parrot app, users mint PAI by depositing an accepted collateral asset into a vault. When the loan is repaid to retrieve the collateral, the paid back PAI is burned.",
    onCoinGecko: "true",
    gecko_id: "parrot-usd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://doc.parrot.fi/security/"],
    twitter: "https://twitter.com/gopartyparrot",
    wiki: "https://wiki.defillama.com/wiki/Parrot_USD_(PAI)",
    deadUrl: true,
    chainConfig: {
      chains: {
        solana: { issued: ["Ea5SjE2Y6yvCeW5dYTn7PYMuW5ikXkvbGdcmSnXeaLjS"] },
      },
    },
  },
  {
    id: "17",
    name: "HUSD",
    address: "0xdf574c24545e5ffecb9a659c229253d4111d87e1",
    symbol: "HUSD",
    url: "https://www.stcoins.com/",
    description:
      "HUSD is an over-collateralized stablecoin built on the Ethereum, HECO and Tron networks.",
    mintRedeemDescription:
      "Stable Universal customers who have undergone a verification process can exchange USD for HUSD and redeem HUSD for USD.",
    onCoinGecko: "true",
    gecko_id: "husd",
    cmcId: "4779",
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/Stablecoin_HUSD",
    wiki: "https://wiki.defillama.com/wiki/HUSD",
    chainConfig: {
      decimals: 8,
      chains: {
        ethereum: { issued: ["0xdF574c24545E5FfEcb9a659c229253D4111d87e1"] },
        tron: { issued: ["TL2FiXffdjG5Ep8eqPN6ouLyydvmgoR95h"] },
        // heco and elastos were disabled in the old adapter; kept out here.
        solana: {
          bridgedFromETH: [
            "7VQo3HFLNH5QqGtM8eC3XQbPkJUu7nS9LeGWjerRh5Sw", // wormhole v2
            "BybpSTBoZHsmKnfxYG47GDhVPKrnEKX31CScShbrzUhX", // wormhole v1
          ],
        },
      },
    },
  },
  {
    id: "18",
    name: "Nexus USD",
    address: "0x1b84765de8b7566e4ceaf4d0fd3c5af52d3dde4f",
    symbol: "NUSD",
    url: "https://synapseprotocol.com/",
    description:
      'nUSD, or "nexus" USD, is a cross-chain stablecoin fully backed by the nexus stablecoin liquidity pool on Ethereum consisting of DAI, USDC, and USDT.',
    mintRedeemDescription:
      "When a stablecoin is bridged between Synapse-enabled chains, the funds are automatically converted to nUSD, and bridged to the destination chain. Once there, this nUSD can be auto-swapped to that chain's native stablecoins using the local nUSD pool.",
    onCoinGecko: false,
    gecko_id: null,
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: null,
    auditLinks: null,
    twitter: "https://twitter.com/SynapseProtocol",
    wiki: "https://wiki.defillama.com/wiki/NUSD",
    module: "nexus-usd",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x1B84765dE8B7566e4cEAF4D0fD3c5aF52D3DdE4F"],
        },
        bsc: {
          bridgedFromETH: ["0x23b891e5c62e0955ae2bd185990103928ab817b3"],
        },
        polygon: {
          bridgedFromETH: ["0xb6c473756050de474286bed418b77aeac39b02af"],
        },
        avax: {
          bridgedFromETH: ["0xcfc37a6ab183dd4aed08c204d1c2773c0b1bdf46"],
        },
        arbitrum: {
          bridgedFromETH: ["0x2913e812cf0dcca30fb28e6cac3d2dcff4497688"],
        },
        fantom: {
          bridgedFromETH: ["0xed2a7edd7413021d440b09d654f3b87712abab66"],
        },
        harmony: {
          bridgedFromETH: ["0xed2a7edd7413021d440b09d654f3b87712abab66"],
        },
        boba: {
          bridgedFromETH: ["0x6b4712ae9797c199edd44f897ca09bc57628a1cf"],
        },
        optimism: {
          bridgedFromETH: ["0x67c10c397dd0ba417329543c1a40eb48aaa7cd00"],
        },
        cronos: {
          bridgedFromETH: ["0x396c9c192dd323995346632581bef92a31ac623b"],
        },
        metis: {
          bridgedFromETH: ["0x961318fc85475e125b99cc9215f62679ae5200ab"],
        },
        dfk: {
          bridgedFromETH: ["0x52285d426120ab91f378b3df4a15a036a62200ae"],
        },
        aurora: {
          bridgedFromETH: ["0x07379565cD8B0CaE7c60Dc78e7f601b34AF2A21c"],
        },
      },
    },
  },
  {
    id: "19",
    name: "Gemini Dollar",
    address: "0x056fd409e1d7a124bd7017459dfea2f387b6d5cd",
    symbol: "GUSD",
    url: "https://www.gemini.com/dollar",
    description:
      "GUSD is a 1:1 USD-backed stablecoin issued by Gemini. Gemini customers can redeem a GUSD for $1 at Gemini.",
    mintRedeemDescription:
      "Gemini customers who have undergone a verification process can exchange USD for GUSD and redeem GUSD for USD.",
    onCoinGecko: "true",
    gecko_id: "gemini-dollar",
    cmcId: "3306",
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: ["https://www.gemini.com/dollar"],
    twitter: "https://twitter.com/gemini",
    wiki: "https://wiki.defillama.com/wiki/GUSD",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x056fd409e1d7a124bd7017459dfea2f387b6d5cd"],
        },
        wan: {
          bridgedFromETH: ["0xcF422327dDaAa409C2976d01131d8a3457F03251"],
        },
      },
    },
  },
  {
    id: "20",
    name: "Alchemix USD",
    address: "0xbc6da0fe9ad5f3b0d58160288917aa56653660e9",
    symbol: "ALUSD",
    url: "https://alchemix.fi/",
    description:
      "alUSD is a yield-backed synthetic stablecoin powered by the Alchemix protocol.",
    mintRedeemDescription:
      "alUSD is minted by depositing an accepted collateral asset into an Alchemix Vault. The collateral is used to generate yield that pays down the alUSD debt. Any alUSD used to repay the loan to retrieve the collateral is burned.",
    onCoinGecko: "true",
    gecko_id: "alchemix-usd",
    cmcId: "8614",
    pegType: "peggedUSD",
    pegMechanism: "algorithmic",
    priceSource: "defillama",
    auditLinks: ["https://github.com/runtimeverification/publications/blob/main/reports/smart-contracts/Alchemix_v2.pdf"],
    twitter: "https://twitter.com/AlchemixFi",
    wiki: "https://wiki.defillama.com/wiki/Alchemix",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xbc6da0fe9ad5f3b0d58160288917aa56653660e9"],
          unreleased: ["0x9735f7d3ea56b454b24ffd74c58e9bd85cfad31b"],
        },
        arbitrum: {
          bridgedFromETH: ["0x2130d2a1e51112D349cCF78D2a1EE65843ba36e0"],
        },
        optimism: {
          bridgedFromETH: ["0xb2c22A9fb4FC02eb9D1d337655Ce079a04a526C7", "0xCB8FA9a76b8e203D8C3797bF438d8FB81Ea3326A"],
        },
        fantom: {
          bridgedFromETH: ["0xB67FA6deFCe4042070Eb1ae1511Dcd6dcc6a532E"],
        },
      },
    },
  },
  {
    id: "21",
    name: "flexUSD",
    address: "0xa774ffb4af6b0a91331c084e1aebae6ad535e6f3",
    symbol: "FLEXUSD",
    url: "https://coinflex.com/",
    description:
      "flexUSD is a multi-yield bearing stablecoin on Ethereum and smartBCH.",
    mintRedeemDescription:
      "Using the CoinFLEX app, users swap USDC to mint flexUSD 1:1. flexUSD can be redeemed for USDC 1:1 at any time.",
    onCoinGecko: "false",
    gecko_id: null,
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/coinflexdotcom",
    wiki: "https://wiki.defillama.com/wiki/flexUSD",
    module: "flex-usd",
    deadFrom: "2022-06-23",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xa774ffb4af6b0a91331c084e1aebae6ad535e6f3"],
        },
        smartbch: {
          issued: ["0x7b2b3c5308ab5b2a1d9a94d20d35ccdf61e05b72"],
        },
      },
    },
  },
  {
    id: "22",
    name: "sUSD",
    address: "0x57ab1ec28d129707052df4df418d58a2d46d5f51",
    symbol: "SUSD",
    url: "https://synthetix.io/",
    description:
      "Synthetix is a protocol for issuing and trading synthetic assets on Ethereum. Each synthetic asset (or Synth) is an ERC20 token which tracks the price of an external asset; for example each sUSD token tracks the price of the US dollar.",
    mintRedeemDescription:
      "An SNX holder can mint sUSD by locking their SNX as collateral via the Synthetix smart contract. sUSD can be burned to swap to another synthetic asset or to repay the debt to retrieve the collateral.",
    onCoinGecko: "true",
    gecko_id: "nusd",
    cmcId: "2927",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/synthetix_io",
    wiki: "https://wiki.defillama.com/wiki/Synthetix",
    deadFrom: "2026-06-23",
    chainConfig: {
      chains: {
        ethereum: { issued: ["0x57ab1ec28d129707052df4df418d58a2d46d5f51"] },
        optimism: { issued: ["0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d9"] },
        arbitrum: { bridgedFromETH: ["0xa970af1a584579b618be4d69ad6f73459d112f95"] },
        fantom: { bridgedFromETH: ["0x0e1694483ebb3b74d3054e383840c6cf011e518e"] },
        // ontology (poly-network bridge) was a no-op in the old adapter; dropped.
      },
    },
  },
  {
    id: "23",
    name: "Origin Dollar",
    address: "0x2a8e1e676ec238d8a992307b495b45b3feaa5e86",
    symbol: "OUSD",
    url: "https://www.ousd.com/",
    description:
      "OUSD is a yield-earning, rebasing stablecoin that is backed 1:1 by other stablecoins like USDT, USDC and DAI.",
    mintRedeemDescription:
      "Using the Origin Dollar app, users swap USDC, USDT, or DAI to mint OUSD 1:1. OUSD can be redeemed for USDC, USDT, or DAI 1:1 at any time.",
    onCoinGecko: "true",
    gecko_id: "origin-dollar",
    cmcId: "7189",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://docs.ousd.com/v/en/security-and-risks/audits"],
    twitter: "https://twitter.com/originprotocol",
    wiki: "https://wiki.defillama.com/wiki/Origin_Dollar",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x2a8e1e676ec238d8a992307b495b45b3feaa5e86"],
        },
      },
    },
  },
  {
    id: "24",
    name: "Mento Dollar",
    address: "celo:0x765de816845861e75a25fca122bb6898b8b1282a",
    symbol: "USDm",
    url: "https://app.mento.org/",
    description:
      "Mento Dollars (USDm) are stablecoins that follow the US Dollar and are backed by Mento's Reserve system. The Mento Reserve is diversified portfolio of crypto assets.",
    mintRedeemDescription:
      "USDm is backed by fiat-backed stablecoins held in the Mento Reserve. Minting and redemption occur through oracle-priced Fixed-Price Market Maker (FPMM) pools.",
    onCoinGecko: "true",
    gecko_id: "celo-dollar",
    cmcId: "7236",
    pegType: "peggedUSD",
    pegMechanism: "algorithmic",
    priceSource: "defillama", // coingecko not accurate
    auditLinks: ["https://docs.mento.org/mento-v3/dive-deeper/security/audit-reports"],
    twitter: "https://twitter.com/MentoLabs",
    wiki: "https://wiki.defillama.com/wiki/CUSD",
    chainConfig: {
      chains: {
        celo: {
          issued: ["0x765de816845861e75a25fca122bb6898b8b1282a"],
        },
        ethereum: {
          bridgedFromCelo: ["0xd8F3208c045DD69D27938346275165998359D8fF", "0x9b9E2De4cB4ca479943F36DfFc72c7253bb1f66a", "0xad3E3Fc59dff318BecEaAb7D00EB4F68b1EcF195"],
        },
        solana: {
          bridgedFromCelo: ["EwxNF8g9UfmsJVcZFTpL9Hx5MCkoQFoJi6XNWzKf1j8e"],
        },
        klaytn: {
          bridgedFromCelo: ["0x08745bee17026ed2e0e39a98f81189b9e14ab1b3"],
        },
        monad: {
          issued: ["0xBC69212B8E4d445b2307C9D32dD68E2A4Df00115"],
        },
      },
    },
  },
  {
    id: "25",
    name: "Reserve",
    address: "0x196f4727526ea7fb1e17b2071b3d8eaa38486988",
    symbol: "RSV",
    url: "https://reserve.org/",
    description:
      "RSV is backed by a basket of on-chain collateral assets, held by the Reserve Vault smart contract. This basket is comprised of equal parts TUSD, PAX, and USDC.",
    mintRedeemDescription:
      "Using the RSV Portal app, equal parts USDC, TUSD, and PAX can be swapped to mint RSV. RSV can be redeemed for its corresponding basket of assets at any time.",
    onCoinGecko: "false",
    gecko_id: null,
    cmcId: "6727",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/holareserve",
    wiki: "https://wiki.defillama.com/wiki/Reserve_(RSV)",
    module: "reserve",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x196f4727526ea7fb1e17b2071b3d8eaa38486988"],
        },
        xdai: {
          bridgedFromETH: ["0xD9C31db155a48f3d7304De85EC7AB7B705659bE9"],
        },
      },
    },
  },
  {
    id: "26",
    name: "mStable USD",
    address: "0xe2f2a5c287993345a840db3b0845fbc70f5935a5",
    symbol: "MUSD",
    url: "https://mstable.org/",
    description:
      "mUSD is USD-pegged cryptoasset on Ethereum and Polygon backed by a basket of selected USD stablecoins.",
    mintRedeemDescription:
      "Using the mStable app, users can swap an accepted stablecoin to mint mUSD 1:1. mUSD can be redeemed for another stablecoin 1:1 at any time.",
    onCoinGecko: "true",
    gecko_id: "musd",
    cmcId: "5747",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/mstable_",
    wiki: "https://wiki.defillama.com/wiki/MUSD",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xe2f2a5c287993345a840db3b0845fbc70f5935a5"],
        },
        xdai: {
          bridgedFromETH: ["0x7300AaFC0Ef0d47Daeb850f8b6a1931b40aCab33"],
        },
        polygon: {
          issued: ["0xE840B73E5287865EEc17d250bFb1536704B43B21"],
        },
      },
    },
  },
  {
    id: "27",
    name: "USDK",
    address: "0x1c48f86ae57291f7686349f12601910bd8d470bb",
    symbol: "USDK",
    url: "https://www.oklink.com/en",
    description:
      "USDK is a USD-pegged stablecoin, jointly launched by OKLink and Prime Trust, an American Trust company.",
    mintRedeemDescription:
      "OKLink customers who have undergone a verification process can exchange USD for USDK and redeem USDK for USD.",
    onCoinGecko: "false",
    gecko_id: null,
    cmcId: "4064",
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: [
      "https://oklinksupport.zendesk.com/hc/zh-hk/categories/360001824211-%E8%B5%84%E9%87%91%E5%AE%A1%E8%AE%A1",
    ],
    twitter: "https://twitter.com/OKLink",
    wiki: "https://wiki.defillama.com/wiki/USDK",
    module: "usdk",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x1c48f86ae57291f7686349f12601910bd8d470bb"],
        },
        polygon: {
          bridgedFromETH: ["0xD07A7FAc2857901E4bEC0D89bBDAe764723AAB86"],
        },
        okexchain: {
          bridgedFromETH: ["0xdcac52e001f5bd413aa6ea83956438f29098166b"],
        },
        solana: {
          bridgedFromETH: ["43m2ewFV5nDepieFjT9EmAQnc1HRtAF247RBpLGFem5F"],
        },
      },
    },
  },
  {
    id: "28",
    name: "Vai",
    address: "bsc:0x4bd17003473389a42daf6a0a729f6fdb328bbbd7",
    symbol: "VAI",
    url: "https://venus.io/",
    description:
      "Vai is Venus Protocol's decentralized synthetic stablecoin that is pegged to USD.",
    mintRedeemDescription:
      "VAI is minted by supplying and locking a single or basket of cryptocurrencies. VAI is exchangeable to all supporting assets, including USD, which can be redeemed directly to your bank account in the Swipe Wallet platform for verified users.",
    onCoinGecko: "true",
    gecko_id: "vai",
    cmcId: "7824",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/VenusProtocol",
    wiki: "https://wiki.defillama.com/wiki/VAI",
    chainConfig: {
      chains: {
        bsc: {
          issued: ["0x4bd17003473389a42daf6a0a729f6fdb328bbbd7"],
        },
      },
    },
  },
  {
    id: "29",
    name: "TOR",
    address: "fantom:0x74e23df9110aa9ea0b6ff2faee01e740ca1c642e",
    symbol: "TOR",
    url: "https://tor.cash/",
    description:
      "TOR is a fully collateralized stablecoin built on the Fantom Opera Chain.",
    mintRedeemDescription:
      "Using the Hector Finance app, users swap DAI to mint TOR 1:1. TOR can be redeemed for DAI 1:1 at any time.",
    onCoinGecko: "true",
    gecko_id: "tor",
    cmcId: "18105",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/HectorDAO_HEC",
    wiki: "https://wiki.defillama.com/wiki/TOR",
    chainConfig: {
      chains: {
        fantom: {
          issued: ["0x74e23df9110aa9ea0b6ff2faee01e740ca1c642e"],
        },
      },
    },
  },
  {
    id: "30",
    name: "Dollar on Chain",
    address: "rsk:0xe700691dA7b9851F2F35f8b8182c69c53CcaD9Db",
    symbol: "DOC",
    url: "https://moneyonchain.com/doc-stablecoin/",
    description:
      "Dollar on Chain an over-collateralized USD-pegged stablecoin backed by rBTC on the RSK Blockchain.",
    mintRedeemDescription:
      "Using the Money On Chain app, users mint DoC by depositing rBTC into a vault. When the loan is repaid to retrieve the collateral, the paid back DoC is burned.",
    onCoinGecko: false,
    gecko_id: null,
    module: "doc",

    cmcId: "7558",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: null,
    auditLinks: null,
    twitter: "https://twitter.com/moneyonchainok",
    wiki: "https://wiki.defillama.com/wiki/DOC",
    chainConfig: {
      chains: {
        rsk: {
          issued: ["0xe700691dA7b9851F2F35f8b8182c69c53CcaD9Db"],
        },
        ethereum: {
          bridgedFromRsk: ["0x69f6d4d4813f8e2e618dae7572e04b6d5329e207"],
        },
        arbitrum: {
          bridgedFromRsk: ["0x2ad62eb9744c720364f6ac856360a43e8a2229b5"],
        },
      },
    },
  },
  {
    id: "31",
    name: "SpiceUSD",
    address: "avax:0xab05b04743e0aeaf9d2ca81e5d3b8385e4bf961e",
    symbol: "USDS",
    url: "https://app.spicetrade.ai/",
    description:
      "Spice USD (Ticker USDS) is a stablecoin soft-pegged to USD in the Spice Protocol on Avalanche.",
    mintRedeemDescription:
      "Using the Spice Trade app, USDS can be minted by locking USDC and burning SPICE in a proportion determined by the protocol's collateral ratio.",
    onCoinGecko: "false",
    gecko_id: null,
    module: "spiceusd",

    cmcId: "20306",
    pegType: "peggedUSD",
    pegMechanism: "algorithmic",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/spicetradeai",
    wiki: "https://wiki.defillama.com/wiki/SpiceUSD_(USDS)",
    deadFrom: "2022-11-20",
    chainConfig: {
      chains: {
        avax: {
          issued: ["0xab05b04743e0aeaf9d2ca81e5d3b8385e4bf961e"],
        },
        ethereum: {
          issued: ["0x45fdb1b92a649fb6a64ef1511d3ba5bf60044838"],
          unreleased: ["0xe85131becf5298db58d60e5d628f2c927c7f88cc"],
        },
        polygon: {
          issued: ["0x2f1b1662a895c6ba01a99dcaf56778e7d77e5609"],
        },
        bsc: {
          issued: ["0xde7d1ce109236b12809c45b23d22f30dba0ef424"],
        },
      },
    },
  },
  {
    id: "32",
    name: "Sperax USD",
    address: "arbitrum:0xd74f5255d557944cf7dd0e45ff521520002d5748",
    symbol: "USDS",
    url: "https://sperax.io/",
    description:
      "Sperax USD (USDs) is a USD-pegged stablecoin that is primarily backed by crypto collateral which generates organic yield for its holders.",
    mintRedeemDescription:
      "Using the Sperax app, USDs can be minted by locking USDC or USDT and burning SPA in a proportion determined by the protocol's collateral ratio.",
    onCoinGecko: "true",
    gecko_id: "sperax-usd",
    cmcId: "17285",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama", // does not liquidity on curve
    auditLinks: [
      "https://github.com/Sperax/Audit_Reports/blob/main/Sperax%20-%20USDs%20-%20Report%20(1).pdf",
      "https://github.com/Sperax/Audit_Reports"
    ],
    twitter: "https://twitter.com/SperaxUSD",
    wiki: "https://wiki.defillama.com/wiki/Sperax_USD_(USDS)",
    chainConfig: {
      chains: {
        arbitrum: {
          issued: ["0xd74f5255d557944cf7dd0e45ff521520002d5748"],
        },
      },
    },
  },
  {
    id: "33",
    name: "USDP Stablecoin",
    address: "0x1456688345527be1f37e9e627da0837d6f08c925",
    symbol: "USDP",
    url: "https://unit.xyz/",
    description:
      "USDP is a decentralized, unbiased, and fully-backed stablecoin whose value is soft-pegged to US Dollar. USDP runs on the Ethereum, BSC, and Fantom networks.",
    mintRedeemDescription:
      "Using the Unit Protocol app, users mint USDP by depositing an accepted collateral asset into a vault. When the loan is repaid to retrieve the collateral, the paid back USDP is burned.",
    onCoinGecko: "false",
    gecko_id: null,
    module: "usdp",
    cmcId: "8886",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/unitprotocol",
    wiki: "https://wiki.defillama.com/wiki/USDP_Stablecoin_(USDP)",
    deprecated: true,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x1456688345527be1f37e9e627da0837d6f08c925"],
        },
        xdai: {
          bridgedFromETH: ["0xFe7ed09C4956f7cdb54eC4ffCB9818Db2D7025b8"],
        },
        bsc: {
          issued: ["0xDACD011A71f8c9619642bf482f1D4CeB338cfFCf"],
        },
        fantom: {
          issued: ["0x3129aC70c738D398d1D74c87EAB9483FD56D16f8"],
        },
      },
    },
  },
  {
    id: "34",
    name: "USD Balance",
    address: "fantom:0x6fc9383486c163fa48becdec79d6058f984f62ca",
    symbol: "USDB",
    url: "https://www.usdbalance.com/",
    description:
      "USDB is an algorithmic stablecoin that powers the FantOHM OHM fork.",
    mintRedeemDescription:
      "Using the USD Balance app, $1 worth of FHM can be burned to mint 1 USDB.",
    onCoinGecko: "false",
    gecko_id: null,
    module: "usd-balance",
    cmcId: "19224",
    pegType: "peggedUSD",
    pegMechanism: "algorithmic",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/USDB_",
    wiki: "https://wiki.defillama.com/wiki/FantOHM",
    chainConfig: {
      chains: {
        fantom: {
          issued: ["0x6Fc9383486c163fA48becdEC79d6058f984f62cA"],
          unreleased: ["0xa3b52d5a6d2f8932a5cd921e09da840092349d71", "0x34f93b12ca2e13c6e64f45cfa36eabadd0ba30fc"],
        },
      },
    },
  },
  /*
  {
    id: "35",
    name: "MAI",
    address: "polygon:0xa3fa99a148fa48d14ed51d610c367c61876997f1",
    symbol: "MAI",
    url: "https://www.mai.finance/",
    description:
      "MAI is a USD-pegged stablecoin backed by collateral available on many chains.",
    mintRedeemDescription:
      "Using the Mai Finance app, users mint MAI by depositing an accepted collateral asset into a vault. When the loan is repaid to retrieve the collateral, the paid back MAI is burned.",
    onCoinGecko: "true",
    gecko_id: "mimatic",
    cmcId: "10238",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/QiDaoProtocol",
    wiki: "https://wiki.defillama.com/wiki/MAI",
  },
  /*{
    id: "36", // discontinued stable
    name: "Ratio Stable Coin",
    address: "solana:USDrbBQwQbQ2oWHUPfA8QBHcyVxKUq1xHyXsSLKdUq2",
    symbol: "USDR",
    url: "https://ratio.finance/",
    description:
      "USDr is an algorithmically risk-adjusted Collateralized Debt Position. Users can mint USDr using stable yield-bearing assets, starting with stablecoin LP from Saber.",
    mintRedeemDescription:
      "USDr is minted by depositing an accepted collateral asset into Ratio Finance. The collateral is used to generate yield that pays down the USDr debt. Any USDr used to repay the loan to retrieve the collateral is burned.",
    onCoinGecko: "true",
    gecko_id: "ratio-stable-coin",
    module: "ratio-stable-coin",

    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/ratiofinance",
    wiki: "https://wiki.defillama.com/wiki/USDR",
  },*/
  {
    id: "37",
    name: "USDJ",
    address: "tron:TMwFHYXLJaRUPeW6421aqXL4ZEzPRFGkGT",
    symbol: "USDJ",
    url: "https://just.network/",
    description:
      "USDJ is a fully collateral-backed USD-pegged stablecoin on Tron.",
    mintRedeemDescription:
      "Using the JustStable app, users mint USDJ by depositing TRX into a vault. When the loan is repaid to retrieve the collateral, the paid back USDJ is burned.",
    onCoinGecko: "true",
    gecko_id: "just-stablecoin",
    cmcId: "5446",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://just.tronscan.org/docs/audit-report-just_cn.pdf"],
    twitter: "https://twitter.com/defi_just",
    wiki: "https://wiki.defillama.com/wiki/USDJ",
    chainConfig: {
      chains: {
        tron: {
          issued: ["TMwFHYXLJaRUPeW6421aqXL4ZEzPRFGkGT"],
          // Tron Foundation-held reserves, subtracted from circulating.
          reserves: [
            "TL5x9MtSnDy537FXKx53yAaHRRNdg9TkkA",
            "TPyjyZfsYaXStgz2NmAraF1uZcMtkgNan5",
          ],
        },
      },
    },
  },
  {
    id: "38",
    name: "STBL",
    address: "algorand:465865291",
    symbol: "STBL",
    url: "https://www.algofi.org/",
    description:
      "STBL is an algorithmic over-collateralized stablecoin that is native to the Algofi protocol.",
    mintRedeemDescription:
      "Using the Algofi app, users mint STBL by depositing an accepted collateral asset into a vault. When the loan is repaid to retrieve the collateral, the paid back STBL is burned.",
    onCoinGecko: false,
    gecko_id: "algostable",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/algofiorg",
    wiki: "https://wiki.defillama.com/wiki/Algofi",
    module: "stbl",
  },
  {
    id: "39",
    name: "VOLT Protocol",
    address: "0x559ebc30b0e58a45cc9ff573f77ef1e5eb1b3e18",
    symbol: "VOLT",
    url: "https://www.voltprotocol.io/",
    description:
      "VOLT is a stablecoin that uses a custom oracle system to stay pegged to the purchasing power of the US Dollar.",
    mintRedeemDescription:
      "Using the Volt Protocol app, users swap FEI or USDC to mint VOLT at the current exchange rate. VOLT can be redeemed for FEI or USDC at any time.",
    onCoinGecko: "false",
    gecko_id: null,
    module: "volt-protocol",
    cmcId: null,
    pegType: "peggedVAR",
    pegMechanism: "algorithmic",
    priceSource: "defillama", // curve has no liqudity, and coingecko not giving accurate price
    auditLinks: null,
    twitter: "https://twitter.com/voltprotocol",
    wiki: "https://wiki.defillama.com/wiki/Volt_Protocol",
  },
  {
    id: "40",
    name: "Rai Reflex Index",
    address: "0x03ab458634910aad20ef5f1c8ee96f1d6ac54919",
    symbol: "RAI",
    url: "https://reflexer.finance/",
    description:
      "RAI is a collateralized, non-pegged asset with low volatility compared to its ETH collateral.",
    mintRedeemDescription:
      "Users mint RAI by depositing ETH as collateral into Rai safes. When the loan is repaid to retrieve the collateral, the paid back RAI is burned.",
    onCoinGecko: "true",
    gecko_id: "rai",
    cmcId: "8525",
    pegType: "peggedVAR",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/reflexerfinance",
    wiki: "https://wiki.defillama.com/wiki/RAI",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x03ab458634910aad20ef5f1c8ee96f1d6ac54919"],
        },
        polygon: {
          bridgedFromETH: ["0x00e5646f60ac6fb446f621d146b6e1886f002905"],
        },
        optimism: {
          bridgedFromETH: ["0x7fb688ccf682d58f86d7e38e03f9d22e7705448b"],
        },
        arbitrum: {
          bridgedFromETH: ["0xaeF5bbcbFa438519a5ea80B4c7181B4E78d419f2"],
        },
        avax: {
          bridgedFromETH: ["0x97cd1cfe2ed5712660bb6c14053c0ecb031bff7d"],
        },
        xdai: {
          bridgedFromETH: ["0xd7a28Aa9c470e7e9D8c676BCd5dd2f40c5683afa"],
        },
        loopring: {
          bridgeOnETH: ["0x674bdf20A0F284D710BC40872100128e2d66Bd3f"],
        },
      },
    },
  },
  {
    id: "41",
    name: "Float Protocol Float",
    address: "0xb05097849bca421a3f51b249ba6cca4af4b97cb9",
    symbol: "FLOAT",
    url: "https://floatprotocol.com/",
    description:
      "FLOAT is a stablecoin that tracks a basket of crypto assets instead of trying to exactly match the price of a dollar.",
    mintRedeemDescription:
      "If the price of FLOAT is away from its target price, the supply is changed by minting (expansion) or buying up and burning FLOAT (contraction). This is done through a dutch auction (in an expansion) and a reverse dutch auction (in a contraction), respectively.",
    onCoinGecko: "false",
    gecko_id: null,
    module: "float-protocol-float",
    cmcId: "9861",
    pegType: "peggedVAR",
    pegMechanism: "algorithmic",
    priceSource: "defillama", // has low liquidity Uni pool. had pools on dexscreener but they rugged. coingecko is not updating.
    auditLinks: null,
    twitter: "https://twitter.com/FloatProtocol",
    wiki: "https://wiki.defillama.com/wiki/Float_Protocol",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xb05097849bca421a3f51b249ba6cca4af4b97cb9"],
        },
      },
    },
  },
  {
    id: "42",
    name: "USDX",
    address: null,
    symbol: "USDX",
    url: "https://www.kava.io/",
    description:
      "USDX is the crypto-backed native stablecoin of the Kava DeFi hub.",
    mintRedeemDescription:
      "Using the Kava app, users mint USDX by depositing an accepted collateral asset into a vault. When the loan is repaid to retrieve the collateral, the paid back USDX is burned.",
    onCoinGecko: "true",
    gecko_id: "usdx",
    cmcId: "6651",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/kava_platform",
    wiki: "https://wiki.defillama.com/wiki/USDX",
  },
  {
    id: "43",
    name: "ZUSD",
    address: "0xc56c2b7e71b54d38aab6d52e94a04cbfa8f604fa",
    symbol: "ZUSD",
    url: "https://stablecoin.z.com/zusd/",
    description:
      "ZUSD is a 100% fiat-backed USD-pegged stablecoin on Ethereum that is always redeemable 1:1.",
    mintRedeemDescription:
      "GMO-Z.com Trust Company customers who have undergone a verification process can exchange USD for ZUSD and redeem ZUSD for USD.",
    onCoinGecko: "false",
    gecko_id: null,
    module: "zusd",

    cmcId: "8772",
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama", // coingecko inaccurate
    auditLinks: ["https://stablecoin.z.com/attestation/"],
    twitter: "https://twitter.com/GMOTrust",
    wiki: "https://wiki.defillama.com/wiki/ZUSD",
  },
  {
    id: "44",
    name: "dForce USD",
    address: "0x0a5E677a6A24b2F1A2Bf4F3bFfC443231d2fDEc8",
    symbol: "USX",
    url: "https://dforce.network/",
    description:
      "An omni decentralized stablecoin protocol. USX is an omni-decentralized stablecoin, serving as a conduit to facilitate interoperability across multiple Ethereum and Bitcoin L1/L2s. USX unlocks seamless access to real yields backed by RWA, providing additional value to holders beyond price stability. USX also leverages AI technologies to enhance its functionalities and management",
    mintRedeemDescription:
      "Using the dForce Network app, users mint USX by depositing an accepted collateral asset into a vault. When the loan is repaid to retrieve the collateral, the paid back USX is burned. Users can borrow USX from whitelisted lending protocols which have had their USX liquidity issued algorithmically.",
    onCoinGecko: "true",
    gecko_id: "token-dforce-usd",
    cmcId: "13080",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/dForcenet",
    wiki: "https://wiki.defillama.com/wiki/USX",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x0a5E677a6A24b2F1A2Bf4F3bFfC443231d2fDEc8"],
          unreleased: ["0x9e8b68e17441413b26c2f18e741eaba69894767c", "0x40be37096ce3b8a2e9ec002468ab91071501c499", "0x5427fefa711eff984124bfbb1ab6fbf5e3da1820"],
        },
        polygon: {
          issued: ["0xCf66EB3D546F0415b368d98A95EAF56DeD7aA752"],
          unreleased: ["0x88DCDC47D2f83a99CF0000FDF667A468bB958a78"],
        },
        bsc: {
          issued: ["0xb5102cee1528ce2c760893034a4603663495fd72"],
          unreleased: ["0xdd90e5e87a2081dcf0391920868ebc2ffb81a1af"],
        },
        avax: {
          issued: ["0x853ea32391AaA14c112C645FD20BA389aB25C5e0"],
          unreleased: ["0xef3c714c9425a8F3697A9C969Dc1af30ba82e5d4", "0x73C01B355F2147E5FF315680E068354D6344Eb0b"],
        },
        kava: {
          issued: ["0xDb0E1e86B01c4ad25241b1843E407Efc4D615248"],
          unreleased: ["0xb51541df05DE07be38dcfc4a80c05389A54502BB", "0x9787aF345E765a3fBf0F881c49f8A6830D94A514"],
        },
        arbitrum: {
          issued: ["0x641441c631e2f909700d2f41fd87f0aa6a6b4edb"],
          unreleased: ["0x9e8b68e17441413b26c2f18e741eaba69894767c", "0x1619de6b6b20ed217a58d00f37b9d47c7663feca"],
        },
        optimism: {
          issued: ["0xbfD291DA8A403DAAF7e5E9DC1ec0aCEaCd4848B9"],
          unreleased: ["0x40a33fb67b8dafe88a5b1930be03c82157f47c65", "0x9D39Fc627A6d9d9F8C831c16995b209548cc3401"],
        },
        conflux: {
          issued: ["0x422a86f57b6b6F1e557d406331c25EEeD075E7aA"],
          unreleased: ["0x841ce48F9446C8E281D3F1444cB859b4A6D0738C", "0x6f87b39a2e36F205706921d81a6861B655db6358"],
        },
        base: {
          issued: ["0xc142171B138DB17a1B7Cb999C44526094a4dae05"],
          unreleased: ["0x7d43AABC515C356145049227CeE54B608342c0ad"],
        },
      },
    },
  },
  {
    id: "45",
    name: "aUSD Seed",
    address: null,
    symbol: "aSEED",
    url: "https://acala.network/",
    description:
      "aSEED is the native decentralized stablecoin of Polkadot pegged to the US Dollar and backed only by decentralized assets in Collateralized Debt Positions (CDP).", // aUSD will be converted to aSEED 1:1 across all avenues including account balance, and liquidity pools etc.
    mintRedeemDescription:
      "Using the Acala app, users mint aSEED by depositing an accepted collateral asset into a vault. When the loan is repaid to retrieve the collateral, the paid back aUSD is burned.",
    onCoinGecko: "true",
    gecko_id: "ausd-seed-karura",
    cmcId: "20411",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    deadFrom: "2022-08-15",
    twitter: "https://twitter.com/AcalaNetwork",
    wiki: "https://wiki.defillama.com/wiki/Acala",
    chainConfig: {
      chains: {
        acala: {},
        karura: {},
      },
    },
  },
  {
    id: "46",
    name: "Overnight USD+",
    address: "polygon:0x236eec6359fb44cce8f97e99387aa7f8cd5cde1f",
    symbol: "USD+",
    url: "https://overnight.fi/",
    description:
      "USD+ is USDC that pays yield daily via rebase. The USD+ stablecoin can be instantly minted and redeemed to USDC 1:1.",
    mintRedeemDescription:
      "Using the Overnight app, users swap USDC to mint USD+ 1:1. USD+ can be redeemed for USDC 1:1 at any time.",
    onCoinGecko: "true",
    gecko_id: "usd",
    cmcId: "20317",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama", // for all dexscreener pools with high liquidity, dexscreener api does not give their liquidity.
    auditLinks: null,
    twitter: "https://twitter.com/overnight_fi",
    wiki: "https://wiki.defillama.com/wiki/Overnight",
    chainConfig: {
      chains: {
        polygon: {
          issued: ["0x236eec6359fb44cce8f97e99387aa7f8cd5cde1f"],
        },
        bsc: {
          issued: ["0xe80772Eaf6e2E18B651F160Bc9158b2A5caFCA65"],
        },
        arbitrum: {
          issued: ["0xe80772Eaf6e2E18B651F160Bc9158b2A5caFCA65"],
        },
        optimism: {
          issued: ["0x73cb180bf0521828d8849bc8CF2B920918e23032"],
        },
        era: {
          issued: ["0x8E86e46278518EFc1C5CEd245cBA2C7e3ef11557"],
        },
        avax: {
          issued: ["0xe80772Eaf6e2E18B651F160Bc9158b2A5caFCA65"],
        },
        linea: {
          issued: ["0xB79DD08EA68A908A97220C76d19A6aA9cBDE4376"],
        },
        base: {
          issued: ["0xB79DD08EA68A908A97220C76d19A6aA9cBDE4376"],
        },
        blast: {
          issued: ["0x4fEE793d435c6D2c10C135983BB9d6D4fC7B9BBd", "0x870a8F46b62B8BDeda4c02530C1750CddF2ED32e"],
        },
      },
    },
  },
  /*
  {
    id: "47",
    name: "DEI",
    address: "fantom:0xDE1E704dae0B4051e80DAbB26ab6ad6c12262DA0",
    symbol: "DEI",
    url: "https://deus.finance/",
    description:
      "DEI is a fractional reserve USD-pegged stablecoin and is the unit of account for all trading within the DEUS Finance ecosystem.",
    mintRedeemDescription:
      "Using the Deus Finance app, DEI can be minted by locking USDC and burning DEUS in a proportion determined by the protocol's collateral ratio.",
    onCoinGecko: "false",
    gecko_id: null,
    cmcId: "12517",
    pegType: "peggedUSD",
    pegMechanism: "algorithmic",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/DeusDao",
    wiki: "https://wiki.defillama.com/wiki/Deus_Finance",
  },
  */
  {
    id: "48",
    name: "BAI Stablecoin",
    address: "astar:0x733ebcc6df85f8266349defd0980f8ced9b45f35",
    symbol: "BAI",
    url: "https://astriddao.xyz/",
    description:
      "AstridDAO is a decentralized borrowing protocol on Astar that allows you to draw interest-free loans against multiple collateral assets (e.g. ASTR, ETH, BTC, and etc.). Loans are paid out in BAI (a USD pegged stablecoin).",
    mintRedeemDescription:
      "Using the AstridDAO app, users mint BAI by depositing an accepted collateral asset into a vault. When the loan is repaid to retrieve the collateral, the paid back BAI is burned.",
    onCoinGecko: "true",
    gecko_id: "bai-stablecoin",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://www.certik.com/projects/astriddao"],
    twitter: "https://twitter.com/AstridDAO",
    wiki: "https://wiki.defillama.com/wiki/AstridDAO",
    chainConfig: {
      chains: {
        astar: {
          issued: ["0x733ebcC6DF85f8266349DEFD0980f8Ced9B45f35"],
        },
      },
    },
  },
  {
    id: "49",
    name: "Euro Tether",
    address: "0xc581b735a1688071a1746c968e0798d642ede491",
    symbol: "EURT",
    url: "https://tether.to/",
    description:
      "Launched in 2014, Tether tokens pioneered the stablecoin model. Tether tokens are pegged to real-world currencies on a 1-to-1 basis. This offers traders, merchants and funds a low volatility solution when exiting positions in the market.",
    mintRedeemDescription:
      "Tether customers who have undergone a verification process can exchange EUR for EURT and redeem EURT for EUR.",
    onCoinGecko: "true",
    gecko_id: "tether-eurt",
    cmcId: "10789",
    pegType: "peggedEUR",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: ["https://tether.to/en/transparency/#reports"],
    twitter: "https://twitter.com/Tether_to",
    wiki: "https://wiki.defillama.com/wiki/EURT",
    deadFrom: "2025-12-15",
    chainConfig: {
      decimals: 6,
      chains: {
        ethereum: {
          issued: ["0xC581b735A1688071A1746c968e0798D642EDE491"],
          unreleased: ["0x5754284f345afc66a98fbb0a0afe71e0f007b949"],
        },
        polygon: {
          bridgedFromETH: ["0x7BDF330f423Ea880FF95fC41A280fD5eCFD3D09f"],
        },
      },
    },
  },
  {
    id: "50",
    name: "EURC", // previous Euro Coin
    address: "0x1abaea1f7c830bd89acc67ec4af516284b1bc33c",
    symbol: "EURC",
    url: "https://www.circle.com/",
    description:
      "EUROC is issued by Circle under the same full-reserve model as USD Coin (USDC). Euro Coin is 100% backed by euros held in euro-denominated banking accounts so that it's always redeemable 1:1 for euros.",
    mintRedeemDescription:
      "An eligible business can exchange EUR for EUROC and redeem EUROC for EUR through a Circle Account.",
    onCoinGecko: "true",
    gecko_id: "euro-coin",
    cmcId: "20641",
    pegType: "peggedEUR",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: ["https://www.centre.io/usdc-transparency"],
    twitter: "https://twitter.com/circlepay",
    wiki: "https://wiki.defillama.com/wiki/EUROC",
    module: "eurc",
    bridgeConfig: {
      hyperlaneConfig: {
        // Hyperlane has one EURC warp route with two EvmHypCollateral endpoints
        // and zero synthetic destinations. The generated config will have an
        // empty tokens[]. Wiring included for consistency and future routes.
      },
    },
  },
  {
    id: "51",
    name: "Stasis Euro",
    address: "0xdb25f211ab05b1c97d595516f45794528a807ad8",
    symbol: "EURS",
    url: "https://stasis.net/",
    description: "EURS, an ERC/EIP20 token, is a euro-backed digital asset.",
    mintRedeemDescription:
      "Stasis customers who have undergone a verification process can exchange EUR for EURS and redeem EURS for EUR.",
    onCoinGecko: "true",
    gecko_id: "stasis-eurs",
    cmcId: "2989",
    pegType: "peggedEUR",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: ["https://stasis.net/transparency"],
    twitter: "https://twitter.com/stasisnet",
    wiki: "https://wiki.defillama.com/wiki/EURS",
  },
  {
    id: "52",
    name: "Mento Euro",
    address: "celo:0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73",
    symbol: "EURm",
    url: "https://www.mento.org/",
    description:
      "Mento Euros (EURm) are stablecoins that follow the Euro and are native to the Celo blockchain's Reserve system. The Mento Reserve is a system of smart contracts that uses a portfolio of cryptocurrencies to expand and contract the supply cEUR, similar to MakerDAO's lending protocol.",
    mintRedeemDescription:
      "Using the Mento app, 1 Euro worth of CELO can be sent to the CELO reserve to mint 1 cEUR, and 1 cEUR can be burned to receive 1 Euro worth of CELO.",
    onCoinGecko: "true",
    gecko_id: "celo-euro",
    cmcId: "9467",
    pegType: "peggedEUR",
    pegMechanism: "algorithmic",
    priceSource: "defillama",
    auditLinks: ["https://docs.mento.org/mento-v3/build/smart-contracts/audits"],
    twitter: "https://x.com/MentoLabs",
    wiki: "https://wiki.defillama.com/wiki/CEUR",
    chainConfig: {
      chains: {
        celo: {
          issued: ["0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73"],
        },
        ethereum: {
          bridgedFromCelo: ["0x977453366b8d205f5c9266b6ba271e850a814a50"],
        },
        polygon: {
          bridgedFromCelo: ["0x2f0173dFE97a7Dc670D5A10b35C4263cfEcFa853"],
        },
        solana: {
          bridgedFromCelo: ["7g166TuBmnoHKvS2PEkZx6kREZtbfjUxCHGWjCqoDXZv"],
        },
        monad: {
          bridgedFromCelo: ["0x4D502d735B4C574B487Ed641ae87cEaE884731C7"],
        },
      },
    },
  },
  {
    id: "53",
    name: "sEUR",
    address: "0xd71ecff9342a5ced620049e616c5035f1db98620",
    symbol: "SEUR",
    url: "https://synthetix.io/",
    description:
      "Synthetix is a protocol for issuing and trading synthetic assets on Ethereum. Each synthetic asset (or Synth) is an ERC20 token which tracks the price of an external asset; for example each sEUR token tracks the price of the Euro.",
    mintRedeemDescription:
      "An SNX holder can mint sEUR by locking their SNX as collateral via the Synthetix smart contract. sEUR can be burned to swap to another synthetic asset or to repay the debt to retrieve the collateral.",
    onCoinGecko: "true",
    gecko_id: "seur",
    cmcId: "10419",
    pegType: "peggedEUR",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/synthetix_io",
    wiki: "https://wiki.defillama.com/wiki/Synthetix",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xd71ecff9342a5ced620049e616c5035f1db98620"],
        },
        optimism: {
          issued: ["0xFBc4198702E81aE77c06D58f81b629BDf36f0a71"],
        },
      },
    },
  },
  {
    id: "54",
    name: "USN",
    address: null,
    symbol: "USN",
    url: "https://decentral-bank.finance/",
    description: "USN is a NEAR-native stablecoin.",
    mintRedeemDescription:
      "Using the Decentral Bank app, users swap USDT to mint USN 1:1. USN can be redeemed for USDT 1:1 at any time.",
    onCoinGecko: "false",
    gecko_id: null,
    module: "usn",

    cmcId: "19682",
    pegType: "peggedUSD",
    pegMechanism: "algorithmic",
    priceSource: "defillama",
    auditLinks: null,
    deadFrom: "2022-10-24",
    twitter: "https://twitter.com/DcntrlBank",
    wiki: "https://wiki.defillama.com/wiki/USN",
  },
  {
    id: "55",
    name: "EURA", // previous ageur
    address: "0x1a7e4e63778b4f12a199c062f3efdd288afcbce8",
    symbol: "EURA",
    url: "https://www.angle.money/",
    description:
      "Angle Protocol aims at creating a sustainable money layer for blockchains. It is currently issuing agEUR, the most liquid Euro stablecoin on Ethereum and other chains.",
    mintRedeemDescription:
      "Using the Angle app, users mint agEUR by depositing an accepted collateral asset into a vault. When the loan is repaid to retrieve the collateral, the paid back agEUR is burned.",
    onCoinGecko: "true",
    gecko_id: "ageur",
    cmcId: "15024",
    pegType: "peggedEUR",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/AngleProtocol",
    wiki: "https://wiki.defillama.com/wiki/AGEUR",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x1a7e4e63778b4f12a199c062f3efdd288afcbce8"],
        },
        polygon: {
          bridgedFromETH: ["0xe0b52e49357fd4daf2c15e02058dce6bc0057db4"],
        },
        optimism: {
          issued: ["0x9485aca5bbBE1667AD97c7fE7C4531a624C8b1ED"],
        },
        arbitrum: {
          issued: ["0xFA5Ed56A203466CbBC2430a43c66b9D8723528E7"],
        },
        solana: {
          bridgedFromETH: ["CbNYA9n3927uXUukee2Hf4tm3xxkffJPPZvGazc2EAH1"],
        },
        fuse: {
          bridgedFromETH: ["0xeFAeeE334F0Fd1712f9a8cc375f427D9Cdd40d73"],
        },
        zksync: {
          bridgeOnETH: ["0xabea9132b05a70803a4e85094fd0e1800777fbef"],
        },
        fantom: {
          bridgedFromETH: ["0x02a2b736F9150d36C0919F3aCEE8BA2A92FBBb40"],
        },
        aurora: {
          bridgedFromETH: ["0xdc7AcDE9ff18B4D189010a21a44cE51ec874eA7C"],
        },
      },
    },
  },
  {
    id: "56",
    name: "Parallel",
    address: "0x68037790a0229e9ce6eaa8a99ea92964106c4703",
    symbol: "PAR",
    url: "https://mimo.capital/",
    description:
      "The PAR token is a price-stable token pegged to the Euro. Users generate PAR by depositing collateral assets into MIMO vaults within the MIMO protocol.",
    mintRedeemDescription:
      "Using the MIMO app, users mint PAR by depositing an accepted collateral asset into a vault. When the loan is repaid to retrieve the collateral, the paid back PAR is burned.",
    onCoinGecko: "true",
    gecko_id: "par-stablecoin",
    cmcId: "8665",
    pegType: "peggedEUR",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/mimodefi",
    wiki: "https://wiki.defillama.com/wiki/PAR",
    chainConfig: {
      chains: {
        ethereum: { issued: ["0x68037790a0229e9ce6eaa8a99ea92964106c4703"] },
        polygon: { bridgedFromETH: ["0xe2aa7db6da1dae97c5f5c6914d285fbfcc32a128"] },
        fantom: { bridgedFromETH: ["0x13082681e8ce9bd0af505912d306403592490fc7"] },
      },
    },
  },
  {
    id: "57",
    name: "Hedge USD",
    address: "solana:9iLH8T7zoWhY7sBmj1WK9ENbWdS1nL8n9wAxaeRitTa6",
    symbol: "USH",
    url: "https://www.hedge.so/",
    description:
      "Hedge is a protocol that enables the minting of USH, a stablecoin soft-pegged to the US dollar. USH is minted on flexible terms and gives users instant access to the USH ecosystem.",
    mintRedeemDescription:
      "Using the Hedge app, users mint USH by depositing an accepted collateral asset into a vault. When the loan is repaid to retrieve the collateral, the paid back USH is burned.",
    onCoinGecko: "true",
    gecko_id: "hedge-usd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://docs.hedge.so/protocol-overview/security"],
    twitter: "https://twitter.com/HedgeLabs",
    wiki: "https://wiki.defillama.com/wiki/USH",
    chainConfig: {
      decimals: 9,
      chains: {
        solana: {
          issued: ["9iLH8T7zoWhY7sBmj1WK9ENbWdS1nL8n9wAxaeRitTa6"],
        },
      },
    },
  },
  {
    id: "58",
    name: "3USD",
    address: "karura:9iLH8T7zoWhY7sBmj1WK9ENbWdS1nL8n9wAxaeRitTa6",
    symbol: "3USD",
    url: "https://www.taigaprotocol.io/",
    description:
      "3pool on Karura made of aUSD, USDC, USDT is the first stablecoin pool powering the Kusama ecosystem. Liquidity providers will get 3USD token after adding liquidity.",
    mintRedeemDescription:
      "Using the Karura app, users receive 3USD LP tokens by adding aUSD, USDC, or USDT liquidity. LP tokens can be redeemed for the underlying assets.",
    onCoinGecko: "false",
    gecko_id: null,

    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: null,
    auditLinks: null,
    twitter: "https://twitter.com/TaigaProtocol",
    wiki: "https://wiki.defillama.com/wiki/Taiga_Protocol",
    deadUrl: true,
    chainConfig: {
      chains: {
        karura: {
          issued: ["0x0000000000000000000300000000000000000001"],
        },
      },
    },
  },
  {
    id: "59",
    name: "SigmaUSD",
    address: null,
    symbol: "SIGUSD",
    url: "https://sigmausd.io/",
    description:
      "SigmaUSD is a UTxO-based stable coin on the Ergo blockchain - an instantiation of the AgeUSD protocol.",
    mintRedeemDescription:
      "Using the SigmaUSD app, users swap ERG for the equivalent value of SigUSD. The SigUSD is backed by collateral ERG provided by Reserve Providers at a reserve ratio of 400% - 800%.",
    onCoinGecko: "false",
    gecko_id: null,
    module: "sigmausd",

    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "algorithmic",
    priceSource: null,
    auditLinks: null,
    twitter: "https://twitter.com/ergoplatformorg",
    wiki: "https://wiki.defillama.com/wiki/Ergo",
  },
  {
    id: "60",
    name: "HomeCoin",
    address: "0xb8919522331c59f5c16bdfaa6a121a6e03a91f62",
    symbol: "HOME",
    url: "https://www.homecoin.finance/",
    description: "A stablecoin backed by U.S. Homes.",
    mintRedeemDescription:
      "Using the Bacon app, users swap USDC to mint HOME 1:1. HOME can be redeemed for USDC 1:1 at any time.",
    onCoinGecko: "false",
    gecko_id: null,
    module: "bacon-protocol-home",

    cmcId: "20520",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/homecoinfinance",
    wiki: "https://wiki.defillama.com/wiki/HomeCoin",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xb8919522331C59f5C16bDfAA6A121a6E03A91F62"],
        },
      },
    },
  },
  {
    id: "61",
    name: "Fixed Income Asset Token",
    address: "0x586Aa273F262909EEF8fA02d90Ab65F5015e0516",
    symbol: "FIAT",
    url: "https://fiatdao.com/",
    description:
      "The FIAT protocol allows users to mint a single ERC-20 token, $FIAT, against a universe of accepted fixed income asset collateral.",
    mintRedeemDescription:
      "Using the FIAT DAO app, users by depositing an accepted fixed income collateral asset into a vault. When the loan is repaid to retrieve the collateral, the paid back FIAT is burned.",
    onCoinGecko: "false",
    gecko_id: null,
    module: "fixed-income-asset-token",

    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/fiatdao",
    wiki: "https://wiki.defillama.com/wiki/FIATDAO",
    deadUrl: true,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x586aa273f262909eef8fa02d90ab65f5015e0516"],
        },
      },
    },
  },
  {
    id: "62",
    name: "PUSd",
    address: "0x466a756e9a7401b5e2444a3fcb3c2c12fbea0a54",
    symbol: "PUSD",
    url: "https://jpegd.io/",
    description:
      "PUSd is a synthetic stablecoin minted against NFT collateralized debt positions.",
    mintRedeemDescription:
      "Using the JPEG'd app, users mint PUSd by depositing an accepted NFT into a vault. When the loan is repaid to retrieve the NFT, the paid back PUSd is burned.",
    onCoinGecko: "false",
    gecko_id: null,
    module: "pusd-2",

    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/JPEGd_69",
    wiki: "https://wiki.defillama.com/wiki/JPEGd",
    deadUrl: true,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x466a756e9a7401b5e2444a3fcb3c2c12fbea0a54"],
          unreleased: ["0x51c2cef9efa48e08557a361b52db34061c025a1b"],
        },
      },
    },
  },
  {
    id: "63",
    name: "Fantom USD",
    address: "fantom:0xad84341756bf337f5a0164515b1f6f993d194e1f",
    symbol: "FUSD",
    url: "https://fantom.foundation/defi/",
    description: "fMint is the gateway to Fantom DeFi.",
    mintRedeemDescription:
      "Mint fUSD, the stablecoin on Fantom pegged 1:1 to the USD price, using your FTM. Choose the amount you want to mint and rebalance at any time by adding or removing FTM. Repay the fUSD you minted at any time, unlocking your FTM.",
    onCoinGecko: "false",
    gecko_id: null,
    module: "fantom-usd",
    cmcId: "16831",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/fantomfdn/",
    wiki: "https://wiki.defillama.com/wiki/Fantom",
    deadFrom: "2022-04-17",
    chainConfig: {
      chains: {
        fantom: {
          issued: ["0xad84341756bf337f5a0164515b1f6f993d194e1f"],
          unreleased: ["0x431e81e5dfb5a24541b5ff8762bdef3f32f96354", "0x9c8aef3a8792094aede3cd67f52296e21c801b81"],
        },
      },
    },
  },
  {
    id: "64",
    name: "UXD Stablecoin",
    address: "solana:7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT",
    symbol: "UXD",
    url: "https://uxd.fi/",
    description:
      "UXD Protocol is a fully collateralized decentralized stablecoin on Solana backed by delta-neutral position using derivatives.",
    mintRedeemDescription:
      "Using the UXD Protocol app, users mint UXD by depositing SOL into the protocol where it establishes a derivatives trading position on decentralized exchanges. When the loan is repaid to retrieve the collateral SOL, the paid back UXD is burned.",
    onCoinGecko: "true",
    gecko_id: "uxd-stablecoin",
    cmcId: "17535",
    pegType: "peggedUSD",
    pegMechanism: "algorithmic",
    priceSource: "defillama",
    auditLinks: ["https://docs.uxd.fi/uxdprotocol/resources/audits"],
    twitter: "https://twitter.com/UXDProtocol",
    wiki: "https://wiki.defillama.com/wiki/UXD_Protocol",
    chainConfig: {
      chains: {
        solana: {
          issued: ["7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT"],
        },
      },
    },
  },
  {
    id: "65",
    name: "USDH",
    address: "solana:USDH1SM1ojwWUga67PGrgFWUHibbjqMvuMaDkRJTgkX",
    symbol: "USDH",
    url: "https://hubbleprotocol.io/",
    description:
      "USDH is a censorship-resistant, crypto-backed stablecoin on Solana, soft-pegged to the US Dollar. USDH is fully collateralized by a basket of crypto assets, deposited into a Hubble Smart Contract.",
    mintRedeemDescription:
      "Using the Hubble Protocol app, users mint USDH by depositing an accepted collateral asset into a vault. When the loan is repaid to retrieve the collateral, the paid back USDH is burned.",
    onCoinGecko: "true",
    gecko_id: "usdh",
    cmcId: "19550",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://hubble-markets.gitbook.io/hubble-protocol-official-docs/documentation/security-audits"],
    twitter: "https://twitter.com/hubbleprotocol",
    wiki: "https://wiki.defillama.com/wiki/Hubble_Protocol",
    chainConfig: {
      chains: {
        solana: {
          issued: ["USDH1SM1ojwWUga67PGrgFWUHibbjqMvuMaDkRJTgkX"],
        },
      },
    },
  },
  {
    id: "66",
    name: "Frax Price Index",
    address: "0x5ca135cb8527d76e932f34b5145575f9d8cbe08e",
    symbol: "FPI",
    url: "https://frax.com/",
    description:
      "The Frax Price Index (FPI) is the second stablecoin of the Frax Finance ecosystem. FPI is a stablecoin pegged to a basket of real-world consumer items as defined by the US CPI-U average.",
    mintRedeemDescription:
      "Using the Frax Finance app, users swap FRAX to mint FPI at the current exchange rate. FPI can be redeemed for FRAX at any time.",
    onCoinGecko: "true",
    gecko_id: "frax-price-index",
    cmcId: null,
    pegType: "peggedVAR",
    pegMechanism: "algorithmic",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/fraxfinance",
    wiki: "https://wiki.defillama.com/wiki/Frax",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x5ca135cb8527d76e932f34b5145575f9d8cbe08e"],
        },
        era: {
          issued: ["0xD405617DB7473b0A3158356Be7bC9EbEc6D88b85"],
        },
      },
    },
  },
  {
    id: "67",
    name: "Bean",
    address: "0xBEA0000029AD1c77D3d5D23Ba2D8893dB9d1Efab",
    symbol: "BEAN",
    url: "https://bean.money/",
    description:
      "Beanstalk is a permissionless fiat stablecoin protocol built on Ethereum.",
    mintRedeemDescription:
      "Beanstalk uses the liquidity and time weighted average shortage or excess of Beans in the BEAN:3CRV pool to dynamically increase the Bean supply or burn it and issue debt in order to maintain its peg.",
    onCoinGecko: "false",
    gecko_id: "bean", // should be updated once it is added to CG
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "algorithmic",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/beanstalkfarms",
    wiki: "https://wiki.defillama.com/wiki/Beanstalk",
    module: "bean2",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xBEA0000029AD1c77D3d5D23Ba2D8893dB9d1Efab"],
        },
      },
    },
  },
  {
    id: "68",
    name: "USDLemma",
    address: "0xdb41ab644AbcA7f5ac579A5Cf2F41e606C2d6abc",
    symbol: "USDL",
    url: "https://www.lemma.finance/",
    description:
      "Lemma is a decentralized finance (DeFi) protocol with two products: a leveraged basis trading vault and USDL, a stablecoin that is fully decentralized, 100% capital efficient and USD pegged.",
    mintRedeemDescription:
      "Using the Lemma Finance app, users mint USDL by depositing an accepted asset into the protocol where it establishes a market neutral trading position on decentralized exchanges. When the loan is repaid to retrieve the collateral, the paid back USDL is burned.",
    onCoinGecko: "false",
    gecko_id: null,
    module: "usdlemma",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "algorithmic",
    priceSource: null,
    auditLinks: null,
    twitter: "https://twitter.com/LemmaFinance",
    wiki: "https://wiki.defillama.com/wiki/LemmaFinance",
    deprecated: true,
    deadUrl: true,
    chainConfig: {
      chains: {
        arbitrum: {
          issued: ["0xdb41ab644AbcA7f5ac579A5Cf2F41e606C2d6abc"],
        },
        optimism: {
          issued: ["0x96F2539d3684dbde8B3242A51A73B66360a5B541"],
        },
      },
    },
  },
  /*{
    id: "69",
    name: "Pando USD",
    address: null,
    symbol: "PUSD",
    url: "https://pando.im/",
    description:
      "Pando USD is a stablecoin pegged to the US Dollar on the Mixin Network.",
    mintRedeemDescription:
      "Using the Pando Leaf app, users mint PUSD by depositing an accepted collateral asset into a vault. When the loan is repaid to retrieve the collateral, the paid back PUSD is burned.",
    onCoinGecko: "true",
    gecko_id: "pando-usd",
    module: "pando-usd",

    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/pando_im",
    wiki: "https://wiki.defillama.com/wiki/Pando",
    delisted: true,
  },*/
  {
    id: "70",
    name: "DigitalDollar",
    address: "arbitrum:0xf0b5ceefc89684889e5f7e0a7775bd100fcd3709",
    symbol: "DUSD",
    url: "https://fluid.ch/",
    description:
      "DUSD is a secure, transparent, democratic Digital Dollar on Arbitrum. All DUSD are 1:1 backed by real dollars.",
    mintRedeemDescription:
      "Fluid customers who have undergone a verification process can exchange USD for DUSD and redeem DUSD for USD.",
    onCoinGecko: "false",
    gecko_id: null,
    module: "digitaldollar",

    cmcId: "19933",
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: [
      "https://res.cloudinary.com/eoi-digital/image/upload/v1634004020/Audit_Report_-_Fluid_Finance_26.08.2021.pdf",
    ],
    twitter: "https://twitter.com/fluid_fi/",
    wiki: "https://wiki.defillama.com/wiki/Fluid_Finance",
    deadFrom: "2024-04-21",
    chainConfig: {
      chains: {
        arbitrum: {
          issued: ["0xF0B5cEeFc89684889e5F7e0A7775Bd100FcD3709"],
        },
      },
    },
  },
  {
    id: "71",
    name: "Vesta Stable",
    address: "arbitrum:0x64343594ab9b56e99087bfa6f2335db24c2d1f17",
    symbol: "VST",
    url: "https://vestafinance.xyz/",
    description:
      "Vesta is a layer 2-first lending protocol where users can deposit collateral to mint VST (Vesta Stable) - a USD-pegged stablecoin.",
    mintRedeemDescription:
      "Using the Vesta Finance app, users mint VST by depositing an accepted collateral asset into a vault. When the loan is repaid to retrieve the collateral, the paid back VST is burned.",
    onCoinGecko: "false",
    gecko_id: null,
    module: "vesta-stable",

    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/vestafinance",
    wiki: "https://wiki.defillama.com/wiki/Vesta_Finance",
    chainConfig: {
      chains: {
        arbitrum: {
          issued: ["0x64343594ab9b56e99087bfa6f2335db24c2d1f17"],
        },
      },
    },
  },
  {
    id: "72",
    name: "Kolibri USD",
    address: "tezos:KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV",
    symbol: "KUSD",
    url: "https://kolibri.finance/",
    description:
      "Kolibri is an Tezos based stablecoin built on Collateralized Debt Positions (CDPs).",
    mintRedeemDescription:
      "Using the Kolibri app, users mint KUSD by depositing an accepted collateral asset into an oven. When the loan is repaid to retrieve the collateral, the paid back KUSD is burned.",
    onCoinGecko: "true",
    gecko_id: "kolibri-usd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://kolibri.finance/docs/security-report.pdf"],
    twitter: "https://twitter.com/HoverEng",
    wiki: "https://wiki.defillama.com/wiki/Kolibri",
    chainConfig: {
      chains: {
        tezos: {
          issued: ["KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV"],
        },
      },
    },
  },
  {
    id: "73",
    name: "USDtez",
    address: "tezos:KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9",
    symbol: "USDTZ",
    url: "https://usdtz.com/",
    description:
      "USD Tez (USDtz) is the first USD stablecoin on Tezos. USDtz is reserve-backed 1-1 by FIAT, follows regulatory compliance standards, and publishes monthly audit reports. Unlike other stablecoins, USD Tez combines Tezos-exclusive domain expertise with the scalability of a full FIAT reserve",
    mintRedeemDescription:
      "Zero fee minting and redemption of USD Tez (USDtz) is available to users who are approved through a KYC enrollment process. Accepted collateral includes select US-regulated FIAT-backed stablecoins.",
    onCoinGecko: "true",
    gecko_id: "usdtez",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/usdtz",
    wiki: "https://wiki.defillama.com/wiki/USDtez",
    chainConfig: {
      chains: {
        tezos: {
          issued: ["KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9"],
        },
      },
    },
  },
  {
    id: "74",
    name: "Moremoney USD",
    address: "avax:0x0f577433Bf59560Ef2a79c124E9Ff99fCa258948",
    symbol: "MONEY",
    url: "https://moremoney.finance/",
    description:
      "Moremoney is a lending protocol for opening (over)collateralized debt positions (CDP) using liquidity pool tokens, interest-bearing tokens (ibTKNs) and other major tokens as collateral.",
    mintRedeemDescription:
      "Using the Moremoney app, users mint MONEY by depositing an accepted collateral asset into a vault. When the loan is repaid to retrieve the collateral, the paid back MONEY is burned.",
    onCoinGecko: "true",
    gecko_id: "moremoney-usd",
    cmcId: "18758",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://github.com/MoreMoney-Finance/audits/blob/main/PeckShield-Audit-Report-Moremoney-1.0.pdf"],
    twitter: "https://twitter.com/Moremoneyfi",
    wiki: "https://wiki.defillama.com/wiki/Moremoney_Finance",
    chainConfig: {
      chains: {
        avax: {
          issued: ["0x0f577433Bf59560Ef2a79c124E9Ff99fCa258948"],
        },
      },
    },
  },
  {
    id: "75",
    name: "Youves uUSD",
    address: "tezos:KT1XRPEPXbZK25r3Htzp2o1x7xdMMmfocKNW",
    symbol: "UUSD",
    url: "https://youves.com/",
    description:
      "uUSD is stablecoin pegged to USD on Tezos. It is fungible by design and backed by tez collateral.",
    mintRedeemDescription:
      "Using the youves app, users mint uUSD by depositing an accepted collateral asset into a vault. When the loan is repaid to retrieve the collateral, the paid back uUSD is burned.",
    onCoinGecko: "true",
    gecko_id: "youves-uusd",
    cmcId: "15041",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://github.com/youves-com/youves-smart-contract/blob/main/audits/09212021-LeastAuthority-TezosFoundationSyntheticAssetPlatformSmartContractsFinalAuditReport.pdf"],
    twitter: "https://twitter.com/youves_com",
    wiki: "https://wiki.defillama.com/wiki/Youves",
    chainConfig: {
      chains: {
        tezos: {
          issued: ["KT1XRPEPXbZK25r3Htzp2o1x7xdMMmfocKNW"],
        },
      },
    },
  },
  {
    id: "76",
    name: "Interest Protocol",
    address: "0x2a54ba2964c8cd459dc568853f79813a60761b58",
    symbol: "USDI",
    url: "https://interestprotocol.io/",
    description:
      "Interest Protocol (IP) is a fractional reserve banking protocol on the Ethereum blockchain that pays interest to all depositors. Interest Protocol issues a stablecoin, named USDi, that is both over-collateralized and highly scalable.",
    mintRedeemDescription:
      "Using the Interest Protocol app, users mint USDi by depositing an accepted collateral asset into a vault or swapping for USDC. When the loan is repaid to retrieve the collateral, the paid back USDi is burned.",
    onCoinGecko: "false",
    gecko_id: null,
    module: "interest-protocol",

    cmcId: "20598",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/InterestDeFi",
    wiki: "https://wiki.defillama.com/wiki/Interest_Protocol",
    deadUrl: true,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x2A54bA2964C8Cd459Dc568853F79813a60761B58"],
        },
      },
    },
  },
  /**
   * Due to the upcoming entry into force of MiCA and in accordance with its commitment to compliance, LUGH announces the cessation of the issuance of its stablecoin EURL and guarantees the redemption of existing EURLs until August 30, 2024.
   */
  // {
  //   id: "77",
  //   name: "LUGH",
  //   address: "tezos:KT1JBNFcB5tiycHNdYGYCtR3kk6JaJysUCi8",
  //   symbol: "EURL",
  //   url: "https://www.lugh.io/",
  //   description:
  //     "LUGH (EURL) is a euro-pegged stablecoin on Tezos and Ethereum.",
  //   mintRedeemDescription:
  //     "Corporates who have undergone a verification process can exchange EUR for EURL and redeem EURL for EUR.",
  //   onCoinGecko: "false",
  //   gecko_id: "lugh",
  //  module: "lugh",
  //   module: "lugh",
  //   cmcId: null,
  //   pegType: "peggedEUR",
  //   pegMechanism: "fiat-backed",
  //   priceSource: null,
  //   auditLinks: ["https://www.lugh.io/"],
  //   twitter: "https://twitter.com/LughStablecoin",
  //   wiki: "https://wiki.defillama.com/wiki/LUGH",
  // },
  {
    id: "78",
    name: "Note",
    address: "canto:0x4e71a2e537b7f9d9413d3991d37958c0b5e1e503",
    symbol: "NOTE",
    url: "https://canto.io/",
    description:
      "NOTE is the unit of account on Canto. NOTE is an over-collateralized currency with a value perpetually rebalanced toward $1 through an algorithmic interest rate policy.",
    mintRedeemDescription:
      "NOTE is a fully immutable ERC-20 token backed by collateral lent to the Canto Lending Market. It can only be borrowed by users who post select collateral assets such as USDC, USDT, CANTO, ETH, ATOM, or Canto LP tokens.",
    onCoinGecko: "false",
    gecko_id: null,
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    chainConfig: {
      chains: {
        canto: {
          // cNote address; cNote and NOTE should be 1 to 1(?)
          issued: ["0xEe602429Ef7eCe0a13e4FfE8dBC16e101049504C"],
        },
      },
    },
    twitter: "https://twitter.com/CantoPublic",
    wiki: "https://wiki.defillama.com/wiki/Canto",
    deadUrl: true,
  },
  {
    id: "79",
    name: "Lista USD",
    address: "bsc:0x0782b6d8c4551b9760e74c0545a9bcd90bdc41e5",
    symbol: "LISUSD",
    url: "https://lista.org",
    description:
      "HAY is a decentralized, unbiased, collateral-backed destablecoin soft-pegged to the US Dollar.",
    mintRedeemDescription:
      "Using the Helio app, users mint HAY by depositing BNB into a vault. When the loan is repaid to retrieve the collateral, the paid back HAY is burned.",
    onCoinGecko: "true",
    gecko_id: "helio-protocol-hay",
    cmcId: "21330",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/LISTA_DAO",
    wiki: "https://wiki.defillama.com/wiki/Helio_Protocol",
    chainConfig: {
      chains: {
        bsc: {
          issued: ["0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5"],
        },
      },
    },
  },
  /*
  {
    id: "80",
    name: "USD2",
    address: null,
    symbol: "USD2",
    url: "https://usd2.lago.finance/",
    description:
      "USD2 is a fully-redeemable, decentralized stablecoin on the Kadena blockchain. It is currently 1:1 backed by collateral, in the form of USDC.",
    mintRedeemDescription:
    "Using the Lago Finance app, users swap kwUSDC to mint USD2 1:1. USD2 can be redeemed for kwUSDC 1:1 at any time.",
    onCoinGecko: "false",
    gecko_id: "usd2",
    module: "usd2",

    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed", // currently is crypto-backed for v1, but will change to FRAX mechanism for v2
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/lagofinance",
    wiki: "https://wiki.defillama.com/wiki/Lago_Finance",
    deadUrl: true,
  },
  */
  {
    id: "81",
    name: "USK",
    address: null,
    symbol: "USK",
    url: "https://kujira.network/",
    description:
      "USK is an over-collateralized Cosmos stablecoin soft-pegged to the USD and initially backed by ATOM.",
    mintRedeemDescription:
      "Using the Kujira BLUE app, users mint USK by depositing an accepted collateral asset into a vault. When the loan is repaid to retrieve the collateral, the paid back USK is burned.",
    onCoinGecko: "true",
    gecko_id: "usk",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/TeamKujira",
    wiki: "https://wiki.defillama.com/wiki/Kujira",
  },
  {
    id: "82",
    name: "arUSD",
    address: "avax:0x025AB35fF6AbccA56d57475249baaEae08419039",
    symbol: "ARUSD",
    url: "https://arable.finance/",
    description:
      "Arable offers farms for staking with synthetic LP and synthetic cryptocurrencies. arUSD is a token that is pegged to USD. You can swap arUSD for any other synths on the Arable platform.",
    mintRedeemDescription:
      "Using the Arable Finance app, users mint arUSD by depositing an accepted collateral asset into a vault. When the loan is repaid to retrieve the collateral, the paid back arUSD is burned.",
    onCoinGecko: "false",
    gecko_id: null,
    module: "arable-usd",
    deadUrl: true,
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/ArableProtocol",
    wiki: "https://wiki.defillama.com/wiki/Arable_Protocol",
    chainConfig: {
      chains: {
        avax: {
          issued: ["0x025AB35fF6AbccA56d57475249baaEae08419039"],
        },
      },
    },
  },
  {
    id: "83",
    name: "USDW",
    address: "ethpow:0x520A36eE3aa0b506288915f91Fb4BBB23d09a7D7",
    symbol: "USDW",
    url: "https://www.realprotocol.xyz/",
    description:
      "Real is a decentralized borrowing protocol on the EthereumPoW network that allows you to draw interest-free loans against Ether used as collateral. Loans are paid out in USDW (a USD pegged stablecoin) and need to maintain a minimum collateral ratio of 115%.",
    mintRedeemDescription:
      "Using the Real Protocol app, users mint USDW by depositing Ether into a vault. When the loan is repaid to retrieve the collateral, the paid back USDW is burned.",
    onCoinGecko: "false",
    gecko_id: null,
    module: "usdw",

    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: null,
    auditLinks: null,
    twitter: "https://twitter.com/realprotocoleth",
    wiki: "https://wiki.defillama.com/wiki/Real_Protocol",
    chainConfig: {
      chains: {
        ethpow: {
          issued: ["0x520A36eE3aa0b506288915f91Fb4BBB23d09a7D7"],
        },
      },
    },
  },
  {
    id: "84",
    name: "BOB",
    address: "polygon:0xb0b195aefa3650a6908f15cdac7d92f8a5791b0b",
    symbol: "BOB",
    url: "https://www.zkbob.com/",
    description:
      "BOB is a multi-chain stable token (stablecoin) enhanced with optional privacy features. Once BOB is deposited in the zkBob app, pool participants can transfer any amount of BOB amongst themselves in a private, secure manner.",
    mintRedeemDescription:
      "BOB minting is handled with a multi-sig Safe by a distributed reserve board.",
    onCoinGecko: "true",
    gecko_id: "bob",
    cmcId: "21882",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/zkBob_",
    wiki: "https://wiki.defillama.com/wiki/zkBob",
  },
  {
    id: "85",
    name: "Real USD",
    address: "polygon:0x40379a439D4F6795B6fc9aa5687dB461677A2dBa",
    symbol: "USDR",
    url: "https://www.tangible.store/realusd",
    description:
      "Real USD (USDR v3) is a natively rebasing, yield-bearing, overcollateralized stablecoin, pegged to the US dollar. Collateralizing USDR will be yield-generating, tokenized real estate that is inflation-resistant and wealth generating.",
    mintRedeemDescription:
      "Using Tangible, users can swap DAI to mint USDR 1:1. A portion of that DAI is then converted into tokenized real estate through Tangible's existing marketplace. Users receive a daily rebase. USDR can be redeemed for DAI 1:1 at any time.",
    onCoinGecko: "true",
    gecko_id: "real-usd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "algorithmic",
    priceSource: "coingecko",
    auditLinks: null,
    deadFrom: "2023-10-11",
    twitter: "https://twitter.com/tangibleDAO",
    wiki: "https://wiki.defillama.com/wiki/Tangible",
    chainConfig: {
      decimals: 9,
      chains: {
        polygon: {
          issued: ["0x40379a439D4F6795B6fc9aa5687dB461677A2dBa"],
        },
        real: {
          bridgedFromPolygon: ["0xb2d75f8Aa33608cF15940Ed47bF139F7CD15d073"],
        },
      },
    },
  },
  /*
  {
    id: "86",
    name: "Zunami USD",
    address: "0x015b94ab2b0a14a96030573fbcd0f3d3d763541f",
    symbol: "UZD",
    url: "https://www.zunami.io/",
    description:
      "UZD is a dollar-pegged stablecoin with wrapped stable assets (from Curve and Convex through Zunami Protocol) as collateral.",
    mintRedeemDescription:
      "Using the Zunami Protocol app, users can LP in a 3-pool and then deposit the LP tokens to mint UZD. UZD can be redeemed for LP tokens at any time.",
    onCoinGecko: "true",
    gecko_id: "zunami-protocol",
    module: "zunami-protocol",

    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/ZunamiProtocol",
    wiki: "https://wiki.defillama.com/wiki/Zunami_Protocol",
    deadUrl: true,
  },
  */
  {
    id: "87",
    name: "USDi",
    address: "0x83131242843257bc6C43771762ba467346Efb2CF",
    symbol: "USDI",
    url: "https://bankofchain.io/",
    description:
      "USDi is the USD-pegged stablecoin of Bank of Chain ('BoC'), a decentralized yield generation protocol.",
    mintRedeemDescription:
      "Using the Bank of Chain app, users can deposit the three major stablecoins (USDT, USDC, DAI) in any desired combination and amount to mint USDi. USDi can be redeemed for its underlying stablecoins 1:1 at any time.",
    onCoinGecko: "false",
    gecko_id: null,
    module: "bank-of-chain",

    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: null,
    auditLinks: null,
    twitter: "https://twitter.com/bankofchain_dao",
    wiki: "https://wiki.defillama.com/wiki/BankOfChain",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x83131242843257bc6C43771762ba467346Efb2CF"],
        },
      },
    },
  },
  {
    id: "88",
    name: "iUSD",
    address: null,
    symbol: "IUSD",
    url: "https://indigoprotocol.io/",
    description: "iUSD is a synthetic CDP stablecoin native to Cardano.",
    mintRedeemDescription:
      "Using the Indigo app, users can mint iUSD by depositing ADA as collateral into a CDP. When the loan is repaid to retrieve the collateral, the paid back iUSD is burned.",
    onCoinGecko: "true",
    gecko_id: "iusd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://docs.indigoprotocol.io/resources/audit"],
    twitter: "https://twitter.com/Indigo_protocol",
    wiki: "https://wiki.defillama.com/wiki/Indigo_Protocol",
    chainConfig: {
      chains: {
        cardano: {
          issued: [
            "f66d78b4a3cb3d37afa0ec36461e51ecbde00f26c8f0a68f94b6988069555344",
          ],
        },
      },
    },
  },
  {
    id: "89",
    name: "XAI",
    address: "0xd7C9F0e536dC865Ae858b0C0453Fe76D13c3bEAc",
    symbol: "XAI",
    url: "https://www.silo.finance/",
    description:
      "XAI is an over-collateralized stablecoin with a soft peg to the US Dollar in the Silo lending protocol.",
    mintRedeemDescription:
      "Using the Silo Finance app, users can borrow XAI by depositing ETH or USDC as collateral. When the loan is repaid to retrieve the collateral, the paid back XAI is burned.",
    onCoinGecko: "false",
    gecko_id: null,
    module: "xai",

    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/SiloFinance",
    wiki: "https://wiki.defillama.com/wiki/Silo_Finance",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xd7C9F0e536dC865Ae858b0C0453Fe76D13c3bEAc"],
          unreleased: ["0xc8cd77d4cd9511f2822f24ad14fe9e3c97c57836", "0xfccc27aabd0ab7a0b2ad2b7760037b1eab61616b", "0x92e7e77163ffed918421e3cb6e0a22f2fe8b37fa", "0x6543ee07Cf5Dd7Ad17AeECF22ba75860ef3bBAAa", "0x629b9e70a7d32c718318d691dda5da585e468b82", "0xd953cc57d906e1f2d7d6c8c50a369ff64096ddc5", "0xC413DD03555F3eB29D834B482d386b2999dc2EB0", "0xa104f14aeeb9b7246367d6a6e1f4e2c61a70e5d3", "0xf39f64d85ad89200e3b06c67f679c45798bf6a5b", "0xdff2aea378e41632e45306a6de26a7e0fd93ab07"],
        },
      },
    },
  },
  {
    id: "90",
    name: "Redeemable USD",
    address: null,
    symbol: "RUSD",
    url: "https://www.shareslake.com/",
    description:
      "Redeemable USD is a fiat-backed stablecoin on both the Cardano and Shareslake networks. It is a USD backed stablecoin in a 1:1 basis.",
    mintRedeemDescription:
      "Using the Shareslake Dashboard, users can deposit USD on Shareslake or ADA on Cardano to mint RUSD. RUSD can be redeemed for USD at any time.",
    onCoinGecko: "false",
    gecko_id: null,
    module: "redeemable",

    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: null,
    auditLinks: null,
    twitter: "https://twitter.com/shareslake",
    wiki: "https://wiki.defillama.com/wiki/Shareslake",
    chainConfig: {
      chains: {
        cardano: {
          issued: ["cd5b9dd91319edbb19477ad00cbef673a221e70a17ef043951fc678652656465656d61626c65"],
        },
      },
    },
  },
  {
    id: "91",
    name: "Iron Bank EURO",
    address: "0x96e61422b6a9ba0e068b6c5add4ffabc6a4aae27",
    symbol: "IBEUR",
    url: "https://www.ib.xyz",
    description:
      "ibXX (Fixed Forex assets, example; ibCHF, ibEUR, ibAUD) are erc20 tokens that are pegged to their corresponding forex pair name. They can only be borrowed via Iron Bank by supplying collateral in one of Iron Bank's accepted collateral options.",
    mintRedeemDescription:
      "Users can borrow ibEUR from the Iron Bank App (https://www.ib.xyz) or the Fixed Forex app (https://fixedforex.fi/) by supplying an accepted collateral.",
    onCoinGecko: "true",
    gecko_id: "iron-bank-euro",
    cmcId: null,
    pegType: "peggedEUR",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://github.com/trailofbits/publications/blob/master/reviews/CREAMSummary.pdf"],
    twitter: "https://twitter.com/ibdotxyz",
    wiki: "https://wiki.defillama.com/wiki/Iron_Bank",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x96E61422b6A9bA0e068B6c5ADd4fFaBC6a4aae27"],
          reserves: ["0x0D5Dc686d0a2ABBfDaFDFb4D0533E886517d4E83"],
        },
      },
    },
  },
  {
    id: "92",
    name: "Meme Dollar",
    address: "0x02814f435dd04e254be7ae69f61fca19881a780d",
    symbol: "PINA",
    url: "https://www.dontdiememe.com/pina",
    description:
      "Pina is also a stable dollar pegged to the value of $1. Using mechanisms inspired by Dynamic Set Dollar (DSD), they have optimized $Pina to better serve the needs of their marketplace.",
    mintRedeemDescription:
      "If the price of PINA is less than 1$, the supply is changed by emitting coupons to reduce the supply. You can stake PINA or LP PINA-USDC in order to get more PINA.",
    onCoinGecko: "false",
    gecko_id: null,
    module: "meme-dollar",

    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "algorithmic",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/DontDieMeme",
    wiki: "https://wiki.defillama.com/wiki/DontDieMeme",
    deadUrl: true,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x02814F435dD04e254Be7ae69F61FCa19881a780D"],
        },
      },
    },
  },
  {
    id: "93",
    name: "Djed StableCoin",
    address:
      "cardano:8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd61446a65644d6963726f555344",
    symbol: "DJED",
    url: "https://djed.xyz/",
    description:
      "Cardano's native overcollateralized stablecoin, developed by IOG and powered by COTI. DJED is backed by ADA and uses SHEN as a reserve coin",
    mintRedeemDescription:
      "Using the DJED App (https://djed.xyz/) users supply ADA as collateral to receive DJED. It uses a collateral ratio between 400% and 800% for DJED and SHEN",
    onCoinGecko: "false",
    gecko_id: "djed",
    cmcId: "21639",
    pegType: "peggedUSD",
    pegMechanism: "algorithmic",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/DjedStablecoin",
    wiki: null,
  },
  {
    id: "94",
    name: "BaoUSD",
    address: "0x7945b0a6674b175695e5d1d08ae1e6f13744abb0",
    symbol: "BAOUSD",
    url: "https://app.bao.finance",
    description:
      "BaoUSD is a CDP stablecoin, its over-collateralized and issued through our Bao Market",
    mintRedeemDescription:
      "Using the Bao Finance app, users can borrow BAOUSD by depositing ETH, USDC or bSTBL as collateral. When the loan is repaid to retrieve the collateral, the paid back BAOUSD is burned.",
    onCoinGecko: "false",
    gecko_id: null,
    module: "baousd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/BaoCommunity",
    wiki: null,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x7945b0A6674b175695e5d1D08aE1e6F13744Abb0"],
        },
      },
    },
  },
  /*{
    id: "95",
    name: "Composite",
    address: null,
    symbol: "CMST",
    url: "https://harborprotocol.one/home",
    description: "CMST is an over-collateralized stablecoin for the Cosmos.",
    mintRedeemDescription:
      "Users can deposit safelisted Interchain assets on Harbor protocol as collateral and mint new $CMST.",
    onCoinGecko: "true",
    gecko_id: "composite",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks:
      "https://github.com/oak-security/audit-reports/tree/master/Comdex",
    twitter: "https://twitter.com/Composite_Money",
    wiki: null,
    deadUrl: true,
  },*/
  {
    id: "96",
    name: "Coin98 Dollar",
    address: "bsc:0xfa4ba88cf97e282c505bea095297786c16070129",
    symbol: "CUSD",
    url: "https://coin98.com/dollar",
    description:
      "CUSD is a decentralized stablecoin that is fully collateralized by assets in reserve",
    mintRedeemDescription:
      "In order to convert to 1 CUSD, a total of $1 worth of the collateralized assets must be sent into the CUSD Reserve smart contract. Specifically, in the initial phase, the collateral ratio to convert to 1 CUSD will be $1 worth of fiat-backed stablecoins - BUSD (on BNB Chain) and USDC (on Solana and Ethereum)",
    onCoinGecko: "true",
    gecko_id: "coin98-dollar",
    cmcId: "21871",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/coin98_wallet",
    wiki: null,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xC285B7E09A4584D027E5BC36571785B515898246"],
        },
        bsc: {
          issued: ["0xFa4BA88Cf97e282c505BEa095297786c16070129"],
        },
        solana: {
          issued: ["CUSDvqAQLbt7fRofcmV2EXfPA2t36kzj7FjzdmqDiNQL"],
        },
      },
    },
  },
  {
    id: "97",
    name: "USP Stablecoin",
    address: "avax:0xdaCDe03d7Ab4D81fEDdc3a20fAA89aBAc9072CE2",
    symbol: "USP",
    url: "https://app.platypus.finance/usp",
    description:
      "An over-collateralized ERC-20 stablecoin built on the Platypus stableswap",
    mintRedeemDescription:
      "Users can deposits collateral into the Platypus Main Pool and stake their LP tokens into the MasterPlatypus to farm PTP. At the same time, it is possible for users to mint USP based on the the collateral factor",
    onCoinGecko: "false",
    gecko_id: null,
    module: "platypus-usd",

    cmcId: "20962",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/Platypusdefi",
    deprecated: true,
    deadFrom: "2023-02-16",
    wiki: null,
    chainConfig: {
      chains: {
        avax: {
          issued: ["0xdaCDe03d7Ab4D81fEDdc3a20fAA89aBAc9072CE2"],
        },
      },
    },
  },
  {
    id: "98",
    name: "EUROe Stablecoin",
    address: "0x820802Fa8a99901F52e39acD21177b0BE6EE2974",
    symbol: "EUROe",
    url: "https://www.euroe.com/",
    description:
      "EUROe is a fully fiat-backed multichain euro stablecoin. EUROe is issued by Membrane Finance Oy, an electronic money institution registered in Finland. EUROe is a MiCA-compliant stablecoin.",
    mintRedeemDescription:
      "Anyone with a EUROe Account can redeem and mint EUROe with fiat euros in a 1:1 ratio, either through a UI or using EUROe Account APIs.",
    onCoinGecko: "false",
    gecko_id: null,
    module: "euroe-stablecoin",

    cmcId: null,
    pegType: "peggedEUR",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: ["https://dev.euroe.com/docs/Stablecoin/audits"],
    twitter: "https://twitter.com/EUROemoney",
    wiki: null,
  },
  {
    id: "99",
    name: "Stabl.fi Cash",
    address: "polygon:0x80487b4f8f70e793a81a42367c225ee0b94315df",
    symbol: "CASH",
    url: "https://www.stabl.fi/swap",
    description:
      "$CASH is a stable indexcoin pegged to the weighted average of a basket of stablecoin collaterals",
    mintRedeemDescription:
      "Using the Stabl.fi app, users can borrow $CASH by depositing stablecoins as collateral. When the loan is repaid to retrieve the collateral, the paid back $CASH is burned.",
    onCoinGecko: "true",
    gecko_id: "stabl-fi",
    cmcId: "21703",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/Stabl_Fi",
    wiki: null,
    chainConfig: {
      chains: {
        polygon: {
          issued: ["0x80487b4f8f70e793a81a42367c225ee0b94315df", "0x5D066D022EDE10eFa2717eD3D79f22F949F8C175"],
        },
      },
    },
  },
  {
    id: "100",
    name: "Digital Standard Unit",
    address: "0x605d26fbd5be761089281d5cec2ce86eea667109",
    symbol: "DSU",
    url: "https://www.dsu.money/",
    description:
      "Digital Standard Unit is a wrapper for stablecoins. The protocol consumes a particular collateral, places it into a reserve and issues a stablecoin, known as DSU, against it",
    mintRedeemDescription:
      "Users are able to mint DSU by providing the specified collateral, currently this is USDC. They are also able to redeem USDC from DSU at a 1-to-1 ratio with DSU",
    onCoinGecko: "false",
    gecko_id: null,
    module: "digital-standard-unit",

    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/dsumoney",
    wiki: null,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x605D26FBd5be761089281d5cec2Ce86eeA667109"],
          unreleased: [
            "0xAEf566ca7E84d1E736f999765a804687f39D9094", // TwoWayBatcher
            "0x0B663CeaCEF01f2f88EB7451C70Aa069f19dB997", // WrapOnlyBatcher
          ],
        },
        arbitrum: {
          issued: ["0x52C64b8998eB7C80b6F526E99E29ABdcC86B841b"],
        },
        optimism: {
          issued: ["0x52C64b8998eB7C80b6F526E99E29ABdcC86B841b"],
        },
      },
    },
  },
  {
    id: "101",
    name: "Monerium EUR emoney",
    address: "0x3231cb76718cdef2155fc47b5286d82e6eda273f",
    symbol: "EURE",
    url: "https://monerium.com/tokens/",
    description:
      "Monerium EUR e-money (EURE) is a digital currency issued by Monerium, an electronic money institution licensed and regulated by the Financial Supervisory Authority of Iceland. EURE is a stablecoin that is pegged to the Euro at a 1:1 ratio",
    mintRedeemDescription:
      "To mint Monerium EUR e-money (EURE), users need to first create an account with Monerium and complete the required KYC and AML checks. Once the account is approved, users can then fund their account with Euros via bank transfer",
    onCoinGecko: "true",
    gecko_id: "monerium-eur-money",
    cmcId: "20920",
    pegType: "peggedEUR",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/monerium",
    wiki: null,
  },
  {
    id: "102",
    name: "Offshift anonUSD",
    address: "0x5a7e6c8204a1359db9aacab7ba5fc309b7981efd",
    symbol: "ANONUSD",
    url: "https://offshift.io/",
    description:
      "Offshift anon is an on-chain, non-custodial platform that preserves user privacy while maintaining yield potential. Users can burn XFT to mint on-chain synthetics called anonAssets via Shifting, which makes them anonymous. AnonAssets are standard ERC20 tokens, eliminating yield-related tradeoffs associated with privacy",
    mintRedeemDescription:
      "To mint synthetics in the Offshift Ecosystem, users select and open a PriFi Application, and connect an ERC20 wallet. If a user possesses a positive XFT balance and sufficient ETH to cover gas fees, he/she may conduct a **Shift** and enter the Offshift Ecosystem’s private (anonymous and/or confidential) side via the Burn-and-Mint Mechanism",
    onCoinGecko: "false",
    gecko_id: null,
    module: "offshift-anonusd",

    cmcId: "23729",
    pegType: "peggedUSD",
    pegMechanism: "algorithmic",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/OffshiftXFT",
    wiki: null,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x5a7E6C8204A1359DB9AAcab7bA5Fc309B7981eFd"],
        },
      },
    },
  },
  {
    id: "103",
    name: "NXUSD",
    address: "0xf14f4ce569cb3679e99d5059909e23b07bd2f387",
    symbol: "NXUSD",
    url: "https://nxusd.nereus.finance/",
    description:
      "NXUSD is an over-collateralized USD-pegged stablecoin minted by Nereus Finance",
    mintRedeemDescription:
      "Collateral tokens are deposited on Nereus Finance.A debt allocation is assigned to the borrower with ZERO INTEREST, plus an origination fee of 0.5% is charged.NXUSD tokens are deposited into the borrower's wallet.",
    onCoinGecko: "true",
    gecko_id: "nxusd",
    cmcId: "19538",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://docs.nereus.finance/nereus-protocol/security-audit"],
    twitter: "https://twitter.com/nereusfinance",
    wiki: null,
    chainConfig: {
      chains: {
        avax: {
          issued: ["0xf14f4ce569cb3679e99d5059909e23b07bd2f387"],
          unreleased: ["0x0b1f9c2211f77ec3fa2719671c5646cf6e59b775"],
        },
        polygon: {
          issued: ["0xf955a6694C6F5629f5Ecd514094B3bd450b59000"],
          unreleased: ["0x7195d3A344106b877F8D5f62CA570Fd25D43D180"],
        },
      },
    },
  },
  {
    id: "104",
    name: "Davos Protocol",
    address: "0xec38621e72d86775a89c7422746de1f52bba5320",
    symbol: "DUSD",
    url: "https://davos.xyz/",//deadUrl
    description:
      "Davos Protocol is an innovative collateralized debt position (CDP) protocol that tackles the limitations of traditional CDPs in the DeFi landscape. It achieves this by implementing an unbiased monetary policy and fair borrowing rates, ensuring user protection and fostering widespread DeFi adoption. Notably, users retain the upside of their collateral, preserving their potential returns.",
    mintRedeemDescription:
      "Using the Davos Protocol, users have the opportunity to borrow the DAVOS Stable Asset, initially using their staked MATIC assets as collateral. Users can borrow up to 66% of the value of their MATIC collateral",
    onCoinGecko: "true",
    gecko_id: "davos-protocol",
    cmcId: "23515",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: [
      "https://github.com/davos-money/new-davos-smart-contracts/tree/main/audits",
    ],
    twitter: "https://twitter.com/Davos_Protocol",
    wiki: null,
    deadUrl: true,
    chainConfig: {
      chains: {
        polygon: {
          issued: ["0xec38621e72d86775a89c7422746de1f52bba5320"],
        },
        ethereum: {
          issued: ["0xa48F322F8b3edff967629Af79E027628b9Dd1298"],
        },
        arbitrum: {
          issued: ["0x8ec1877698acf262fe8ad8a295ad94d6ea258988"],
        },
        optimism: {
          issued: ["0xb396b31599333739a97951b74652c117be86ee1d"],
        },
        bsc: {
          issued: ["0x8ec1877698acf262fe8ad8a295ad94d6ea258988"],
        },
      },
    },
  },
  {
    id: "105",
    name: "DeFi Franc",
    address: "0x045da4bfe02b320f4403674b3b7d121737727a36",
    symbol: "DCHF",
    url: "https://www.defifranc.com/",
    description:
      "The DeFi Franc (DCHF) is a decentralized stablecoin, pegged to the Swiss Franc. The DeFi Franc is over-collateralized and is created through loans which are backed by ETH and WBTC",
    mintRedeemDescription:
      "DCHF can be borrowed using ETH and BTC assets as collateral. Users can borrow up to 90% of the value of their ETH or BTC collateral and every DCHF is 100% redeemable for ETH worth 1 CHF",
    onCoinGecko: "false",
    gecko_id: null,
    module: "defi-franc",

    cmcId: "22249",
    pegType: "peggedVAR",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/monetadao",
    wiki: null,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x045da4bFe02B320f4403674B3b7d121737727A36"],
        },
      },
    },
  },
  {
    id: "106",
    name: "Electronic USD",
    address: "0xa0d69e286b938e21cbf7e51d71f6a4c8918f482f",
    symbol: "EUSD",
    url: "https://register.app/#/overview?token=0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F",
    description:
      "The eUSD RToken is a fully collateralized US-dollar stablecoin built on the Reserve Protocol",
    mintRedeemDescription:
      "Minting requires a deposit of the defined collateral tokens in equal value amounts to the RToken smart contracts",
    onCoinGecko: "true",
    gecko_id: "electronic-usd",
    cmcId: "22933",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://reserve.org/protocol/security/?search=audit#s-result"],
    twitter: "https://twitter.com/reserveprotocol",
    wiki: null,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F"],
        },
        base: {
          bridgedFromETH: ["0xCfA3Ef56d303AE4fAabA0592388F19d7C3399FB4"],
        },
        arbitrum: {
          bridgedFromETH: ["0x12275DCB9048680c4Be40942eA4D92c74C63b844"],
        },
      },
    },
  },
  {
    id: "107",
    name: "Czodiac USD",
    address: "bsc:0xE68b79e51bf826534Ff37AA9CeE71a3842ee9c70",
    symbol: "CZUSD",
    url: "https://czodiac.com/",
    description:
      "The CZUSD peg to BUSD is maintained by the innovative ScorchPeg system. The ScorchPeg holds a portion of BUSD in reserve and utilizes it to keep CZUSD at a steady $1 value through trades on Pancakeswap. During normal market conditions, the peg remains strong, however, during periods of stress, the ScorchPeg will temporarily pause, and CZUSD will be allowed to float.",
    mintRedeemDescription: "CZUSD and BUSD swapping.",
    onCoinGecko: "false",
    gecko_id: null,
    module: "czusd",

    cmcId: "19366",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/zodiacs_c",
    wiki: null,
    chainConfig: {
      chains: {
        bsc: {
          issued: ["0xE68b79e51bf826534Ff37AA9CeE71a3842ee9c70"],
        },
      },
    },
  },
  {
    id: "108",
    name: "Deuterium",
    address: "moonbeam:0xc806B0600cbAfA0B197562a9F7e3B9856866E9bF",
    symbol: "d2O",
    url: "https://dam.finance",
    description:
      "d2o is an omnichain native stablecoin with a soft-peg to the United States Dollar",
    mintRedeemDescription: "Add collateral in order to mint d2O.",
    onCoinGecko: "false",
    gecko_id: null,
    module: "dam-finance",

    cmcId: "23529",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/DAM_Finance",
    wiki: null,
    deadUrl: true,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x2FdA8c6783Aa36BeD645baD28a4cDC8769dCD252"],
        },
        moonbeam: {
          issued: ["0xc806B0600cbAfA0B197562a9F7e3B9856866E9bF"],
        },
      },
    },
  },
  {
    id: "109",
    name: "eUSD",
    address: "0x97de57ec338ab5d51557da3434828c5dbfada371",
    symbol: "EUSD",
    url: "https://lybra.finance/eusd",
    description:
      "eUSD is an interest-bearing stablecoin hard-pegged to the US dollar",
    mintRedeemDescription:
      "Users deposit ETH & stETH as collateral with an excess collateral ratio of 150% to maintain safety and decentralization",
    onCoinGecko: "true",
    gecko_id: "eusd-27a558b0-8b5b-4225-a614-63539da936f4",
    cmcId: "25013",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/LybraFinanceLSD",
    wiki: null,
    module: "eusd",
    deadUrl: true,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x97de57eC338AB5d51557DA3434828C5DbFaDA371"],
        },
      },
    },
  },
  {
    id: "110",
    name: "crvUSD",
    address: "0xf939e0a03fb07f59a73314e73794be0e57ac1b4e",
    symbol: "crvUSD",
    url: "https://curve.finance",
    description:
      "crvUSD is a collateralized-debt-position (CDP) stablecoin pegged to the US Dollar",
    mintRedeemDescription: "Users deposit collateral to borrow crvUSD",
    onCoinGecko: "true",
    gecko_id: "crvusd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: [
      "https://docs.curve.fi/security/security/#stablecoin-and-lending",
    ],
    twitter: "https://twitter.com/CurveFinance",
    wiki: null,
  },
  {
    id: "111",
    name: "DAI+",
    address: "optimism:0x970d50d09f3a656b43e11b0d45241a84e3a6e011",
    symbol: "DAI+",
    url: "https://overnight.fi/",
    description:
      "DAI+ is DAI that pays yield daily via rebase. The DAI+ stablecoin can be instantly minted and redeemed to DAI 1:1.",
    mintRedeemDescription:
      "Using the Overnight app, users swap DAI to mint DAI+ 1:1. DAI+ can be redeemed for DAI 1:1 at any time.",
    onCoinGecko: "true",
    gecko_id: "overnight-dai",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/overnight_fi",
    wiki: null,
    chainConfig: {
      chains: {
        arbitrum: {
          issued: ["0xeb8E93A0c7504Bffd8A8fFa56CD754c63aAeBFe8"],
        },
        optimism: {
          issued: ["0x970D50d09F3a656b43E11B0D45241a84e3a6e011"],
        },
        base: {
          issued: ["0x65a2508C429a6078a7BC2f7dF81aB575BD9D9275"],
        },
      },
    },
  },
  {
    id: "112",
    name: "USDT+",
    address: "bsc:0x5335e87930b410b8c5bb4d43c3360aca15ec0c8c",
    symbol: "USDT+",
    url: "https://overnight.fi/",
    description:
      "USDT+ is USDT that pays yield daily via rebase. The USDT+ stablecoin can be instantly minted and redeemed to USDT 1:1.",
    mintRedeemDescription:
      "Using the Overnight app, users swap USDT to mint USDT+ 1:1. USDT+ can be redeemed for USDT 1:1 at any time.",
    onCoinGecko: "true",
    gecko_id: "usdtplus",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/overnight_fi",
    wiki: null,
    chainConfig: {
      chains: {
        bsc: {
          issued: ["0x5335E87930b410b8C5BB4D43c3360ACa15ec0C8C"],
        },
        linea: {
          issued: ["0x1E1F509963A6D33e169D9497b11c7DbFe73B7F13"],
        },
        arbitrum: {
          issued: ["0xb1084db8D3C05CEbd5FA9335dF95EE4b8a0edc30"],
        },
      },
    },
  },
  {
    id: "113",
    name: "SILK",
    address: null,
    symbol: "SILK",
    url: "https://app.shadeprotocol.io",
    description:
      "SILK is a collateralized stablecoin with a variable peg that is derived from a basket of assets including forex, commodities, and cryptocurrencies. The basket is designed to maintain purchasing power.",
    mintRedeemDescription:
      "Using ShadeLend, users deposit collateral to borrow / mint SILK. When users repay their loan, the SILK is burned",
    onCoinGecko: "false",
    gecko_id: "silk-bcec1136-561c-4706-a42c-8b67d0d7f7d2",
    cmcId: null,
    pegType: "peggedVAR",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/Shade_Protocol",
    wiki: null,
    module: "silk",
  },
  {
    id: "114",
    name: "CLever USD",
    address: "0x3C20Ac688410bE8F391bE1fb00AFc5C212972F86",
    symbol: "clevUSD",
    url: "https://clever.aladdin.club/",
    description:
      "ClevUSD are synthetic versions of their associated real token, representing the future yield of CLever strategies. Each clevToken is backed by one or more equivalent real Tokens in the system.",
    mintRedeemDescription:
      "ClevUSD can be farmed in CLever liquidity pools or swapped for more of the original token.",
    onCoinGecko: "false",
    gecko_id: null,
    module: "clever-usd",

    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/0xc_lever",
    wiki: null,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x3c20ac688410be8f391be1fb00afc5c212972f86"],
        },
      },
    },
  },
  {
    id: "115",
    name: "R",
    address: "0x183015a9bA6fF60230fdEaDc3F43b3D788b13e21",
    symbol: "R",
    url: "https://raft.fi/",
    description:
      "R is the most capital-efficient USD stablecoin backed by high-quality collateral assets such as stETH (Lido Staked Ether) and rETH (Rocket Pool ETH) and reserve assets such as CHAI, the yield-bearing version of the DAI stablecoin.",
    mintRedeemDescription:
      "Users can deposit any accepted collateral asset of their choice to generate R, and enjoy capital-efficient borrowing.",
    onCoinGecko: "false",
    gecko_id: null,
    module: "r",

    cmcId: "24404",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: [
      "https://github.com/trailofbits/publications/blob/master/reviews/2023-04-tempus-raft-securityreview.pdf",
    ],
    deadFrom: "2023-11-10",
    twitter: "https://twitter.com/raft_fi",
    wiki: null,
    deadUrl: true,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x183015a9bA6fF60230fdEaDc3F43b3D788b13e21"],
          unreleased: ["0x2ba26baE6dF1153e29813d7f926143f9c94402f3"],
        },
        base: {
          issued: ["0xafb2820316e7bc5ef78d295ab9b8bb2257534576"],
        },
      },
    },
  },
  {
    id: "116",
    name: "GRAI",
    address: "0x15f74458aE0bFdAA1a96CA1aa779D715Cc1Eefe4",
    symbol: "GRAI",
    url: "https://www.gravitaprotocol.com/",
    description:
      "Gravita Protocol is an ETH-centric Borrowing Protocol for LSTs and Yield-Generating assets. GRAI is the debt token of the platform. Our motto is: fueling decentralization.",
    mintRedeemDescription:
      "Users deposit LSTs or BLUSD as collateral to generate the debt token GRAI.",
    onCoinGecko: "true",
    gecko_id: "grai",
    cmcId: "25337",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: [
      "https://www.gravitaprotocol.com/audits/gravita-audit-report-dedaub-apr-23-2023.pdf",
      "https://www.gravitaprotocol.com/audits/gravita-audit-report-omniscia-may-17-2023.pdf",
      "https://hatsfinance.medium.com/gravita-audit-competition-final-writeup-dfb28463a0dc",
    ],
    twitter: "https://twitter.com/gravitaprotocol",
    wiki: "https://docs.gravitaprotocol.com/",
    deadUrl: true,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x15f74458aE0bFdAA1a96CA1aa779D715Cc1Eefe4"],
        },
        optimism: {
          issued: ["0x894134a25a5faC1c2C26F1d8fBf05111a3CB9487"],
        },
        arbitrum: {
          issued: ["0x894134a25a5faC1c2C26F1d8fBf05111a3CB9487"],
        },
        era: {
          issued: ["0x5FC44E95eaa48F9eB84Be17bd3aC66B6A82Af709"],
        },
        polygon_zkevm: {
          issued: ["0xCA68ad4EE5c96871EC6C6dac2F714a8437A3Fe66"],
        },
        mantle: {
          issued: ["0x894134a25a5faC1c2C26F1d8fBf05111a3CB9487"],
        },
        linea: {
          issued: ["0x894134a25a5faC1c2C26F1d8fBf05111a3CB9487"],
        },
      },
    },
  },
  {
    id: "117",
    name: "Ethos Reserve Note",
    address: "optimism:0xc5b001dc33727f8f26880b184090d3e252470d45",
    symbol: "ERN",
    url: "https://www.ethos.finance/",
    description:
      "Ethos Reserve is a decentralized lending protocol that allows users to take out interest-free loans against collateral such as BTC and ETH.",
    mintRedeemDescription:
      "Loans drawn from Ethos Reserve require users to maintain a minimum amount of collateral in the system to cover their debt. These collateral ratios are as low as 108% for ETH, 120% for BTC, and may be lowered over time depending on usage",
    onCoinGecko: "true",
    gecko_id: "ethos-reserve-note",
    cmcId: "24370",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://twitter.com/EthosReserve",
    wiki: null,
    deadUrl: true,
    chainConfig: {
      chains: {
        optimism: {
          issued: ["0xc5b001dc33727f8f26880b184090d3e252470d45"],
        },
      },
    },
  },
  {
    id: "118",
    name: "GHO",
    address: "0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f",
    symbol: "GHO",
    url: "https://app.aave.com/",
    description:
      "GHO is a native decentralized, overcollateralized digital asset pegged to USD.",
    mintRedeemDescription:
      "It is created by users via borrowing against multiple collateral. When user repays their GHO borrow position, the protocol burns that user's GHO. All the interest payments accrued by minters of GHO would be directly transferred to the AaveDAO treasury.",
    onCoinGecko: "true",
    gecko_id: "gho",
    cmcId: "23508",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://github.com/aave/gho-core/tree/main/audits"],
    twitter: "https://twitter.com/GHOAave",
    wiki: "https://docs.gho.xyz",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f"],
        },
        monad: {
          bridgedFromETH: ["0xfc421aD3C883Bf9E7C4f42dE845C4e4405799e73"],
        },
      },
    },
  },
  {
    id: "119",
    name: "First Digital USD", // a portion of the circulating supply is seen as binance-peg BUSD by users, FDUSD is locked as collateral to mint binance-peg BUSD
    address: "0xc5f0f7b66764f6ec8c8dff7ba683102295e16409",
    symbol: "FDUSD",
    url: "https://firstdigitallabs.com",
    description:
      "Each FDUSD is intended to be fully backed by one US dollar or an asset of equivalent fair value.",
    mintRedeemDescription:
      "To redeem your FDUSD stablecoin, you must first become a client of First Digital Labs and meet specific requirements, including Anti-Money Laundering (AML) and Counter-Terrorism Financing (CTF) checks. Upon successful completion of these checks, you can exchange your FDUSD for its equivalent in fiat currency, thereby taking it out of circulation. Alternatively, you can sell your FDUSD tokens on the secondary market through a cryptocurrency exchange or an Over-the-Counter (OTC) provider that supports FD121's stablecoins. ",
    onCoinGecko: "true",
    gecko_id: "first-digital-usd",
    cmcId: "26081",
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/FDLabsHQ",
    wiki: null,
  },
  {
    id: "120",
    name: "PayPal USD",
    address: "0x6c3ea9036406852006290770BEdFcAbA0e23A0e8",
    symbol: "PYUSD",
    url: "https://www.paypal.com/pyusd",
    description:
      "PayPal USD is designed to maintain a stable $1 USD value. It's backed by dollar deposits, US treasuries, and cash equivalents",
    mintRedeemDescription:
      "As PayPal USD rolls out, users will be able to buy, sell, hold, and transfer it in the PayPal app or on their site",
    onCoinGecko: "true",
    gecko_id: "paypal-usd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/PayPal",
    wiki: null,
    bridgeConfig: {
      lzConfig: {
        symbols: ["PYUSD"],
      }
    }
  },
  {
    id: "121",
    name: "PSY",
    address: "0x63D4dc5376cfB48a885A165cd97BA208b87881c7",
    symbol: "sLSD",
    url: "https://www.psy.money/",
    description:
      "PSY protocol offers a unique borrowing experience that is both interest-free and highly capital efficient. This means that for the same loan, less collateral is required compared to other borrowing systems. Instead of selling your collateral like wstETH or rETH to have liquid funds, you can use the protocol to lock up your collaterals, borrow against the collateral to withdraw SLSD, and then repay your loan at a future date.",
    mintRedeemDescription:
      "To borrow you must open a Trove and deposit a certain amount of collateral to it. Then you can draw SLSD up to a collateral ratio of 110%. A minimum debt of 2,000 SLSD is required.",
    onCoinGecko: "false",
    gecko_id: null,
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/PSY_stablecoin",
    wiki: null,
    module: "psy",
    chainConfig: {
      chains: {
        arbitrum: {
          issued: ["0x63d4dc5376cfb48a885a165cd97ba208b87881c7"],
        },
      },
    },
  },
  {
    id: "122",
    name: "GYEN",
    address: "0xc08512927d12348f6620a698105e1baac6ecd911",
    symbol: "GYEN",
    url: "https://stablecoin.z.com",
    description: "The First Regulated Digital JPY",
    mintRedeemDescription:
      "You need to make an account (Institutional or Individual) in order to redeem GYEN for JPY",
    onCoinGecko: "true",
    gecko_id: "gyen",
    cmcId: "8771",
    pegType: "peggedJPY",
    pegMechanism: "fiat-backed",
    priceSource: "coingecko",
    auditLinks: null,
    twitter: "https://twitter.com/GMOTrust",
    wiki: null,
  },
  {
    id: "123",
    name: "STAR",
    address: "0xC19669A405067927865B40Ea045a2baabbbe57f5",
    symbol: "STAR",
    url: "https://www.preon.finance/",
    description:
      "Preon is a decentralized, lending protocol that allows you to borrow against your crypto - at 0 interest. Loans are paid out in $STAR (our USD-pegged stablecoin) with a minimum maintained collateral ratio of 110%.",
    mintRedeemDescription:
      "Users deposit wMatic, weth or wstETH as collateral to generate the debt token STAR.",
    onCoinGecko: "true",
    gecko_id: "preon-star",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://docs.preon.finance/information/security"],
    twitter: "https://twitter.com/PreonFinance",
    wiki: "https://docs.preon.finance/",
    module: "star",
    chainConfig: {
      chains: {
        arbitrum: {
          issued: ["0xC19669A405067927865B40Ea045a2baabbbe57f5"],
        },
        polygon: {
          issued: ["0xC19669A405067927865B40Ea045a2baabbbe57f5"],
        },
        base: {
          issued: ["0xC19669A405067927865B40Ea045a2baabbbe57f5"],
        },
      },
    },
  },
  {
    id: "124",
    name: "peg-eUSD",
    address: "0xd585aaafa2b58b1cd75092b51ade9fa4ce52f247",
    symbol: "peUSD",
    url: "https://lybra.finance/",
    description:
      "peUSD is an Omnichain, DeFi utility version of eUSD, integrated with the OFT standard of LayerZero.",
    mintRedeemDescription:
      "It can be converted from eUSD through the protocol or minted directly from non-rebase LSTs.",
    onCoinGecko: "true",
    gecko_id: null,
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/LybraFinanceLSD",
    wiki: "https://docs.lybra.finance/lybra-finance-docs/background/stablecoins-on-the-market",
    module: "peg-eusd",
    deadUrl: true,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xd585aaafa2b58b1cd75092b51ade9fa4ce52f247"],
        },
        arbitrum: {
          issued: ["0xdce765f021410B3266aA0053c93Cb4535F1e12e0"],
        },
      },
    },
  },
  {
    id: "125",
    name: "eUSD (V2)",
    address: "0xdf3ac4f479375802a821f7b7b46cd7eb5e4262cc",
    symbol: "eUSD(v2)",
    url: "https://lybra.finance/",
    description:
      "eUSD is an interest-bearing stablecoin hard-pegged to the US dollar",
    mintRedeemDescription:
      "Users deposit ETH & stETH as collateral with an excess collateral ratio of 150% to maintain safety and decentralization or exchanged by peg-eusd",
    onCoinGecko: "true",
    gecko_id: "eusd-new",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/LybraFinanceLSD",
    wiki: "https://docs.lybra.finance/lybra-finance-docs/background/stablecoins-on-the-market",
    module: "eusdv2",
    deadUrl: true,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xdf3ac4f479375802a821f7b7b46cd7eb5e4262cc"],
        },
      },
    },
  },
  {
    id: "126",
    name: "mkUSD",
    address: "0x4591dbff62656e7859afe5e45f6f47d3669fbb28",
    symbol: "mkUSD",
    url: "https://prismafinance.com",
    description:
      "A non-custodial and decentralized Ethereum LST-backed stablecoin",
    mintRedeemDescription:
      "Users mint mkUSD by depositing liquid staking tokens (LSTs) as collateral into a vault. When the loan is repaid to retrieve the collateral, the paid back mkUSD is burned",
    onCoinGecko: "true",
    gecko_id: "prisma-mkusd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/PrismaFi",
    wiki: "https://docs.prismafinance.com/protocol-concepts/depositing-collateral-and-minting-mkusd",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x4591dbff62656e7859afe5e45f6f47d3669fbb28"],
        },
      },
    },
  },
  {
    id: "127",
    name: "Alternity CNY",
    address: "0x7635b612792e4bfb7f2fa12a3e5d5a3f2e3c34bc",
    symbol: "LCNY",
    url: "https://alternity.finance",
    description:
      "Alternity protocol is a fork of the initial code of the Liquity Protocol. Minor amendments have been added to the protocol logic in order to make the stablecoin Yuan-pegged.",
    mintRedeemDescription:
      "Users can redeem their LCNY for ETH at any time without limitations. However, a redemption fee might be charged on the redeemed amount.",
    onCoinGecko: "false",
    gecko_id: "alternity-cny",
    module: "alternity-cny",
    cmcId: null,
    pegType: "peggedCNY",
    pegMechanism: "crypto-backed",
    priceSource: "coingecko",
    auditLinks: null,
    twitter: "https://twitter.com/0xAlternity",
    wiki: "https://docs.alternity.finance/faq/redemptions-and-lcny-price-stability",
    deadUrl: true,
    deprecated: true,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x7635b612792e4bfb7f2fa12a3e5d5a3f2e3c34bc"],
        },
      },
    },
  },
  {
    id: "128",
    name: "Nexus",
    address: "0x92211b6B68a39F4f68E722f3A3A4810A2Ebc8383",
    symbol: "NEX",
    url: "https://nexus.zdex.tech/",
    description:
      "Nexus (NEX) is a revolutionary decentralized finance (DeFi) project that introduces a unique combination of security, scalability, and stability to the Ethereum network and Layer 2 solutions.",
    mintRedeemDescription:
      "Users can trade their NEX token on a uniswap pool.(no redeem process)",
    onCoinGecko: "false",
    gecko_id: null,
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "algorithmic",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/Nexus_ZDex",
    wiki: "https://docs.zdex.tech/",
    module: "nexus",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x92211b6B68a39F4f68E722f3A3A4810A2Ebc8383"],
        },
        arbitrum: {
          issued: ["0x773fAf6B9424abFc199cc28A5320C3C2d151E3bF"],
        },
      },
    },
  },
  {
    id: "129",
    name: "Ondo US Dollar Yield",
    address: "0x96f6ef951840721adbf46ac996b59e0235cb985c",
    symbol: "USDY",
    url: "https://ondo.finance",
    description:
      "USDY is a tokenized note secured by short-term US Treasuries and bank demand deposits, bringing institutional-grade low-risk yield to the global on-chain economy.",
    mintRedeemDescription:
      "USDY is accessible to non-US individual and institutional investors and is transferable on-chain 40-50 days after purchase. Users request to mint USDY by sending us USDC. After 40 day mint restriction is lifted it will mint USDY tokens",
    onCoinGecko: "true",
    gecko_id: "ondo-us-dollar-yield",
    bridgeConfig: {
      lzConfig: {
        symbols: ["USDY"],
      }
    },
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "coingecko",
    auditLinks: null,
    twitter: "https://twitter.com/ondofinance",
    wiki: "https://docs.ondo.finance/general-access-products/usdy/faq/",
    yieldBearing: true,
  },
  {
    id: "130",
    name: "Savvy USD",
    address: "0xf202ab403cd7e90197ec0f010ee897e283037706",
    symbol: "SVUSD",
    url: "https://savvydefi.io",
    description:
      "Access non-liquidating, auto-repaying, 0% interest loans that give you an immediate advance on your future yield.",
    mintRedeemDescription:
      "svUSD are created when users deposit accepted Stablescoins like USDC, USDT, DAI, and more into Savvy protocol. Borrowing is capped at 50% of the value of the collateral deposited.",
    onCoinGecko: "false",
    gecko_id: null,
    module: "savvy-usd",

    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "coingecko",
    auditLinks: null,
    twitter: "https://twitter.com/SavvyDefi",
    wiki: "https://app.savvydefi.io/dashboard",
    chainConfig: {
      chains: {
        arbitrum: {
          issued: ["0xF202Ab403Cd7E90197ec0f010ee897E283037706"],
        },
      },
    },
  },
  {
    id: "131",
    name: "UAHT",
    address: "polygon:0x0D9447E16072b636b4a1E8f2b8C644e58F3eaA6A",
    symbol: "UAHT",
    url: "https://uaht.io",
    description: "Borderless protocol for free people.",
    mintRedeemDescription: "UAHT is pegged to UAH Ukraine Currency",
    onCoinGecko: "false",
    gecko_id: "uaht",
    module: "uaht",
    cmcId: null,
    pegType: "peggedUAH",
    pegMechanism: "fiat-backed",
    priceSource: "coingecko",
    auditLinks: null,
    twitter: "https://twitter.com/uaht_io",
    wiki: "https://github.com/starscrowding/UAHT#readme",
    chainConfig: {
      chains: {
        polygon: {
          issued: ["0x0d9447e16072b636b4a1e8f2b8c644e58f3eaa6a"],
        },
      },
    },
  },
  {
    id: "132",
    name: "USDM",
    address: "0x59d9356e565ab3a36dd77763fc0d87feaf85508c",
    symbol: "USDM",
    url: "https://mountainprotocol.com",
    description:
      "The USDM Token is an ERC20 rebasing token, with a redemption value pegged at 1:1 for primary customers. Like other fiat-backed stablecoins, we expect a 1:~1 in secondary market price, driven by arbitrage opportunities.",
    mintRedeemDescription:
      "Users can purchase USDM with USDC. Balances will be credited in the platform when funds settle (usually in seconds) and are ready to withdraw.",
    onCoinGecko: "true",
    gecko_id: "mountain-protocol-usdm",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "coingecko",
    auditLinks: null,
    twitter: "https://twitter.com/MountainUSDM",
    wiki: "https://docs.mountainprotocol.com/reference/usdm-token",
    module: "usdm",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x59d9356e565ab3a36dd77763fc0d87feaf85508c"],
        },
        polygon: {
          issued: ["0x59d9356e565ab3a36dd77763fc0d87feaf85508c"],
        },
        base: {
          issued: ["0x59d9356e565ab3a36dd77763fc0d87feaf85508c"],
        },
        optimism: {
          issued: ["0x59d9356e565ab3a36dd77763fc0d87feaf85508c"],
        },
        arbitrum: {
          issued: ["0x59d9356e565ab3a36dd77763fc0d87feaf85508c"],
        },
        era: {
          issued: ["0x7715c206A14Ac93Cb1A6c0316A6E5f8aD7c9Dc31"],
        },
      },
    },
  },
  {
    id: "133",
    name: "NARS",
    address: "0x65517425ac3ce259a34400bb67ceb39ff3ddc0bd",
    symbol: "NARS",
    url: "https://num.finance/stablecoins",
    description:
      "Seamlessly scale your financial operations globally.On Ramps, Loans and Yields.",
    mintRedeemDescription:
      "Num-S are collateralized stablecoins, minted and issued by Num Finance.",
    onCoinGecko: "true",
    gecko_id: "num-ars",
    cmcId: null,
    pegType: "peggedARS",
    pegMechanism: "fiat-backed",
    priceSource: "coingecko",
    auditLinks: null,
    twitter: "https://twitter.com/Num_Finance",
    wiki: "https://num.finance/transparency",
    module: "nars",
    chainConfig: {
      chains: {
        polygon: {
          issued: ["0x65517425ac3ce259a34400bb67ceb39ff3ddc0bd"],
          unreleased: ["0x8388A0f91875e74Dc4705Abf2C9bBDD1bD40C585"],
        },
      },
    },
  },
  {
    id: "134",
    name: "Phase Dollar",
    address: "base:0xbe92452bb46485AF3308e6d77786bFBE3557808d",
    symbol: "CASH",
    url: "https://phase.cash",
    description:
      "Every $CASH token is backed with 1 USD or more worth of assets. Due to protocol fees, $CASH incurs a premium to its price, which is captured by the protocol for backing.",
    mintRedeemDescription:
      "Minting is done via first depositing collateral into the vaults, and then minting/borrowing the stable. Redeeming/paying back/burning the stable (action burns it under the hood) lets the user pay back their debt to the vault, unlocking their collateral",
    onCoinGecko: "true",
    gecko_id: "phase-dollar",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "coingecko",
    auditLinks: [
      "https://omniscia.io/reports/0xphase-core-protocol-643d1d1f88c1770014f3a77b",
      "https://omniscia.io/reports/0xphase-balancer-implementation-645cb15ec7eedb00140139f7"
    ],
    twitter: "https://twitter.com/0xPhase",
    wiki: "https://docs.phase.cash/protocol/what-is-phase",
    chainConfig: {
      chains: {
        base: {
          issued: ["0xbe92452bb46485AF3308e6d77786bFBE3557808d"],
        },
      },
    },
  },
  {
    id: "135",
    name: "Inter Stable Token",
    address: null,
    symbol: "IST",
    url: "https://inter.trade/",
    description:
      "IST is the over-collateralized, risk-managed stable token for the interchain.",
    mintRedeemDescription:
      "Inter Protocol's Vaults let you mint IST against the value of your IBC assets (like ATOM) to unlock liquidity. IST minters actively manage their positions to avoid liquidations if their asset value falls. Anyone can participate in bidding on liquidation auctions to profit from auctioned collateral.",
    onCoinGecko: "true",
    gecko_id: "inter-stable-token",
    cmcId: 22736,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks:
      "https://assets.ctfassets.net/xm0kp9xt5r54/1pucZFh1QsF1PgL5vhGAtS/054cd042b32f962fce8843758d6f3483/Atredis_Partners_-_Agoric_Vaults_Implementation_Assessment__-_Report_v1.0___1_.pdf",
    twitter: "https://twitter.com/inter_protocol",
    wiki: "https://docs.inter.trade/",
    chainConfig: {
      decimals: 6,
      chains: {
        agoric: {
          cosmosIssued: ["uist"],
        },
        osmosis: {
          cosmosBridgedFromAgoric: ["ibc/92BE0717F4678905E53F4E45B2DED18BC0CB97BF1F8B6A25AFEDF3D5A879B4D5"],
        },
      },
    },
  },
  /*{
    id: "136", // stablecoin cancellation announced
    name: "e-Money Eur",
    address: null,
    symbol: "EEUR",
    url: "https://e-money.com",
    description:
      "e-Money EUR stablecoin. Audited and backed by fiat EUR deposits and government bonds.",
    mintRedeemDescription:
      "Unlike most existing stablecoins which aim to maintain a static 1:1 peg with their underlying assets, the value of e-Money's currency-backed tokens continually shifts in line with the interest accrued on the reserve assets. This means that holders benefit from the interest accrued on their assets while they sit securely in your wallet.",
    onCoinGecko: "true",
    gecko_id: "e-money-eur",
    cmcId: 13877,
    pegType: "peggedEUR",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/emoney_com",
    wiki: null,
  },*/
  {
    id: "137",
    name: "Collateralized Debt Token",
    address: null,
    symbol: "CDT",
    url: "https://membrane-ui-mainnet.vercel.app/",
    description:
      "Membrane is an experimental protocol that uses collateralized debt positions to synthesize credit demand into composable debt tokens that traverse the Cosmos in the form of $CDT.",
    mintRedeemDescription:
      "The mechanism is roughly analogous to a “Line of Credit”, wherein vault owners can deposit their collateral to receive a line of credit against it. This unique functionality enables a large amount of flexibility in otherwise rigid token positions.",
    onCoinGecko: "true",
    gecko_id: "collateralized-debt-token",
    cmcId: null,
    pegType: "peggedVAR",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks:
      "https://github.com/oak-security/audit-reports/blob/master/Membrane/2023-06-15%20Audit%20Report%20-%20Membrane%20v1.0.pdf",
    twitter: "https://twitter.com/insaneinthembrn",
    wiki: "https://membrane-finance.gitbook.io/membrane-docs-1/",
  },
  {
    id: "138",
    name: "ARYZE eUSD",
    address: "0xa4335da338ec4C07C391Fc1A9bF75F306adadc08",
    symbol: "eUSD",
    url: "https://aryze.io",
    description:
      "Digital Cash by ARYZE is a stablecoin fully backed by government-issued assets such as US T-bills, cash, or European Bonds, providing a stable and secure alternative to traditional fiat currencies.",
    mintRedeemDescription:
      "Minting Digital Cash involves depositing a major currency or equivalent asset with trusted third-party brokers. Upon confirmation of the deposit, the corresponding amount of Digital Cash is minted and credited to the user’s account. Redemption involves converting Digital Cash back into the underlying assets or major currencies through these brokers.",
    onCoinGecko: "true",
    gecko_id: "aryze-eusd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "coingecko",
    auditLinks:
      "https://3838260506-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FTmzl9GX7emUArB9s00Rz%2Fuploads%2FvK1ML7oM7IwFeeR3bHaF%2FARYZE%20-%20eEUR%2C%20eGBP%2C%20eUSD%20and%20RYZE%20Code%20Audit.pdf?alt=media&token=0e1f74c0-0278-42bb-a7cd-c22ea0bf7b5d",
    twitter: "https://twitter.com/ARYZEofficial",
    wiki: "https://docs.aryze.io/en/products-and-services/aryze-digital-cash",
    yieldBearing: true,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xa4335da338ec4C07C391Fc1A9bF75F306adadc08"],
        },
        polygon: {
          issued: ["0xa4335da338ec4C07C391Fc1A9bF75F306adadc08"],
        },
        bsc: {
          issued: ["0xa4335da338ec4C07C391Fc1A9bF75F306adadc08"],
        },
      },
    },
  },
  {
    id: "139",
    name: "ARYZE eEUR",
    address: "0x735fa792e731a2e8F83F32eb539841b7B72e6d8f",
    symbol: "eEUR",
    url: "https://aryze.io",
    description:
      "Digital Cash by ARYZE is a stablecoin fully backed by government-issued assets such as US T-bills, cash, or European Bonds, providing a stable and secure alternative to traditional fiat currencies.",
    mintRedeemDescription:
      "Minting Digital Cash involves depositing a major currency or equivalent asset with trusted third-party brokers. Upon confirmation of the deposit, the corresponding amount of Digital Cash is minted and credited to the user’s account. Redemption involves converting Digital Cash back into the underlying assets or major currencies through these brokers.",
    onCoinGecko: "true",
    gecko_id: "aryze-eeur",
    cmcId: null,
    pegType: "peggedEUR",
    pegMechanism: "fiat-backed",
    priceSource: "coingecko",
    auditLinks:
      "https://3838260506-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FTmzl9GX7emUArB9s00Rz%2Fuploads%2FvK1ML7oM7IwFeeR3bHaF%2FARYZE%20-%20eEUR%2C%20eGBP%2C%20eUSD%20and%20RYZE%20Code%20Audit.pdf?alt=media&token=0e1f74c0-0278-42bb-a7cd-c22ea0bf7b5d",
    twitter: "https://twitter.com/ARYZEofficial",
    wiki: "https://docs.aryze.io/en/products-and-services/aryze-digital-cash",
    yieldBearing: true,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x735fa792e731a2e8F83F32eb539841b7B72e6d8f"],
        },
        polygon: {
          issued: ["0x735fa792e731a2e8F83F32eb539841b7B72e6d8f"],
        },
        bsc: {
          issued: ["0x735fa792e731a2e8F83F32eb539841b7B72e6d8f"],
        },
      },
    },
  },
  {
    id: "140",
    name: "ARYZE eGBP",
    address: "0xD711D7D893de57dc13Ff465763218770Bd42DB1D",
    symbol: "eGBP",
    url: "https://aryze.io",
    description:
      "Digital Cash by ARYZE is a stablecoin fully backed by government-issued assets such as US T-bills, cash, or European Bonds, providing a stable and secure alternative to traditional fiat currencies.",
    mintRedeemDescription:
      "Minting Digital Cash involves depositing a major currency or equivalent asset with trusted third-party brokers. Upon confirmation of the deposit, the corresponding amount of Digital Cash is minted and credited to the user’s account. Redemption involves converting Digital Cash back into the underlying assets or major currencies through these brokers.",
    onCoinGecko: "true",
    gecko_id: "aryze-egbp",
    cmcId: null,
    pegType: "peggedGBP",
    pegMechanism: "fiat-backed",
    priceSource: "coingecko",
    auditLinks:
      "https://3838260506-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FTmzl9GX7emUArB9s00Rz%2Fuploads%2FvK1ML7oM7IwFeeR3bHaF%2FARYZE%20-%20eEUR%2C%20eGBP%2C%20eUSD%20and%20RYZE%20Code%20Audit.pdf?alt=media&token=0e1f74c0-0278-42bb-a7cd-c22ea0bf7b5d",
    twitter: "https://twitter.com/ARYZEofficial",
    wiki: "https://docs.aryze.io/en/products-and-services/aryze-digital-cash",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xD711D7D893de57dc13Ff465763218770Bd42DB1D"],
        },
        polygon: {
          issued: ["0xD711D7D893de57dc13Ff465763218770Bd42DB1D"],
        },
        bsc: {
          issued: ["0xD711D7D893de57dc13Ff465763218770Bd42DB1D"],
        },
      },
    },
  },
  // Pending for 100% backing, will be added soon
  // {
  //   id: "141",
  //   name: "ARYZE eSGD",
  //   address: "0x58A849E1f3c7044bB317DB4611269c352c53d399",
  //   symbol: "eSGD",
  //   url: "https://aryze.io",
  //   description:"Digital Cash by ARYZE is a stablecoin fully backed by government-issued assets such as US T-bills, cash, or European Bonds, providing a stable and secure alternative to traditional fiat currencies.",
  //   mintRedeemDescription:"Minting Digital Cash involves depositing a major currency or equivalent asset with trusted third-party brokers. Upon confirmation of the deposit, the corresponding amount of Digital Cash is minted and credited to the user’s account. Redemption involves converting Digital Cash back into the underlying assets or major currencies through these brokers.",
  //   onCoinGecko: "true",
  //   gecko_id: "aryze-esgd",
  //  module: "aryze-esgd",
  //   module: "aryze-esgd",
  //   cmcId: null,
  //   pegType: "peggedSGD",
  //   pegMechanism: "government-backed",
  //   priceSource: "coingecko",
  //   auditLinks: "https://3838260506-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FTmzl9GX7emUArB9s00Rz%2Fuploads%2FvK1ML7oM7IwFeeR3bHaF%2FARYZE%20-%20eEUR%2C%20eGBP%2C%20eUSD%20and%20RYZE%20Code%20Audit.pdf?alt=media&token=0e1f74c0-0278-42bb-a7cd-c22ea0bf7b5d",
  //   twitter: "https://twitter.com/ARYZEofficial",
  //   wiki: "https://docs.aryze.io/en/products-and-services/aryze-digital-cash",
  // },
  {
    id: "142",
    name: "HYDT",
    address: "0x9810512be701801954449408966c630595d0cd51",
    symbol: "HYDT",
    url: "https://hydtprotocol.com/",
    description:
      "HYDT Protocol offers industry leading high returns on HYDT Stablecoin Staking, along with decentralization, transparency and sustainability.",
    mintRedeemDescription:
      "HYDT can be exchanged for other USD stablecoins on exchanges, but the protocol does not provide direct 1:1 redemption for users. While the protocol will automatically mint/redeem HYDT to make the HYDT price close to 1 USD, your redemption rate will depend on the HYDT/USD exchange rate at the time.",
    onCoinGecko: "true",
    gecko_id: "hydt-protocol-hydt",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "algorithmic",
    priceSource: "coingecko",
    auditLinks: ["https://www.cyberscope.io/audits/hydt"],
    twitter: "https://twitter.com/HydtProtocol",
    wiki: "https://hydtprotocol.com/#faqs",
    module: "hydt",
    deadUrl: true,
    chainConfig: {
      chains: {
        bsc: {
          issued: ["0x9810512Be701801954449408966c630595D0cD51"],
        },
      },
    },
  },
  {
    id: "143",
    name: "Verified USD",
    address: "0x0e573ce2736dd9637a0b21058352e1667925c7a8",
    symbol: "USDV",
    url: "https://usdv.money",
    description:
      "Verified USD (USDV) is a tokenized real world asset (RWA) backed stablecoin built for modern finance.",
    mintRedeemDescription:
      "USDV can be minted by approved entities called Minters through agreements with the issuing entity. Once purchased by Minters, USDV can circulate freely to anyone. There are no restrictions on who can hold or use USDV. For example, a user could swap ETH for USDV on a DEX",
    onCoinGecko: "true",
    gecko_id: "verified-usd-foundation-usdv",
    cmcId: "28443",
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "coingecko",
    auditLinks: null,
    twitter: "https://twitter.com/usdv_money",
    wiki: "https://docs.usdv.money/docs/what-is-usdv/faq",
    chainConfig: {
      decimals: 6,
      chains: {
        ethereum: {
          issued: ["0x0E573Ce2736Dd9637A0b21058352e1667925C7a8"],
        },
        bsc: {
          bridgedFromETH: ["0x323665443CEf804A3b5206103304BD4872EA4253"],
        },
        optimism: {
          bridgedFromETH: ["0x323665443CEf804A3b5206103304BD4872EA4253"],
        },
        arbitrum: {
          bridgedFromETH: ["0x323665443CEf804A3b5206103304BD4872EA4253"],
        },
        avax: {
          bridgedFromETH: ["0x323665443CEf804A3b5206103304BD4872EA4253"],
        },
        polygon: {
          bridgedFromETH: ["0x323665443CEf804A3b5206103304BD4872EA4253"],
        },
        tomochain: {
          bridgedFromETH: ["0x323665443CEf804A3b5206103304BD4872EA4253"],
        },
      },
    },
  },
  {
    id: "144",
    name: "High Yield USD",
    address: "0xacdf0dba4b9839b96221a8487e9ca660a48212be",
    symbol: "HYUSD",
    url: "https://linktr.ee/hyusd",
    description:
      "hyUSD is a secure high yield savings flatcoin with up to 6% rewards outpacing inflation in over 100 countries around the world.",
    mintRedeemDescription:
      "Minting requires a deposit of the defined collateral tokens in equal value amounts to the RToken smart contracts.",
    onCoinGecko: "false",
    gecko_id: null,
    module: "high-yield-usd",

    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "algorithmic",
    priceSource: "coingecko",
    auditLinks: null,
    twitter: "https://twitter.com/HighYieldUSD",
    wiki: "https://linktr.ee/hyusd",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xaCdf0DBA4B9839b96221a8487e9ca660a48212be"],
        },
        base: {
          issued: ["0xCc7FF230365bD730eE4B352cC2492CEdAC49383e"],
        },
      },
    },
  },
  {
    id: "145",
    name: "CAD Coin",
    address: "0xcadc0acd4b445166f12d2c07eac6e2544fbe2eef",
    symbol: "CADC",
    url: "https://paytrie.com/cadc",
    description:
      "CADC tokens are fully backed 1:1 with Canadian Dollars held in a bank account in Canada.",
    mintRedeemDescription:
      "CADC is issued by PAYTRIE AB Inc., a FINTRAC regulated Money Services Business (M19690633), and backed by fully reserved assets, and redeemable on a 1:1 basis for Canadian dollars",
    onCoinGecko: "true",
    gecko_id: "cad-coin",
    cmcId: "8690",
    pegType: "peggedCAD",
    pegMechanism: "fiat-backed",
    priceSource: "coingecko",
    auditLinks: null,
    twitter: "https://twitter.com/PayTrie",
    wiki: "https://faq.paytrie.com/help/what-is-the-cadc-address",
    module: "cadc",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xcaDC0acd4B445166f12d2C07EAc6E2544FbE2Eef"],
        },
        polygon: {
          issued: ["0x9de41aFF9f55219D5bf4359F167d1D0c772A396D"],
        },
        arbitrum: {
          issued: ["0x2b28E826b55e399F4d4699b85f68666AC51e6f70"],
        },
        base: {
          issued: ["0x043eb4b75d0805c43d7c834902e335621983cf03"],
        },
      },
    },
  },
  {
    id: "146",
    name: "Ethena USDe",
    address: "0x4c9EDD5852cd905f086C759E8383e09bff1E68B3",
    symbol: "USDe",
    url: "https://www.ethena.fi",
    description:
      "Ethereum enabled crypto-native synthetic dollar which provides an embedded yield to users and achieves price stability through delta-neutral hedging across centralized and decentralized venues",
    mintRedeemDescription:
      "Ethena enables users to deposit either USD,  Ethereum or liquid staking tokens as collateral to create USDe. Stability is ensured through delta-neutral hedging process across centralized and decentralized exchanges.",
    onCoinGecko: "true",
    gecko_id: "ethena-usde",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "coingecko",
    auditLinks: ["https://ethena-labs.gitbook.io/ethena-labs/resources/audits#quantstamp-audit-on-v2-of-contracts"],
    twitter: "https://twitter.com/ethena_labs",
    wiki: "https://www.ethena.fi",
    bridgeConfig: {
      lzConfig: {
        symbols: ["USDe"],
      }
    }
  },
  {
    id: "147",
    name: "Anchored Coins AEUR",
    address: "0xA40640458FBc27b6EefEdeA1E9C9E17d4ceE7a21",
    symbol: "AEUR",
    url: "https://anchoredcoins.com",
    description:
      "AEUR is a Euro-backed stablecoin issued natively on the Ethereum and BNB Blockchain. Each AEUR is backed 1:1 by EUR held in the appointed reserve bank.",
    mintRedeemDescription:
      "To initiate using AEUR, you can create an account on one of the supported exchanges to purchase or trade. Alternatively, you can verify your identity to become Anchored Coins' client and deposit EUR into the designated bank account provided. To redeem or sell AEUR for EUR, you can effortlessly trade on secondary markets such as centralized/decentralized exchanges or dApps which support AEUR. For sizable redemptions, please get in touch with the team.",
    onCoinGecko: "true",
    gecko_id: "anchored-coins-eur",
    cmcId: "28596",
    pegType: "peggedEUR",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: null,
    wiki: null,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xA40640458FBc27b6EefEdeA1E9C9E17d4ceE7a21"],
        },
        bsc: {
          issued: ["0xA40640458FBc27b6EefEdeA1E9C9E17d4ceE7a21"],
        },
      },
    },
  },
  {
    id: "148",
    name: "Mynth MyUSD",
    address: "cardano:asset1y739nyfjumygfukmw0k5xckhc3lz4fl0yxl3qk",
    symbol: "MyUSD",
    url: "https://www.mynth.ai",
    description:
      "Mynth enables seamless interoperable transfers using Cardano's fully redeemable native stablecoin MyUSD.",
    mintRedeemDescription:
      "User can mint and redeem MyUSD using tether (via TRC 20), user can also redeem using MNT (mynth governance token)",
    onCoinGecko: "false",
    gecko_id: null,
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "algorithmic", //since can also be minted with MNT
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/_mynth_",
    wiki: "https://www.mynth.ai/faq",
    deprecated: true,
    chainConfig: {
      chains: {
        cardano: {
          issued: [
            "92776616f1f32c65a173392e4410a3d8c39dcf6ef768c73af164779c4d79555344",
          ],
        },
      },
    },
  },
  {
    id: "149",
    name: "Sable Coin",
    address: "bsc:0x0c6ed1e73ba73b8441868538e210ebd5dd240fa0",
    symbol: "USDS",
    url: "https://sable.finance",
    description:
      "Sable Finance offers interest-free loans and is more capital efficient than other borrowing platforms (i.e. less collateral is needed for the same loan).",
    mintRedeemDescription:
      "Redemption allows users to exchange USDS for LSD at face value. This mechanism gives USDS holders the option to redeem USDS for the underlying collateral at any time. Redemptions are always honored such that 1 USDS equals $1 worth of LSD.",
    onCoinGecko: "false",
    gecko_id: null,
    module: "sable-coin",

    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "coingecko",
    auditLinks: null,
    twitter: "https://twitter.com/SableFinance",
    wiki: "https://sable-finance.gitbook.io/docs/",
    chainConfig: {
      chains: {
        bsc: {
          issued: ["0x0c6Ed1E73BA73B8441868538E210ebD5DD240FA0"],
        },
        base: {
          issued: ["0xecf3e9B8ccb6F4A6EFD68058FD706561c1727031"],
        },
      },
    },
  },
  {
    id: "150",
    name: "USD Stable Colb",
    address: "polygon:0x72c96c73207936e94066b4c8566c6987c9a1f1de", ///
    symbol: "SCB",
    url: "https://www.colb.finance",
    description:
      "A USD-backed stablecoin, strictly pegged 1:1 to the United States Dollar and issued in full compliance with Swiss legislation. SCB is fully collateralised by cash and cash equivalents, securely held in custody with a Swiss private bank and verified by third-party attestations.",
    mintRedeemDescription:
      "When a user triggers an SCB issuance request through a USD bank transfer, our compliance team undertakes an initial verification to uphold regulatory adherence. When a whitelisted user decides to redeem SCB, he must firstly sign a transaction in his non-custodial wallet to send the SCB to the burn address. At this stage, our compliance team is informed and undertakes a client file verification. Then, Colb Trust advances to reduce the circulating supply, ultimately burning the stablecoins. Then it is the custodian bank's job to be as efficient as possible to send the USD bank transfer to the user (1 to 4 business days).",
    onCoinGecko: "false",
    gecko_id: null,
    module: "colb-usd-stablecolb",

    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "coingecko",
    auditLinks: null,
    twitter: "https://twitter.com/colb_finance",
    wiki: "https://www.colb.finance/faq",
    chainConfig: {
      chains: {
        polygon: {
          issued: ["0x72C96C73207936E94066b4C8566C6987c9a1f1dE"],
        },
      },
    },
  },
  {
    id: "151",
    name: "zkUSD Dollar",
    address: "zksync:0xfC7E56298657B002b3e656400E746b7212912757",
    symbol: "zkUSD",
    url: "https://goal3.xyz",
    description:
      "zkUSD is an algorithmic stablecoin whose value is pegged to the US Dollar. The peg is maintained by an algorithmic over-collateralization of assets. This means that the value of zkUSD is kept stable at $1 by always having more assets within the sportsbook backing it than its value, ensuring that it is a stable medium of exchange within the Goal3 sportsbook.",
    mintRedeemDescription:
      "The official mint/redemption gateway is the Goal3 Portal. 1 $zkUSD can always be redeemed through the portal into 1 USDC. Other venues of exchange for $zkUSD include SyncSwap and MEXC exchange.",
    onCoinGecko: "false",
    gecko_id: null,
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "coingecko",
    auditLinks: null,
    twitter: "https://twitter.com/Goal3_xyz",
    wiki: "https://docs.goal3.xyz/sportsbook/technical-overview/usdzkusd",
    module: "zkusd",
    chainConfig: {
      chains: {
        era: {
          issued: ["0xfc7e56298657b002b3e656400e746b7212912757"],
        },
      },
    },
  },
  {
    id: "152",
    name: "Liquid Loans USDL",
    address: "pulse:0x0deed1486bc52aa0d3e6f8849cec5add6598a162",
    symbol: "USDL",
    url: "https://www.liquidloans.io/",
    description:
      "USDL is a stablecoin with 110% collateralization, no repayment schedule, immutability, and no governance or admin keys",
    mintRedeemDescription:
      "USDL is minted when users deposit PLS (PulseChain coin) as collateral that has been locked into individual smart contracts called Vaults.",
    onCoinGecko: "true",
    gecko_id: "liquid-loans-usdl",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "coingecko",
    auditLinks: null,
    twitter: "https://twitter.com/liquidloansio",
    wiki: null,
    chainConfig: {
      chains: {
        pulse: {
          issued: ["0x0deed1486bc52aa0d3e6f8849cec5add6598a162"],
        },
      },
    },
  },
  {
    id: "153",
    name: "Binance Peg BUSD",
    address: "bsc:0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    symbol: "BUSD",
    url: "https://www.binance.com/en",
    description:
      "Binance-Peg BUSD is a stablecoin backed by FDUSD and issued by Binance",
    mintRedeemDescription:
      "Binance locks FDUSD as collateral and mints the B-Token, Binance-Peg BUSD",
    onCoinGecko: "true",
    gecko_id: "binance-peg-busd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "coingecko",
    auditLinks: null,
    twitter: "https://twitter.com/binance",
    wiki: null,
  },
  {
    id: "154",
    name: "Bucket Protocol BUCK Stablecoin",
    address:
      "sui:0xce7ff77a83ea0cb6fd39bd8748e2ec89a3f41e8efdc3f4eb123e0ca37b184db2",
    symbol: "BUCK",
    url: "https://app.bucketprotocol.io/",
    description:
      "BUCK is a USD-pegged stablecoin users can mint by depositing collateral assets into Bucket. BUCK is backed by multiple types of over-collateralized digital assets, like BTC, ETH, and SUI",
    mintRedeemDescription: `BUCK aligns with the USD via "hard" and "soft" peg mechanisms. The "hard" peg is due to the redeemable nature of BUCK for SUI and a minimum collateral ratio of 110%. The "soft" peg comes from BUCK's perceived value equalling USD, and a borrowing fee that rises as more BUCK is redeemed, reducing BUCK supply`,
    onCoinGecko: "true",
    gecko_id: "bucket-protocol-buck-stablecoin",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "coingecko",
    auditLinks: "https://github.com/Bucket-Protocol/Audit",
    twitter: "https://twitter.com/bucket_protocol",
    wiki: null,
  },
  {
    id: "155",
    name: "Glo Dollar",
    address: "0x4f604735c1cf31399c6e711d5962b2b3e0225ad3",
    symbol: "USDGLO",
    url: "https://www.glodollar.org/",
    description:
      "Glo Dollar - USDGLO, is a stablecoin 100% backed by cash and US Treasuries, redeemable 1:1 for US dollars that aims to generate basic incomes for people in extreme poverty",
    mintRedeemDescription: `USDGLO, issued by Brale Inc., and backed by cash, cash equivalents, and short-term U.S. government debt, with Brale ensuring liquidity to meet redemption obligations and managing reserve allocations`,
    onCoinGecko: "true",
    gecko_id: "glo-dollar",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "coingecko",
    auditLinks: "https://www.glodollar.org/articles/smart-contract-audits",
    twitter: "https://twitter.com/glodollar",
    wiki: null,
    chainConfig: {
      chains: {
        ethereum: { issued: ["0x4F604735c1cF31399C6E711D5962b2B3E0225AD3"] },
        polygon: { issued: ["0x4F604735c1cF31399C6E711D5962b2B3E0225AD3"] },
        optimism: { issued: ["0x4F604735c1cF31399C6E711D5962b2B3E0225AD3"] },
        celo: { issued: ["0x4F604735c1cF31399C6E711D5962b2B3E0225AD3"] },
        arbitrum: { issued: ["0x4F604735c1cF31399C6E711D5962b2B3E0225AD3"] },
        base: { issued: ["0x4F604735c1cF31399C6E711D5962b2B3E0225AD3"] },
        vechain: { issued: ["0x29c630cce4ddb23900f5fe66ab55e488c15b9f5e"] },
        stellar: {
          issued: ["USDGLO:GBBS25EGYQPGEZCGCFBKG4OAGFXU6DSOQBGTHELLJT3HZXZJ34HWS6XV"],
        },
      },
    },
  },
  /*
  {
    id: "156",
    name: "VNX Gold",
    address: "0x6d57B2E05F26C26b549231c866bdd39779e4a488",
    symbol: "VNXAU",
    url: "https://vnx.li/",
    description:
      "VNX Gold (VNXAU) is a multichain token backed by physical gold that is certified by the London Bullion Market Association (LBMA), from a token generator licensed under the Blockchain act in Liechtenstein.",
    mintRedeemDescription:
      "VNX Gold (VNXAU) is a multichain commodity token that represents ownership of physical gold purchased and stored for the benefit of the VNX Gold holder in a highly secured professional vault in the Principality of Liechtenstein. 1 VNX Gold token = 1 gram of gold.",
    onCoinGecko: "true",
    gecko_id: "vnx-gold",
    cmcId: "22492",
    pegType: "peggedXAU", //xau = gold
    pegMechanism: "fiat-backed",
    priceSource: "coingecko",
    auditLinks: "https://vnx.li/transparency/",
    twitter: "https://twitter.com/vnx_platform",
    wiki: null,
  },
  */
  {
    id: "157",
    name: "VNX Swiss Franc",
    address: "0x79d4f0232A66c4c91b89c76362016A1707CFBF4f",
    symbol: "VCHF",
    url: "https://vnx.io/swiss-franc ",
    description:
      "VNX Swiss Franc (VCHF) is a fully regulated stablecoin referencing the Swiss franc. The token is issued by VNX Global Ltd., which is licensed to conduct digital asset business activities under a Class M digital assets business licence issued by the Bermuda Monetary Authority. Each VCHF token is designed to be fully backed 1:1 by Swiss francs and redeemable against the underlying Swiss franc reserve",
    mintRedeemDescription:
      "VNX stablecoins (VCHF, VGBP) are minted upon confirmation of fiat funding of the segregated fiduciary account, and redeemed at par at any time per customer instruction. The flow supports two execution paths on the mint side (new issuance against new reserve, or proprietary-trade fill from VNX's liquidity pool) and two paths on the redeem side (direct cancellation against reserves, or buyback into the liquidity pool). An optional crypto-conversion leg is available on either side via VNX's external regulated provider. This page is the institutional-track summary; see Developer Track for sequence-level integration.",
    onCoinGecko: "true",
    gecko_id: "vnx-swiss-franc",
    cmcId: "24130",
    pegType: "peggedCHF",
    pegMechanism: "fiat-backed",
    priceSource: "coingecko",
    auditLinks: "https://vnx.li/transparency/",
    twitter: "https://twitter.com/VNX_Global",
    wiki: "https://vnx.gitbook.io/vnx-global",
    chainConfig: {
      chains: {
        ethereum: { issued: ["0x79d4f0232A66c4c91b89c76362016A1707CFBF4f"] },
        polygon: { issued: ["0xCdB3867935247049e87c38eA270edD305D84c9AE"] },
        avax: { issued: ["0x228a48df6819ccc2eca01e2192ebafffdad56c19"] },
        solana: { issued: ["AhhdRu5YZdjVkKR3wbnUDaymVQL2ucjMQ63sZ3LFHsch"] },
        q: { issued: ["0x65b9d36281e97418793f3430793f88440dab68d7"] },
        tezos: { issued: ["KT1LssxZqfQtRFv1CRkzX9E9gzap9iFrtWmq"] },
        stellar: {
          issued: ["VCHF:GDXLSLCOPPHTWOQXLLKSVN4VN3G67WD2ENU7UMVAROEYVJLSPSEWXIZN"],
        },
        base: { issued: ["0x1fcA74D9ef54a6AC80ffE7D3b14e76c4330Fd5D8"] },
        celo: { issued: ["0xc5ebea9984c485ec5d58ca5a2d376620d93af871"] },
        arbitrum: { issued: ["0x02cea97794D2cFB5f560e1fF4e9C59D1BEC75969"] },
        fraxtal: { issued: ["0x418126BB59457aFDbA1eCF376f97400B4157425D"] },
        // icp (ly36x-wiaaa-aaaai-aqj7q-cai) was declared but never exported by
        // the old adapter and isn't supported by addChainExports; left out.
      },
    },
  },
  {
    id: "158",
    name: "VNX EURO",
    address: "stellar:GDXLSLCOPPHTWOQXLLKSVN4VN3G67WD2ENU7UMVAROEYVJLSPSEWXIZN",
    symbol: "VEUR",
    url: "https://vnx.li/",
    description:
      "VNX Euro (VEUR) is a token referencing Euro from a token generator licensed under the Blockchain act in Liechtenstein.",
    mintRedeemDescription:
      "VNX Euro (VEUR) is a multichain token referencing the Euro, issued by VNX Commodities AG (registered with the FMA) and supported by assets held in reserve.",
    onCoinGecko: "true",
    gecko_id: "vnx-euro",
    cmcId: "24228",
    pegType: "peggedEUR",
    pegMechanism: "fiat-backed",
    priceSource: "coingecko",
    auditLinks: "https://vnx.li/transparency/",
    twitter: "https://twitter.com/vnx_platform",
    wiki: null,
    chainConfig: {
      chains: {
        ethereum: { issued: ["0x6ba75d640bebfe5da1197bb5a2aff3327789b5d3"] },
        polygon: { issued: ["0xE4095d9372E68d108225c306A4491cacfB33B097"] },
        avax: { issued: ["0x7678e162f38ec9ef2bfd1d0aaf9fd93355e5fa0b"] },
        solana: { issued: ["C4Kkr9NZU3VbyedcgutU6LKmi6MKz81sx6gRmk5pX519"] },
        q: { issued: ["0x513f99dee650f529d7c65bb5679f092b64003520"] },
        tezos: { issued: ["KT1FenS7BCUjn1otfFyfrfxguiGnL4UTF3aG"] },
        stellar: {
          issued: ["VEUR:GDXLSLCOPPHTWOQXLLKSVN4VN3G67WD2ENU7UMVAROEYVJLSPSEWXIZN"],
        },
        base: { issued: ["0x4ed9Df25d38795a47f52614126e47f564D37F347"] },
        celo: { issued: ["0x9346f43c1588b6df1d52bdd6bf846064f92d9cba"] },
        fraxtal: { issued: ["0x4c0bd74da8237c08840984fdb33a84b4586aaee6"] },
        arbitrum: { issued: ["0x4883C8f0529F37e40eBeA870F3C13cDfAD5d01f8"] },
      },
    },
  },
  {
    id: "159",
    name: "RIF US Dollar",
    address: "rsk:0x3a15461d8ae0f0fb5fa2629e9da7d66a794a6e37",
    symbol: "USDRIF",
    url: "https://rifonchain.com/",
    description:
      "RIF US Dollar is a fully crypto collateralized stablecoin. 1:1 pegged to US Dollar guaranteed by the smart contract that creates it. USDRIF is built on Rootstock, the first and longest running Bitcoin sidechain.",
    mintRedeemDescription:
      "The USDRIF stablecoins are minted through the RIF On Chain Protocol whenever there is a certain amount of RIFpro (RIFP) staked in the platform by other users who act as liquidity providers. Users can use the decentralised RIF on Chain dApp to exchange RIF tokens for USDRIF stablecoins and vice versa at any point providing there is a liquidity available in the protocol.",
    onCoinGecko: "true",
    gecko_id: "rif-us-dollar",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://github.com/money-on-chain/Audits"],
    twitter: "https://twitter.com/rifonchain",
    wiki: null,
    module: "usd-rif",
    chainConfig: {
      chains: {
        rsk: {
          issued: ["0x3a15461d8ae0f0fb5fa2629e9da7d66a794a6e37"],
        },
      },
    },
  },
  {
    id: "160",
    name: "Sovryn Dollar",
    address: "rsk:0xc1411567d2670e24d9c4daaa7cda95686e1250aa",
    symbol: "DLLR",
    url: "https://sovryn.com/sovryn-dollar",
    description:
      "The Sovryn Dollar (DLLR) is an aggregation of purely BTC-backed “constituent” stablecoins into a single stablecoin",
    mintRedeemDescription:
      "The Sovryn Dollar (DLLR) is minted through Mynt, a smart contract system, by aggregating various BTC-backed stablecoins into a single, more resilient stablecoin",
    onCoinGecko: false,
    gecko_id: "sovryn-dollar",
    cmcId: "27363",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/SovrynBTC",
    wiki: null,
    chainConfig: {
      chains: {
        rsk: {
          issued: ["0xc1411567d2670e24d9c4daaa7cda95686e1250aa"],
        },
      },
    },
  },
  {
    id: "161",
    name: "Quantoz EURD",
    address: "algorand:1221682136",
    symbol: "EURD",
    url: "https://quantozpay.com/",
    description:
      "EURD is a regulated, programmable E-Money Token, fully backed by euro managed by the Quantoz Foundation under supervision by the Dutch Central Bank. Quantoz Payments handles the KYC and AML procedures, limiting the regulatory burden for merchants and service providers",
    mintRedeemDescription:
      "All funded EURD can be redeemed 1:1 to the whitelisted bank account of the EURD users",
    onCoinGecko: false,
    gecko_id: "quantoz-eurd",
    cmcId: null,
    pegType: "peggedEUR",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/Quantoz",
    wiki: null,
    chainConfig: {
      decimals: 2,
      chains: {
        algorand: {
          issued: ["1221682136"],
          unreleased: ["R2LPJRKONXXURMO6F65VHGCXPKAZM4GGDC5KH5VZ2W3ZFIZYQRAQT7GLM4"],
        },
      },
    },
  },
  {
    id: "162",
    name: "XUSD",
    address: "rsk:0xb5999795BE0eBb5BAb23144Aa5fD6a02d080299f",
    symbol: "XUSD",
    url: "https://babelfish.money/",
    description:
      "XUSD is a USD-pegged stablecoin aggregator of the Babelfish protocol",
    mintRedeemDescription:
      "Its purpose is to act as a trustless stablecoin translation device - meaning it facilitates the conversion of multiple USD-pegged stablecoins with each other at a fixed 1:1 ratio.",
    onCoinGecko: false,
    gecko_id: "xusd-babelfish",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/babelfishmoney",
    wiki: null,
    chainConfig: {
      chains: {
        rsk: {
          issued: ["0xb5999795be0ebb5bab23144aa5fd6a02d080299f"],
        },
      },
    },
  },
  {
    id: "163",
    name: "PrismaLRT Ultra",
    address: "0x35282d87011f87508D457F08252Bc5bFa52E10A0",
    symbol: "ULTRA",
    url: "https://prismafinance.com/",
    description:
      "ULTRA is a new stablecoin issued by PrismaLRT, a new borrowing protocol developed by Prisma focused on unlocking liquidity for Liquid Restaking Tokens (LRTs).",
    mintRedeemDescription:
      "As a decentralized stablecoin on the Ethereum Mainnet, $ULTRA is minted by users (borrowers). As with all borrowing on Prisma, a user must supply collateral (at a specific collateral ratio) to be able to mint $ULTRA. Correspondingly, when a user repays a debt position (or is liquidated), PrismaLRT protocol burns that user’s $ULTRA.",
    onCoinGecko: false,
    gecko_id: null,
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/PrismaFi",
    wiki: null,
    module: "prismalrt-ultra",

    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x35282d87011f87508D457F08252Bc5bFa52E10A0"],
        },
      },
    },
  },
  {
    id: "164",
    name: "USDCB",
    address: "rsk:0xaA5dc2Ea0E056Fc962F48aB25547d66d3586eE8a",
    symbol: "USDCB",
    url: "https://www.pagolinea.com/",
    description:
      "Coinback token, collateralized stablecoin on Rootstock backed by the corresponding fiat asset.",
    mintRedeemDescription:
      "When Pagolinea users deposit fiat assets, coinback tokens are minted and transferred to the users. When users withdraw fiat, the coinback tokens are burnt.",
    onCoinGecko: false,
    gecko_id: null,
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/pagolinea",
    wiki: null,
    module: "pago-linea-usdcb",

    chainConfig: {
      chains: {
        rsk: {
          issued: ["0xaa5dc2ea0e056fc962f48ab25547d66d3586ee8a"],
        },
      },
    },
  },
  {
    id: "165",
    name: "AUDD",
    address: "0x4cCe605eD955295432958d8951D0B176C10720d5",
    symbol: "AUDD",
    url: "https://www.audd.digital/",
    description:
      "AUDD is an Australian Dollar Stablecoin 1:1 backed by Australian Dollars. It is currently available on Ethereum, Stellar, XRP Ledger, and Solana",
    mintRedeemDescription:
      "AUDD is collateralised on a 1:1 basis by Australia's sovereign currency by way of cash in bank accounts or government-backed instruments such as Treasury Bills and Notes",
    onCoinGecko: true,
    gecko_id: "novatti-australian-digital-dollar",
    cmcId: null,
    pegType: "peggedAUD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/audd_digital",
    wiki: null,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x4cce605ed955295432958d8951d0b176c10720d5"],
        },
        solana: {
          issued: ["AUDDttiEpCydTm7joUMbYddm72jAWXZnCpPZtDoxqBSw"],
        },
        rbn: {
          issued: ["0x54a210e824B0F89dA988E4B5586440aB354f0e46"],
        },
        hedera: {
          issued: ["0x39ceba2b467fa987546000eb5d1373acf1f3a2e1"],
        },
        xdc: {
          issued: ["0x9fe4e6321eeb7c4bc537570f015e4734b15002b8"],
        },
        base: {
          issued: ["0x449b3317a6d1efb1bc3ba0700c9eaa4ffff4ae65"],
        },
        stellar: {
          issued: ["AUDD-GDC7X2MXTYSAKUUGAIQ7J7RPEIM7GXSAIWFYWWH4GLNFECQVJJLB2EEU"],
        },
        ripple: {
          issued: ["4155444400000000000000000000000000000000.rUN5Zxt3K1AnMRJgEWywDJT8QDMMeLH5ok"],
        },
      },
    },
  },
  {
    id: "166",
    name: "Cygnus Finance Global USD",
    address: "base:0xCa72827a3D211CfD8F6b00Ac98824872b72CAb49",
    symbol: "cgUSD",
    url: "https://www.cygnus.finance",
    description:
      "The cgUSD token, an ERC20 rebasing token, is backed by US Treasury bills. Every New York banking day, the total issuance of cgUSD aligns with the net value of its asset portfolio, encompassing on-chain stablecoins, the market value of U.S. Treasury Bills, and accrued interest.",
    mintRedeemDescription:
      "Users can mint cgUSD by using assets from multiple chains USDT, USDC. Users can use our Withdrawals Request and Claim tabs to withdraw cgUSD and receive USDC at a 1:1 ratio. Under normal circumstances, withdrawal periods can take anywhere between 5-7 days. After that, you can claim your cgUSD using the Claim tab.",
    onCoinGecko: true,
    gecko_id: "cygnus-finance-global-usd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/CygnusFi",
    wiki: "https://wiki.cygnus.finance/whitepaper",
    chainConfig: {
      chains: {
        base: {
          issued: ["0xCa72827a3D211CfD8F6b00Ac98824872b72CAb49"],
        },
      },
    },
  },
  {
    id: "167",
    name: "Fractional ETH",
    address: "0x53805A76E1f5ebbFE7115F16f9c87C2f7e633726",
    symbol: "fETH",
    url: "https://fx.aladdin.club/",
    description:
      "f(x) splits ETH into a mix of low-volatility “floating stablecoins” called fETH.",
    mintRedeemDescription: "Users can supply ETH or stETH to mint fETH.",
    onCoinGecko: "false",
    gecko_id: null,
    cmcId: null,
    pegType: "peggedVAR",
    pegMechanism: "crypto-backed",
    priceSource: "coingecko",
    auditLinks: null,
    twitter: "https://twitter.com/protocol_fx",
    wiki: null,
    module: "feth",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x53805A76E1f5ebbFE7115F16f9c87C2f7e633726"],
        },
      },
    },
  },
  {
    id: "168",
    name: "fxUSD",
    address: "0x085780639CC2cACd35E474e71f4d000e2405d8f6",
    symbol: "fxUSD",
    url: "https://fx.aladdin.club/",
    description:
      "fxUSD is unlike anything else in DeFi. It is the first truly decentralized stablecoin with the scalability to compete toe-to-toe with centralized offerings. Its combination of strong peg, built in yield and zero slippage swapping makes it extremely user friendly, while the ingenious economic design grows the available liquidity automatically as a byproduct of providing serious value to constituent LSDs.",
    mintRedeemDescription:
      "Users are able to mint and redeem with USDC,USDT,stETH,WBTC and more",
    onCoinGecko: "true",
    gecko_id: "f-x-protocol-fxusd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/protocol_fx",
    wiki: null,
    module: "fxusd",
    bridgeConfig: {
      lzConfig: {
        symbols: ["fxUSD"],
      },
    },
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x085780639CC2cACd35E474e71f4d000e2405d8f6", "0xD6B8162e2fb9F3EFf09bb8598ca0C8958E33A23D", "0xa87F04c9743Fd1933F82bdDec9692e9D97673769"],
        },
      },
    },
  },
  {
    id: "169",
    name: "GAI Stablecoin",
    address: "manta:0xcd91716ef98798A85E79048B78287B13ae6b99b2",
    symbol: "GAI",
    url: "https://www.goku.money/",//deadUrl
    description:
      "Goku Money is a decentralized borrowing protocol on Manta that allows you to draw interest-free loans against multiple collateral assets (e.g. MANTA, TIA, USDT, and etc.). Loans are paid out in GAI (a USD pegged stablecoin).",
    mintRedeemDescription:
      "Using the Goku Money app, users mint GAI by depositing an accepted collateral asset into a vault. When the loan is repaid to retrieve the collateral, the paid back GAI is burned.",
    onCoinGecko: "false",
    gecko_id: null,
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "coingecko",
    auditLinks: null,
    twitter: "https://twitter.com/goku_stable",
    wiki: null,
    module: "gai-stablecoin",
    deadUrl: true,
    chainConfig: {
      chains: {
        manta: {
          issued: ["0xcd91716ef98798A85E79048B78287B13ae6b99b2"],
        },
      },
    },
  },
  {
    id: "170",
    name: "EURO3",
    address: "polygon:0xA0e4c84693266a9d3BBef2f394B33712c76599Ab",
    symbol: "EURO3",
    url: "https://3adao.org/",
    description:
      "EURO3 is an over-collateralized, decentralized, variable supply payment coin pegged to the Euro.",
    mintRedeemDescription:
      "EURO3 is created by users minting EURO3 loans and it's removed from circulation (burnt) when users repay their loan or redeem EURO3 for the collateral assets.",
    onCoinGecko: "false",
    gecko_id: null,
    module: "euro3",

    cmcId: null,
    pegType: "peggedEUR",
    pegMechanism: "crypto-backed",
    priceSource: "coingecko",
    auditLinks: [
      "https://docs.3adao.org/3a-protocol/technical-documentation/audit-report",
      "https://www.hypernative.io/certificate/3a-dao",
      "https://www.fyeo.io/post/fyeo-3a-dao-security-assessment",
    ],
    twitter: "https://twitter.com/3aaaDAO",
    wiki: null,
    chainConfig: {
      chains: {
        polygon: {
          issued: ["0xA0e4c84693266a9d3BBef2f394B33712c76599Ab"],
        },
        linea: {
          issued: ["0x3f817b28da4940f018c6b5c0a11c555ebb1264f9"],
        },
      },
    },
  },
  {
    id: "171",
    name: "Lets Get HAI",
    address: "optimism:0x10398abc267496e49106b07dd6be13364d10dc71",
    symbol: "HAI",
    url: "https://www.letsgethai.com/",
    description:
      "HAI is a low-cost, dollar-denominated protocol on the Optimism network, featuring a collateral-backed system coin, dynamic value transfer balancing via a PID controller, and a Global Settlement mechanism for equitable collateral redemption",
    mintRedeemDescription:
      "HAI is minted from over-collateralized debt positions (CDPs). Every HAI token in circulation corresponds to a greater amount of collateral locked by individual protocol users. Users can mint or burn HAI, depending on their collateral's value.",
    onCoinGecko: "true",
    gecko_id: "let-s-get-hai",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://twitter.com/letsgethai",
    wiki: null,
    chainConfig: {
      chains: {
        optimism: {
          issued: ["0x10398abc267496e49106b07dd6be13364d10dc71"],
        },
      },
    },
  },
  {
    id: "172",
    name: "USDB Blast",
    address: "blast:0x4300000000000000000000000000000000000003",
    symbol: "USDB",
    url: "https://blast.io",
    description:
      "The only Ethereum L2 with native yield for ETH and stablecoins.",
    mintRedeemDescription:
      "Users bridge USDC/USDT from ethereum and get USDB on blast",
    onCoinGecko: "true",
    gecko_id: "usdb",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://twitter.com/Blast_L2",
    wiki: null,
    chainConfig: {
      chains: {
        blast: {
          issued: ["0x4300000000000000000000000000000000000003"],
        },
      },
    },
  },
  {
    id: "173",
    name: "BlackRock USD",
    address: "0x7712c34205737192402172409a8F7ccef8aA2AEc",
    symbol: "BUIDL",
    url: "https://www.blackrock.com/",
    description:
      "The BlackRock USD Institutional Digital Liquidity Fund is represented by the blockchain-based BUIDL token, is fully backed by cash, U.S. Treasury bills, and repurchase agreements, and will provide yield paid out via blockchain rails every day to token holders, according to a press release.",
    mintRedeemDescription:
      "BUIDL seeks to offer a stable value of $1 per token and pays daily accrued dividends directly to investors' wallets as new tokens each month. The Fund invests 100% of its total assets in cash, U.S. Treasury bills, and repurchase agreements, allowing investors to earn yield while holding the token on the blockchain. Investors can transfer their tokens 24/7/365 to other pre-approved investors. Fund participants will also have flexible custody options allowing them to choose how to hold their tokens.",
    onCoinGecko: "true",
    gecko_id: "blackrock-usd-institutional-digital-liquidity-fund",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "coingecko",
    auditLinks: [],
    twitter: "https://twitter.com/BlackRock",
    wiki: null,
    module: "blackrock-usd",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x7712c34205737192402172409a8F7ccef8aA2AEc", "0x6a9DA2D710BB9B700acde7Cb81F10F1fF8C89041"],
        },
        aptos: {
          issued: ["0x50038be55be5b964cfa32cf128b5cf05f123959f286b4cc02b86cafd48945f89"],
        },
        arbitrum: {
          issued: ["0xA6525Ae43eDCd03dC08E775774dCAbd3bb925872"],
        },
        avax: {
          issued: ["0x53FC82f14F009009b440a706e31c9021E1196A2F"],
        },
        optimism: {
          issued: ["0xa1CDAb15bBA75a80dF4089CaFbA013e376957cF5"],
        },
        polygon: {
          issued: ["0x2893Ef551B6dD69F661Ac00F11D93E5Dc5Dc0e99"],
        },
        bsc: {
          issued: ["0x2d5bdc96d9c8aabbdb38c9a27398513e7e5ef84f"],
        },
        solana: {
          issued: ["GyWgeqpy5GueU2YbkE8xqUeVEokCMMCEeUrfbtMw6phr"],
        },
      },
    },
  },
  {
    id: "174",
    name: "rUSD",
    address: "0x65d72aa8da931f047169112fcf34f52dbaae7d18",
    symbol: "rUSD",
    url: "https://fx.aladdin.club/assets/rUSD",
    description:
      "rUSD is a stablecoin that uses the same mechanism as fxUSD, but with its reserve comprised of only ETH Liquid Restaking Tokens (LRT), starting with Ether.fi’s eETH.",
    mintRedeemDescription: "User can mint using LRT (starting with eETH).",
    onCoinGecko: "true",
    gecko_id: "fx-rusd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "coingecko",
    auditLinks: [],
    twitter: "https://twitter.com/0xc_lever",
    wiki: null,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x65D72AA8DA931F047169112fcf34f52DbaAE7D18", "0x9216272158F563488FfC36AFB877acA2F265C560", "0x50B4DC15b34E31671c9cA40F9eb05D7eBd6b13f9"],
        },
      },
    },
  },
  {
    id: "175",
    name: "PXDC Stablecoin",
    address: "pulse:0xeB6b7932Da20c6D7B3a899D5887d86dfB09A6408",
    symbol: "PXDC",
    url: "https://earn.powercity.io/",
    description:
      "PXDC is a stablecoin with 110% collateralization, no repayment schedule, immutability, and no governance or admin keys",
    mintRedeemDescription:
      "PXDC is minted when users deposit PLSX (PulseX token) as collateral that has been locked into individual smart contracts called Vaults.",
    onCoinGecko: "true",
    gecko_id: "powercity-pxdc",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "coingecko",
    auditLinks:
      "https://omniscia.io/reports/powercity-earn-implementation-646b3050e69c940014643ed6",
    twitter: "https://twitter.com/POWERCITYio",
    wiki: "https://docs.powercity.io/earn-protocol",
    chainConfig: {
      chains: {
        pulse: {
          issued: ["0xeB6b7932Da20c6D7B3a899D5887d86dfB09A6408"],
        },
      },
    },
  },
  {
    id: "176",
    name: "Fathom Dollar",
    address: "xdc:xdc49d3f7543335cf38Fa10889CCFF10207e22110B5",
    symbol: "FXD",
    url: "https://fathom.fi",
    description:
      "FXD is overcollateralized, decentralized, and softly pegged stablecoin",
    mintRedeemDescription:
      "Mint FXD using XDC as collateral while choosing your own terms for the minted amount, rebalancing and repayment. FXD positions can be repaid at any time unlocking your XDC.",
    onCoinGecko: "true",
    gecko_id: "fathom-dollar",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "coingecko",
    auditLinks: null,
    twitter: "https://twitter.com/Fathom_fi",
    wiki: "https://gist.github.com/BaldyAsh/3676a18b003758057f634c9af2cfe49a",
    chainConfig: {
      chains: {
        xdc: {
          issued: ["0x49d3f7543335cf38Fa10889CCFF10207e22110B5"],
        },
      },
    },
  },
  {
    id: "177",
    name: "UNO",
    address:
      "starknet:0x719b5092403233201aa822ce928bd4b551d0cdb071a724edd7dc5e5f57b7f34",
    symbol: "UNO",
    url: "https://nostra.finance/",
    description:
      "UNO is the first stablecoin native to Starknet, offering a robust solution for users seeking stability in the volatile crypto market. Pegged to the US Dollar, UNO combines the reliability of traditional fiat-backed stablecoins with Starknet’s innovation, aiming to enhance the DeFi experience for users worldwide.",
    mintRedeemDescription:
      "Customers can swap USDC in exchange for UNO and vice versa. Institutional partners who have undergone a verification process can exchange USD for UNO and redeem UNO for USD.",
    onCoinGecko: "true",
    gecko_id: "nostra-uno",
    cmcId: "22750",
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/nostrafinance",
    wiki: null,
    chainConfig: {
      chains: {
        starknet: {
          issued: [
            "0x719b5092403233201aa822ce928bd4b551d0cdb071a724edd7dc5e5f57b7f34",
          ],
          unreleased: [
            "0x07daadaa043b22429020efb9ac16bcc5f6a9b6ed3305de48e65a0ad5dcb76759",
          ],
        },
      },
    },
  },
  {
    id: "178",
    name: "Web 3 Dollar",
    address: "0x0d86883FAf4FfD7aEb116390af37746F45b6f378",
    symbol: "USD3",
    url: "https://app.reserve.org/ethereum/token/0x0d86883faf4ffd7aeb116390af37746f45b6f378/overview",
    description: "Earn the DeFi rate any time you're in stables",
    mintRedeemDescription:
      "Minting requires a deposit of the defined collateral tokens in equal value amounts to the RToken smart contracts.",
    onCoinGecko: "true",
    gecko_id: "web-3-dollar",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/USD_3",
    wiki: "https://app.reserve.org/ethereum/token/0x0d86883faf4ffd7aeb116390af37746f45b6f378/overview",
    yieldBearing: true,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x0d86883FAf4FfD7aEb116390af37746F45b6f378"],
        },
        base: {
          bridgedFromETH: ["0xEFb97aaF77993922aC4be4Da8Fbc9A2425322677"],
        },
      },
    },
  },
  {
    id: "179",
    name: "CJPY",
    address: "0x1cfa5641c01406ab8ac350ded7d735ec41298372",
    symbol: "CJPY",
    url: "https://app.yamato.fi/#/",
    description:
      "Yamato Protocol is a crypto-asset overcollateralized stable coin issuance protocol. V1 allows the issuance of CJPY (“Convertible JPY”, a Japanese Yen equivalent coin) using ETH as collateral.",
    mintRedeemDescription:
      "Users deposit ETH as collateral to generate the debt token CJPY.",
    onCoinGecko: "true",
    gecko_id: "convertible-jpy-token",
    cmcId: null,
    pegType: "peggedJPY",
    pegMechanism: "crypto-backed",
    priceSource: "coingecko",
    auditLinks: "https://docs.yamato.fi/v/en/audit",
    twitter: "https://twitter.com/YamatoProtocol",
    wiki: "https://docs.yamato.fi/v/en",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x1cfa5641c01406ab8ac350ded7d735ec41298372"],
        },
      },
    },
  },
  {
    id: "180",
    name: "Bread",
    address: "gnosis:0xa555d5344f6fb6c65da19e403cb4c1ec4a1a5ee3",
    symbol: "BREAD",
    url: "https://fund.bread.coop/",
    description:
      "A network of cooperatives projects building solidarity primitives.",
    mintRedeemDescription:
      "BREAD is linked to $DAI which is a stablecoin with equal value to USD. User deposited xdai and get bread",
    onCoinGecko: "true",
    gecko_id: "bread-3",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/breadcoop",
    wiki: null,
    module: "bread",
    chainConfig: {
      chains: {
        xdai: {
          issued: ["0xa555d5344f6fb6c65da19e403cb4c1ec4a1a5ee3"],
        },
      },
    },
  },
  {
    id: "181",
    name: "Zunami USD",
    address: "0x8C0D76C9B18779665475F3E212D9Ca1Ed6A1A0e6",
    symbol: "zunUSD",
    url: "https://www.zunami.io/",
    description:
      "zunUSD is an ERC-20 stablecoin minted using the USD Omnipool as collateral. The Omnipool functions as a Yield Aggregator, providing liquidity to multiple strategies and reinvesting profits.",
    mintRedeemDescription:
      "The Algorithmic Peg Stabilizer (APS) stands as the foundational mechanism for both minting and redeeming zunStables, as well as maintaining their peg to USD. The concept of APS draws inspiration from AMO of FRAX and bears resemblance to similar mechanisms such as Elixir from Alchemix.",
    onCoinGecko: "false",
    gecko_id: null,
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks:
      "https://github.com/ZunamiProtocol/ZunamiProtocolV2/tree/main/audit",
    twitter: "https://twitter.com/ZunamiProtocol",
    wiki: "https://wiki.defillama.com/wiki/Zunami_Protocol",
    module: "zun-usd",
    deadUrl: true,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x8C0D76C9B18779665475F3E212D9Ca1Ed6A1A0e6"],
        },
      },
    },
  },
  {
    id: "182",
    name: "Zunami ETH",
    address: "0xc2e660C62F72c2ad35AcE6DB78a616215E2F2222",
    symbol: "zunETH",
    url: "https://www.zunami.io/",
    description:
      "zunETH is an ERC-20 stablecoin minted using the ETH Omnipool as collateral. The Omnipool functions as a Yield Aggregator, providing liquidity to multiple strategies and reinvesting profits.",
    mintRedeemDescription:
      "The Algorithmic Peg Stabilizer (APS) stands as the foundational mechanism for both minting and redeeming zunStables, as well as maintaining their peg to ETH. The concept of APS draws inspiration from AMO of FRAX and bears resemblance to similar mechanisms such as Elixir from Alchemix.",
    onCoinGecko: "false",
    gecko_id: null,
    cmcId: null,
    pegType: "peggedVAR",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks:
      "https://github.com/ZunamiProtocol/ZunamiProtocolV2/tree/main/audit",
    twitter: "https://twitter.com/ZunamiProtocol",
    wiki: "https://wiki.defillama.com/wiki/Zunami_Protocol",
    module: "zun-eth",
    deadUrl: true,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xc2e660C62F72c2ad35AcE6DB78a616215E2F2222"],
        },
      },
    },
  },
  {
    id: "183",
    name: "Bitcoin USD",
    address: "bfc:0x6906ccda405926fc3f04240187dd4fad5df6d555",
    symbol: "BtcUSD",
    url: "https://www.btcfi.one/dashboard",
    description:
      "BTCFi is a way for Bitcoin holders to earn passive income while maintaining their BTC positions. By using Bitcoin as a collateral to mint BtcUSD, users can utilize Bitcoin as a way to access DeFi and the opportunities offered by it",
    mintRedeemDescription:
      "Users are able to deposited WBTC or BTCBA and mint btcusd",
    onCoinGecko: "true",
    gecko_id: "bitcoin-usd-btcfi",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: null,
    wiki: "https://docs.bifrostnetwork.com/eng.btcfi.one",
    chainConfig: {
      chains: {
        bfc: {
          issued: ["0x6906Ccda405926FC3f04240187dd4fAd5DF6d555"],
        },
        base: {
          bridgedFromBfc: ["0xe4b20925d9e9a62f1e492e15a81dc0de62804dd4"],
        },
      },
    },
  },
  {
    id: "184",
    name: "Magma Wen",
    address: "iotex:io1ds9lfdfkj665xjsdy8razw4re0m4fyf73xu5k6",
    symbol: "WEN",
    url: "https://magma.finance",
    description:
      "Magma is a new DeFi primitive that enables users to mint a stablecoin, WEN. Fully collateralized by liquid staking tokens (LSTs) and real world assets (RWAs), WEN opens DeFi doors for projects and users alike through providing a native stable asset for the ecosystem.",
    mintRedeemDescription:
      "Using Magma, users mint WEN by depositing IOTX/uniIOTX as collateral into a Vault. After the WEN loan is repaid to retrieve the collateral, the paid back WEN is burned",
    onCoinGecko: "false",
    gecko_id: null,
    module: "magma-wen",

    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks:
      "https://github.com/magma-fi/Audits/blob/main/MagmaStablecoin_final_Secure3_Audit_Report.pdf",
    twitter: "https://twitter.com/MagmaProtocol",
    wiki: "https://docs.magma.finance/",
    chainConfig: {
      chains: {
        iotex: {
          issued: ["0x6C0bf4b53696b5434A0D21C7D13Aa3cbF754913E"],
        },
      },
    },
  },
  {
    id: "185",
    name: "Gyroscope GYD",
    address: "0xe07f9d810a48ab5c3c914ba3ca53af14e4491e8a",
    symbol: "GYD",
    url: "https://gyro.finance/",
    description:
      "Gyroscope is a decentralized stablecoin featuring a novel all-weather stablecoin design combined with more efficient stablecoin liquidity pools",
    mintRedeemDescription:
      "Mint and redeem GYD through Gyroscope's Dynamic Stability Mechanism, which autonomously adjusts prices based on reserve ratios and market outflows",
    onCoinGecko: "true",
    gecko_id: "gyroscope-gyd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: "https://docs.gyro.finance/gyroscope-protocol/audit-reports",
    twitter: "https://twitter.com/gyrostable",
    wiki: "https://docs.gyro.finance/",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xe07f9d810a48ab5c3c914ba3ca53af14e4491e8a"],
        },
        polygon: {
          issued: ["0x37b8E1152fB90A867F3dccA6e8d537681B04705E"],
        },
      },
    },
  },
  {
    id: "186",
    name: "International Stable Currency",
    address: "solana:J9BcrQfX4p9D1bvLzRNCbMDv8f44a9LFdeqNE4Yk2WMD",
    symbol: "ISC",
    url: "https://www.isc.money",
    description:
      "International Stable Currency (ISC) is a yield-bearing stablecoin pegged to a basket of real world assets.",
    mintRedeemDescription:
      "ISC Issuer is tasked with two principal functions that are integral to the operation of the ISC ecosystem. Firstly, it is responsible for the minting and burning of ISC. Secondly, it manages the loans of ISC between itself and the ISC Reserves.",
    onCoinGecko: "true",
    gecko_id: "international-stable-currency",
    cmcId: null,
    pegType: "peggedVAR",
    pegMechanism: "fiat-backed", // composition is bonds, t-bilts, cash
    priceSource: "coingecko",
    auditLinks: null,
    twitter: "https://twitter.com/ISC_money",
    wiki: "https://wp.isc.money",
    chainConfig: {
      decimals: 6,
      chains: {
        solana: {
          issued: ["J9BcrQfX4p9D1bvLzRNCbMDv8f44a9LFdeqNE4Yk2WMD"],
        },
      },
    },
  },
  {
    id: "187",
    name: "KNOX Dollar",
    address: "arbitrum:0x0BBF664D46becc28593368c97236FAa0fb397595",
    symbol: "KNOX",
    url: "https://app.reserve.org/arbitrum/token/0x0bbf664d46becc28593368c97236faa0fb397595/overview",
    description:
      "A permissionless, yield-bearing stablecoin designed to be a reliable store of value",
    mintRedeemDescription:
      "Minting requires a deposit of the defined collateral tokens in equal value amounts to the RToken smart contracts.",
    onCoinGecko: "true",
    gecko_id: "knox-dollar",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/KNOX_Dollar",
    wiki: "https://app.reserve.org/arbitrum/token/0x0bbf664d46becc28593368c97236faa0fb397595/overview",
    yieldBearing: true,
    chainConfig: {
      chains: {
        arbitrum: {
          issued: ["0x0BBF664D46becc28593368c97236FAa0fb397595"],
        },
      },
    },
  },
  {
    id: "188",
    name: "Orby USC",
    address: "cronos:0xd42e078cea2be8d03cd9dfecc1f0d28915edea78",
    symbol: "USC",
    url: "https://orby.network/",
    description:
      "USC is Orby's decentralised, overcollateralized stablecoin that is soft-pegged to the US dollar",
    mintRedeemDescription:
      "$USC is an overcollateralized stablecoin minted by depositing more collateral than debt into a shuttle, where users must maintain at least $USC 100 and adhere to a minimum collateral-to-debt ratio, adjusted continuously by an oracle",
    onCoinGecko: "true",
    gecko_id: "orby-network-usc-stablecoin",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: "https://doc.orby.network/overview/security-and-audits",
    twitter: "https://twitter.com/OrbyNetwork",
    wiki: "https://doc.orby.network/introduction/what-is-usdusc",
    chainConfig: {
      chains: {
        cronos: {
          issued: ["0xD42E078ceA2bE8D03cd9dFEcC1f0d28915Edea78"],
        },
      },
    },
  },
  {
    id: "189",
    name: "btcUSD",
    address: "0x9d11ab23d33ad026c466ce3c124928fdb69ba20e",
    symbol: "btcUSD",
    url: "https://fx.aladdin.club/",
    description:
      "btcUSD is a stablecoin pegged to the USD, offering high yields and maintaining stability with a 120% collateral ratio",
    mintRedeemDescription:
      "btcUSD is minted by depositing collateral at a minimum 120% collateral ratio, providing a stablecoin with yields pegged to the USD",
    onCoinGecko: "false",
    gecko_id: null,
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/protocol_fx",
    wiki: "https://docs.aladdin.club/f-x-protocol/introduction-of-btcusd-xwbtc",
    module: "f-x-btc-usd",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x9D11ab23d33aD026C466CE3c124928fDb69Ba20E", "0x576b4779727F5998577bb4e25bf726abE742b9F7"],
        },
      },
    },
  },
  {
    id: "190",
    name: "Revenue Generating USD",
    address: "0x78da5799CF427Fee11e9996982F4150eCe7a99A7",
    symbol: "rgUSD",
    url: "https://app.reserve.org/ethereum/token/0x78da5799cf427fee11e9996982f4150ece7a99a7/overview",
    description:
      "Hold $1 USD peg, and deploy collateral to generate safe, on-chain yield to incentivize liquidity for itself and partners",
    mintRedeemDescription:
      "Minting requires a deposit of the defined collateral tokens in equal value amounts to the RToken smart contracts.",
    onCoinGecko: "false",
    gecko_id: null,
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/rgUSD_Bull",
    wiki: "https://app.reserve.org/ethereum/token/0x78da5799cf427fee11e9996982f4150ece7a99a7/overview",
    module: "revenue-generating-usd",

    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x78da5799CF427Fee11e9996982F4150eCe7a99A7"],
        },
        base: {
          bridgedFromETH: ["0x8E5E9DF4F0EA39aE5270e79bbABFCc34203A3470"],
        },
        arbitrum: {
          bridgedFromETH: ["0x96a993f06951b01430523d0d5590192d650ebf3e"],
        },
      },
    },
  },
  {
    id: "191",
    name: "bitSmiley USD",
    address: "bitlayer:0x07373d112edc4570b46996ad1187bc4ac9fb5ed0",
    symbol: "bitUSD",
    url: "https://www.bitsmiley.io",
    description: "Bitcoin stablecoin based on over-collateralization",
    mintRedeemDescription:
      "Users deposit a specific amount of BTC into bitSmiley Treasury to generate bitUSD. To redeem their deposited BTC, users need to repay the generate bitUSD and also pay a certain amount of stability fee.",
    onCoinGecko: "false",
    gecko_id: null,
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/bitsmiley_labs",
    wiki: "https://github.com/bitSmiley-protocol/whitepaper/blob/main/BitSmiley_White_Paper.pdf",
    module: "bitsmiley-bitusd",

    chainConfig: {
      chains: {
        btr: {
          issued: ["0x07373d112edc4570b46996ad1187bc4ac9fb5ed0"],
        },
      },
    },
  },
  {
    id: "192",
    name: "Angle USDA",
    address: "0x0000206329b97db379d5e1bf586bbdb969c63274",
    symbol: "USDA",
    url: "https://angle.money/usda",
    description:
      "Angle's Dollar stablecoin (USDA) is a USD stablecoin supported by a robust Price Stability Module. USDA is over-collateralized, decentralized, transparent, generates yield, and offers competitive pricing for on-chain USD to Euro exchanges",
    mintRedeemDescription:
      "Users can get USDA, by swapping their assets on the Angle app or a DEX. It is also possible to acquire USDA by borrowing it against a variety of collaterals",
    onCoinGecko: true,
    gecko_id: "angle-usd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://x.com/AngleProtocol",
    wiki: "https://docs.angle.money/transmuter/implementation/collateralsmanagement#for-eura-and-usda",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x0000206329b97DB379d5E1Bf586BbDB969C63274"],
        },
      },
    },
  },
  {
    id: "193",
    name: "Chi USC",
    address: "0x38547d918b9645f2d94336b6b61aeb08053e142c",
    symbol: "USC",
    url: "https://chiprotocol.io/dashboard/mint",
    description:
      "USC is a decentralised, scalable, fully backed stablecoin which is 1-1 USD pegged",
    mintRedeemDescription:
      "To mint USC, you are required to deposit a specific amount of ETH/LST in the reserves. Afterward, you can generate USC tokens with a collateral ratio of 100% against your deposit",
    onCoinGecko: false,
    gecko_id: null,
    module: "usc-2",

    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://x.com/ProtocolChi",
    wiki: "https://chi-protocol.gitbook.io/docs/overview/introduction-to-chi-protocol",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x38547d918b9645f2d94336b6b61aeb08053e142c"],
        },
      },
    },
  },
  /* // we added under usdc on icp network
  {
    id: "194",
    name: "ckUSDC",
    address: null,
    symbol: "ckUSDC",
    url: "https://dashboard.internetcomputer.org/ethereum/xevnm-gaaaa-aaaar-qafnq-cai",
    description: "ckUSDC is a fully backed stablecoin which is 1-1 USDC pegged",
    mintRedeemDescription:
      "The pair of smart contracts work in unison to ensure that the total value of ckUSDC is fully backed 1:1 by USDC. This can always be verified by viewing the on-chain dashboards and metrics of the canisters: ckETH Minter dashboard, ckETH Minter metrics, ckUSDC Ledger metrics.",
    onCoinGecko: true,
    gecko_id: "ckusdc",
    module: "ckusdc",
    module: "ckusdc", //fakecg
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://x.com/dfinity",
    wiki: "https://github.com/dfinity/ic/blob/master/rs/ethereum/cketh/docs/ckerc20.adoc",
  },
  */
  {
    id: "195",
    name: "Usual USD",
    address: "0x73A15FeD60Bf67631dC6cd7Bc5B6e8da8190aCF5",
    symbol: "USD0",
    url: "https://usual.money",
    description:
      "Usual enables an RWA-stablecoin that provides a high standard of security and transparency, while redistributing the generated value in the form of speculative yield in $USUAL, the Usual governance token.",
    mintRedeemDescription:
      "Usual enables users to deposit either USYC or USDC as collateral to mint USD0. USD0 is backed 1:1 by collateral exclusively in the form of very short-term RWAs (Real-World Assets).",
    onCoinGecko: false,
    gecko_id: "usual-usd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: "https://gitbook.usual.money/ressources-and-ecosystem/audits",
    twitter: "https://x.com/usualmoney",
    wiki: "https://gitbook.usual.money/",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x73A15FeD60Bf67631dC6cd7Bc5B6e8da8190aCF5"],
        },
        arbitrum: {
          issued: ["0x35f1C5cB7Fb977E669fD244C567Da99d8a3a6850"],
        },
      },
    },
  },
  {
    id: "196",
    name: "Classic USD",
    address: "ethereumclassic:0xDE093684c796204224BC081f937aa059D903c52a",
    symbol: "USC",
    url: "https://brale.xyz/stablecoins/USC",
    description:
      "Launched in 2024, Classic USD (USC) is a fiat-collateralized stablecoin issued through a partnership between Brale and EthereumClassic.com. Classic USD is the premiere native stablecoin for Ethereum Classi's decentralized finance ecosystem, global payments, and on-chain fiat settlement. As of 2022, Ethereum Classic is the largest and most secure Proof-of-Work smart contract network in the world",
    mintRedeemDescription:
      "USC, issued by Brale Inc., with Brale ensuring liquidity to meet redemption obligations and managing reserve allocations",
    onCoinGecko: true,
    gecko_id: "classic-usd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://x.com/Classic_USD",
    wiki: null,
    chainConfig: {
      chains: {
        ethereumclassic: {
          issued: ["0xDE093684c796204224BC081f937aa059D903c52a"],
        },
        polygon: {
          issued: ["0x131409b31bf446737dd04353d43dacada544b6fa"],
        },
      },
    },
  },
  {
    id: "197",
    name: "Resolv USD",
    address: "0x66a1E37c9b0eAddca17d3662D6c05F4DECf3e110",
    symbol: "USR",
    url: "https://www.resolv.im/",
    description:
      "An overcollateralized stablecoin natively backed by Ether (ETH). USR achieves its peg by hedging its collateral pool and maintaining a tokenized insurance fund called RLP. Users can stake USR to obtain the yield-bearing version called stUSR.",
    mintRedeemDescription:
      "USR is minted by depositing liquid assets, such as USDC or USDT, on 1:1 value basis. When USR is redeemed, a user receives a 1:1 equivalent to the notional amount.",
    onCoinGecko: false,
    gecko_id: "resolv-usr",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: "https://docs.resolv.im/resources/security",
    twitter: "https://twitter.com/ResolvLabs",
    wiki: "https://docs.resolv.im/",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x66a1e37c9b0eaddca17d3662d6c05f4decf3e110"],
        },
        base: {
          bridgedFromETH: ["0x35E5dB674D8e93a03d814FA0ADa70731efe8a4b9"],
        },
        bsc: {
          bridgedFromETH: ["0x2492D0006411Af6C8bbb1c8afc1B0197350a79e9"],
        },
        berachain: {
          bridgedFromETH: ["0x2492D0006411Af6C8bbb1c8afc1B0197350a79e9"],
        },
        hyperliquid: {
          bridgedFromETH: ["0x0aD339d66BF4AeD5ce31c64Bc37B3244b6394A77"],
        },
        soneium: {
          bridgedFromETH: ["0xb1b385542b6e80f77b94393ba8342c3af699f15c"],
        },
      },
    },
  },
  {
    id: "198",
    name: "Stable Jack aUSD",
    address: "avax:0xaBe7a9dFDA35230ff60D1590a929aE0644c47DC1",
    symbol: "aUSD",
    url: "https://www.stablejack.xyz",
    description:
      "Stable Jack allows users to exchange the yield, volatility, and points of the collateral asset while maintaining their principal. This will allow new DeFi primitives to be built on yield-bearing assets, lending markets, DEXs, or volatile assets.",
    mintRedeemDescription:
      "aUSD is a decentralized yield-bearing stablecoin that is fully collateralized and backed by AVAX LSTs.",
    onCoinGecko: false,
    gecko_id: null,
    module: "stable-jack-ausd",

    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://x.com/StableJack_xyz",
    wiki: "https://docs.stablejack.xyz/stablejack",
    chainConfig: {
      chains: {
        avax: {
          issued: ["0xaBe7a9dFDA35230ff60D1590a929aE0644c47DC1"],
        },
      },
    },
  },
  {
    id: "199",
    name: "Mento Real",
    address: "celo:0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787",
    symbol: "BRLm",
    url: "https://app.mento.org/",
    description:
      "BRLm is a decentralized, over-collateralized algorithmic stablecoin that tracks the value of the Brazilian real",
    mintRedeemDescription:
      "BRLm is based on Mento, the stability protocol on Celo, and supported by multiple digital assets, including BTC and ETH, in the Mento Reserve.",
    onCoinGecko: "true",
    gecko_id: "celo-real-creal",
    cmcId: "16385",
    pegType: "peggedREAL",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    twitter: "https://x.com/MentoLabs",
    wiki: "https://blog.celo.org/celo-launches-the-creal-stablecoin-11da0d560c1c",
    auditLinks: ["https://docs.mento.org/mento-v3/build/smart-contracts/audits"],
    chainConfig: {
      chains: {
        celo: {
          issued: ["0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787"],
        },
      },
    },
  },
  {
    id: "200",
    name: "Hedera Swiss Franc",
    address: "hedera:0x00000000000000000000000000000000005c9f6b",
    symbol: "HCHF",
    url: "https://hliquity.org/",
    description: "A stablecoin pegged to the Swiss Franc",
    mintRedeemDescription:
      "HLiquity offers interest-free loans. Lock up your HBAR, borrow HCHF against it, and repay later without interest",
    onCoinGecko: "true",
    gecko_id: "hedera-swiss-franc",
    cmcId: null,
    pegType: "peggedCHF",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://x.com/hliquity_",
    wiki: "https://docs.hliquity.org/overview/overview#hchf-the-stablecoin",
    deadUrl: true,
    chainConfig: {
      decimals: 8,
      chains: {
        hedera: {
          issued: ["0x00000000000000000000000000000000005c9f6b"],
        },
      },
    },
  },
  {
    id: "201",
    name: "HEX Dollar Coin",
    address: "pulse:0x1fe0319440a672526916c232eaee4808254bdb00",
    symbol: "HEXDC",
    url: "https://www.flex.powercity.io/#/",
    description:
      "Powercity Flex Protocol is a decentralized borrowing protocol that allows you to draw interest-free loans against HEX used as collateral. Loans are paid out in HEXDC (a USD pegged stablecoin)",
    mintRedeemDescription:
      "Powercity Flex Protocol offers interest-free loans. Lock up your HEX, borrow HEXDC against it, and repay later without interest",
    onCoinGecko: "true",
    gecko_id: "hex-dollar-coin",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://x.com/POWERCITYio",
    wiki: "https://docs.powercity.io/flex-protocol",
    chainConfig: {
      chains: {
        pulse: {
          issued: ["0x1fe0319440a672526916c232eaee4808254bdb00"],
        },
      },
    },
  },
  {
    id: "202",
    name: "Anzen USDz",
    address: "0xa469b7ee9ee773642b3e93e842e5d9b5baa10067",
    symbol: "USDz",
    url: "https://anzen.finance/",
    description:
      "USDz is a stablecoin backed by a diversified portfolio of private credit assets, specifically over-collateralized asset-backed securities. These assets are rigorously underwritten in partnership with Percent, a US licensed broker-dealer that has structured and serviced over $1.7 billion in credit deals since 2018.",
    mintRedeemDescription:
      "Anzen enables users to deposit either SPCT as collateral to create USDz. The protocol deploys capital alongside institutional fiat investors, ensuring a robust and secure backing for USDz.",
    onCoinGecko: "true",
    gecko_id: "anzen-usdz",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: "https://docs.anzen.finance/developer-resources/audits",
    twitter: "https://x.com/AnzenFinance",
    wiki: "https://docs.anzen.finance/",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xa469b7ee9ee773642b3e93e842e5d9b5baa10067"],
        },
        base: {
          issued: ["0x04d5ddf5f3a8939889f11e97f8c4bb48317f1938"],
        },
        blast: {
          issued: ["0x52056ed29fe015f4ba2e3b079d10c0b87f46e8c6"],
        },
        manta: {
          issued: ["0x73d23f3778a90be8846e172354a115543df2a7e4"],
        },
      },
    },
  },
  {
    id: "203",
    name: "Chad USD",
    address: "scroll:0x3cfe56cacf4042057645da9472f6cd51fcb05684",
    symbol: "cUSD",
    url: "https://chadfinance.xyz",
    description:
      "cUSD is the first Scroll-native, decentralized, overcollateralized stablecoin, pegged by concentrated LPs and tracking the US dollar.",
    mintRedeemDescription:
      "Chad USD, developed by Chad Finance, can be minted by collateralizing your Uni-V3 positions, thereby creating deeper liquidity on Scroll.",
    onCoinGecko: "false",
    gecko_id: null,
    module: "chad-usd",

    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    auditLinks:
      "https://github.com/ch4dfinance/Chad-Finance/blob/main/ChadFinanceAudit.pdf",
    twitter: "https://twitter.com/chadfinancexyz",
    wiki: "https://docs.chadfinance.xyz",
  },
  {
    id: "204",
    name: "Balanced Dollars",
    address: "icon:cx88fd7df7ddff82f7cc735c871dc519838cb235bb",
    symbol: "BNUSD",
    url: "https://balanced.network",
    description:
      "Borrow bnUSD, swap and transfer crypto cross-chain, supply liquidity, and govern the future of Balanced",
    mintRedeemDescription:
      "The Balanced Dollar (bnUSD) is a decentralised stablecoin that tracks the price of 1 US dollar. You can borrow bnUSD against any supported collateral type, and use it wrapper-free on every blockchain Balanced connects to. There’s a 0.2% fee, and your loan will increase by 2% a year.",
    onCoinGecko: "true",
    gecko_id: "balanced-dollars",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    auditLinks: null,
    priceSource: "defillama",
    twitter: "https://x.com/BalancedDAO",
    wiki: "https://balanced.network/how/",
  },
  {
    id: "205",
    name: "Agora Dollar",
    address: "0x00000000efe302beaa2b3e6e1b18d08d69a9012a",
    symbol: "AUSD",
    url: "https://www.agora.finance/",
    description:
      "Billions of people across the globe can now enjoy a more secure, inclusive financial system—built on the world’s most widely recognized currency, the US dollar.",
    mintRedeemDescription:
      "Users deposite USD and than mint aUSD",
    onCoinGecko: "true",
    gecko_id: "agora-dollar",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    auditLinks: ["https://agora-defi.notion.site/Contracts-Audits-a0a0058d0fd0450bab43ffe9d1db9f5e#b233bb933bc84084aa9ab56244764a98"],
    priceSource: "defillama",
    twitter: "https://x.com/withAUSD",
    wiki: null,
    chainConfig: {
      decimals: 6,
      chains: {
        sui: {
          issued: ["0x2053d08c1e2bd02791056171aab0fd12bd7cd7efad2ab8f6b9c8902f14df2ff2::ausd::AUSD"],
        },
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
        plume_mainnet: {
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
      },
    },
  },
  {
    id: "206",
    name: "Opus CASH",
    address: "starknet:0x0498edfaf50ca5855666a700c25dd629d577eb9afccdf3b5977aec79aee55ada",
    symbol: "CASH",
    url: "https://www.opus.money/",
    description:
      "Opus CASH is an overcollateralized USD-pegged stablecoin that you can borrow against a basket of collateral at an interest rate based on your collateral profile",
    mintRedeemDescription:
      "To mint CASH, you need to first deposit collateral into Opus. You will then be able to borrow CASH at a given interest rate up to the liquidation limit. The interest rate and liquidation limit are both determined by the profile of your deposited collateral",
    onCoinGecko: "true",
    gecko_id: "opus-cash",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    auditLinks: ["https://github.com/lindy-labs/opus_contracts/tree/main/audits"],
    priceSource: "defillama",
    twitter: "https://x.com/OpusMoney",
    wiki: null,
    chainConfig: {
      chains: {
        starknet: {
          issued: ["0x0498edfaf50ca5855666a700c25dd629d577eb9afccdf3b5977aec79aee55ada"],
        },
      },
    },
  },
  {
    id: "207",
    name: "Dyad",
    address: "0xfd03723a9a3abe0562451496a9a394d2c4bad4ab",
    symbol: "DYAD",
    url: "https://www.dyadstable.xyz/",
    description:
      "DYAD is a stablecoin optimized for unit economics, leveraging shared collateral pools and DYAD NFTs (Notes) that compete for the lowest mint cost. Note owners can mint DYAD via a cross-collateral CDP and increase their capital efficiency by utilising $Kerosene",
    mintRedeemDescription:
      "To mint DYAD, users must first deposit collateral, allowing them to borrow DYAD up to a minimum collateral ratio of 150%, with ratios below this risking liquidation",
    onCoinGecko: "true",
    gecko_id: "dyad",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    auditLinks: null,
    priceSource: "defillama",
    twitter: "https://x.com/0xDYAD",
    wiki: "https://dyad.gitbook.io/docs",
    deadUrl: true,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xFd03723a9A3AbE0562451496a9a394D2C4bad4ab"],
        },
      },
    },
  },
  {
    id: "208",
    name: "Dackie USD",
    address: "base:0x613ce28076289de255f1a6487437f03e37e4a71d",
    symbol: "DCKUSD",
    url: "https://www.dackieswap.xyz/swap",
    description:
      "Dackie USD (dckUSD) is the algorithmic stablecoin, designed to enhance liquidity and drive growth within the DackieSwap ecosystem across multiple blockchains",
    mintRedeemDescription:
      "dckUSD is minted by burning DACKIE tokens through a mechanism integrated into the DackieSwap protocol. When users select the DACKIE-dckUSD pair, the mint-burn process is triggered automatically",
    onCoinGecko: "false",
    gecko_id: null,
    module: "dackie-usd",

    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "algorithmic",
    auditLinks: null,
    priceSource: "defillama",
    twitter: "https://x.com/DackieSwap",
    wiki: "https://docs.dackieswap.xyz/products/product-features/dackie-usd-dckusd#introduction",
    chainConfig: {
      chains: {
        base: {
          issued: ["0x613ce28076289DE255f1a6487437F03E37E4a71d"],
        },
      },
    },
  },
  {
    id: "209",
    name: "Sky Dollar",
    address: "0xdc035d45d973e3ec169d2276ddab16f1e407384f",
    symbol: "USDS",
    url: "https://app.sky.money/",
    description:
      "USDS is the stablecoin of Sky Protocol, soft-pegged to the U.S. dollar and backed by surplus collateral",
    mintRedeemDescription:
      "Users can access Sky Protocol's liquidity pools through Sky.money to trade USDC, USDT, ETH, or SKY for USDS. They can also upgrade DAI to USDS",
    onCoinGecko: "true",
    gecko_id: "usds",
    cmcId: "33039",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    auditLinks: null,
    priceSource: "defillama",
    twitter: "https://x.com/SkyEcosystem",
    wiki: "https://sky.money/faq",
    bridgeConfig: {
      lzConfig: {
        symbols: ["USDS"],
      }
    },
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xdC035D45d973E3EC169d2276DDab16f1e407384F"],
        },
        base: {
          issued: ["0x820c137fa70c8691f0e44dc420a5e53c168921dc"],
        },
        arbitrum: {
          bridgedFromETH: ["0x6491c05A82219b8D1479057361ff1654749b876b"],
        },
        optimism: {
          issued: ["0x4F13a96EC5C4Cf34e442b46Bbd98a0791F20edC3"],
        },
        unichain: {
          issued: ["0x7E10036Acc4B56d4dFCa3b77810356CE52313F9C"],
        },
        solana: {
          bridgedFromETH: ["USDSwr9ApdHk5bvJKMjzff41FfuX8bSxdKcR81vTwcA"],
        },
      },
    },
  },
  {
    id: "210",
    name: "Elixir deUSD",
    address: "0x15700b564ca08d9439c58ca5053166e8317aa138",
    symbol: "DEUSD",
    url: "https://www.elixir.xyz/",
    description:
      'deUSD ("decentralized US Dollar") is a fully collateralized synthetic dollar powered by the Elixir Network',
    mintRedeemDescription:
      "deUSD is minted by stETH and sDAI, which are deposited collateral assets, which will be used to by the protocol to short ETH, creating a delta neutral position",
    onCoinGecko: "true",
    gecko_id: "elixir-deusd",
    cmcId: "31024",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    auditLinks: ["https://docs.elixir.xyz/audit"],
    priceSource: "defillama",
    twitter: "https://x.com/elixir",
    wiki: "https://docs.elixir.xyz/deusd",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x15700B564Ca08D9439C58cA5053166E8317aa138"],
        },
        sei: {
          bridgedFromETH: ["0x37a4dd9ced2b19cfe8fac251cd727b5787e45269"],
        },
        avax: {
          bridgedFromETH: ["0xB57B25851fE2311CC3fE511c8F10E868932e0680"],
        },
        polygon: {
          bridgedFromETH: ["0xB57B25851fE2311CC3fE511c8F10E868932e0680"],
        },
      },
    },
  },
  {
    id: "211",
    name: "Threshold USD",
    address: "0xcfc5bd99915aaa815401c5a41a927ab7a38d29cf",
    symbol: "THUSD",
    url: "https://app.thresholdusd.org",
    description:
      'Threshold USD (thUSD) is a stablecoin soft-pegged against USD and backed by ETH and tBTC as collateral, with a minimum collateral ratio of 110%.',
    mintRedeemDescription:
      "A redemption is the process of exchanging thUSD for tBTC at face value, as if 1 thUSD is exactly worth $1. That is, for x thUSD you get x Dollars worth of tBTC in return. Users can redeem their thUSD for tBTC at any time without limitations. However, a redemption fee might be charged on the redeemed amount",
    onCoinGecko: "true",
    gecko_id: "threshold-usd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    auditLinks: null,
    priceSource: "defillama",
    twitter: "https://x.com/ThresholdUSD",
    wiki: "https://docs.threshold.network/applications/threshold-usd"
  },
  {
    id: "212",
    name: "Move Dollar",
    address: "aptos:0x6f986d146e4a90b828d8c12c14b6f4e003fdff11a8eecceceb63744363eaac01::mod_coin::MOD",
    symbol: "MOD",
    url: "https://app.thala.fi/",
    description:
      `Thala's stablecoin, Move Dollar (MOD), is backed by both native and multi-chain assets, with an additional ongoing focus on yield-bearing collateral types`,
    mintRedeemDescription:
      "Mint MOD by depositing collateral and borrowing less than its value, ensuring over-collateralization. Redeem MOD for $1 worth of collateral minus a fee, establishing a $1 price floor",
    onCoinGecko: "true",
    gecko_id: "move-dollar",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    auditLinks: null,
    priceSource: "defillama",
    twitter: "https://x.com/ThalaLabs",
    wiki: "https://docs.thala.fi/overview/move-dollar-mod/stablecoin"
  },
  {
    id: "213",
    name: "M by M0",
    address: "0x866A2BF4E572CbcF37D5071A7a58503Bfb36be1b",
    symbol: "M",
    url: "https://www.m0.org/",
    description:
      `M^0 democratizes access to money issuance infrastructure. Based on a decentralized architecture and best-in-class collateral design, M^0 allows institutions to issue fungible cryptodollars`,
    mintRedeemDescription:
      "In order to generate M, Minters must have a sufficient off-chain balance of Eligible Collateral which is represented on-chain by a frequently updated and validated number, known as the on-chain Collateral Value",
    onCoinGecko: "true",
    gecko_id: "m-2-wrong",
    module: "m-by-m^0",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    auditLinks: null,
    priceSource: "coingecko",
    twitter: "https://x.com/m0foundation",
    doublecounted: true, // double count on this, and all the ones using them dont need double count
    wiki: "https://docs.m0.org/portal/overview/whitepaper/i.-introduction"
  },
  {
    id: "214",
    name: "USDX Money USDX",
    address: "bsc:0xf3527ef8de265eaa3716fb312c12847bfba66cef",
    symbol: "USDX",
    url: "https://usdx.money/",
    description:
      `USDX is a synthetic USD stablecoin that takes on forms of BTC as backing, combined with short BTC hedges on exchanges to achieve a delta neutral approximate dollar position`,
    mintRedeemDescription:
      "USDX can be minted by approved entities who pass KYC/KYB screenings, using USDX.money contracts, where users deposit cryptocurrency as collateral and receive USDX, with corresponding short positions opened on derivatives exchanges to hedge the backing assets",
    onCoinGecko: "true",
    gecko_id: "usdx-money-usdx",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    auditLinks: ["https://docs.usdx.money/informaiton/audit"],
    priceSource: "defillama",
    twitter: "https://x.com/usdx_money",
    wiki: "https://docs.usdx.money/a-synthetic-usd/usdx-basics",
    deadUrl: true,
    deadFrom: "2025-11-14",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xf3527ef8dE265eAa3716FB312c12847bFBA66Cef"],
        },
        bsc: {
          issued: ["0xf3527ef8dE265eAa3716FB312c12847bFBA66Cef"],
        },
        arbitrum: {
          issued: ["0xf3527ef8dE265eAa3716FB312c12847bFBA66Cef"],
        },
      },
    },
  },
  {
    id: "215",
    name: "Moneta",
    address: "cardano:c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad0014df105553444d",
    symbol: "USDM",
    url: "https://moneta.global/",
    description:
      `Fiat backed stablecoin native to the Cardano blockchain`,
    mintRedeemDescription:
      "Approved business users can mint USDM, after completing KYC. To redeem USDM for USD, verified users request a burn of their USDM tokens, with the equivalent USD amount transferred back to their verified bank account",
    onCoinGecko: "false",
    gecko_id: null,
    module: "moneta",

    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    auditLinks: null,
    priceSource: "defillama",
    twitter: "https://x.com/USDMOfficial",
    wiki: "https://moneta.global/moneta-usdm/"
  },
  {
    id: "216",
    name: "Solayer USD",
    address: "solana:susdabGDNbhrnCa6ncrYo81u4s9GM8ecK2UwMyZiq4X",
    symbol: "sUSD",
    url: "https://solayer.org/product/susd",
    description:
      `sUSD is a yield-bearing stablecoin on Solana that is pegged to the U.S. dollar and backed by U.S. Treasury Bills (T-bills)`,
    mintRedeemDescription:
      "To mint sUSD, a user locks USDC into the system, which creates a quote. This quote specifies the USDC amount, expiry time, and commission rate. A qualified liquidity provider then fulfills the buy order by transferring out the USDC and sending back a wrapped T-Bill as proof. Based on the wrapped T-Bill, the Solayer sUSD Program mints sUSD, which remains pegged 1:1 with USD",
    onCoinGecko: "false",
    gecko_id: "solayer-usd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    auditLinks: ["https://docs.solayer.org/security/audits"],
    priceSource: "defillama",
    twitter: "https://x.com/solayer_labs",
    wiki: "https://docs.solayer.org/susd/what-is-susd",
    chainConfig: {
      chains: {
        solana: {
          issued: ["susdabGDNbhrnCa6ncrYo81u4s9GM8ecK2UwMyZiq4X"],
        },
      },
    },
  },
  {
    id: "217",
    name: "Reservoir Stablecoin",
    address: "0x09d4214c03d01f49544c0448dbe3a27f768f2b34",
    symbol: "rUSD",
    url: "https://app.reservoir.xyz",
    description:
      `Reservoir’s stablecoin, rUSD is available to non-U.S. users and users in non-sanctioned countries. rUSD is built to be extremely scalable and efficient, paving the way for increased utility and cross chain use cases`,
    mintRedeemDescription:
      "Redeemable on a 1:1 basis for USDC or other dollar-denominated stablecoins as directed by governance",
    onCoinGecko: "true",
    gecko_id: "reservoir-rusd",
    module: "reservoir-stablecoin",

    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    auditLinks: null,
    priceSource: "defillama",
    twitter: "https://x.com/__reservoir",
    wiki: "https://docs.reservoir.xyz/products/stablecoin-rusd",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x09d4214c03d01f49544c0448dbe3a27f768f2b34"],
        },
        berachain: {
          bridgedFromETH: ["0x09D4214C03D01F49544C0448DBE3A27f768F2b34"],
        },
        base: {
          bridgedFromETH: ["0x09D4214C03D01F49544C0448DBE3A27f768F2b34"],
        },
        plume_mainnet: {
          bridgedFromETH: ["0x09D4214C03D01F49544C0448DBE3A27f768F2b34"],
        },
        sonic: {
          bridgedFromETH: ["0x09D4214C03D01F49544C0448DBE3A27f768F2b34"],
        },
        wc: {
          bridgedFromETH: ["0x09D4214C03D01F49544C0448DBE3A27f768F2b34"],
        },
        arbitrum: {
          bridgedFromETH: ["0x09D4214C03D01F49544C0448DBE3A27f768F2b34"],
        },
        sei: {
          bridgedFromETH: ["0x09D4214C03D01F49544C0448DBE3A27f768F2b34"],
        },
        unichain: {
          bridgedFromETH: ["0x09D4214C03D01F49544C0448DBE3A27f768F2b34"],
        },
        hyperliquid: {
          bridgedFromETH: ["0x866d66F64FB81461903E1e38d998E747EcF35E78"],
        },
        bsc: {
          bridgedFromETH: ["0x09D4214C03D01F49544C0448DBE3A27f768F2b34"],
        },
        avax: {
          bridgedFromETH: ["0x09D4214C03D01F49544C0448DBE3A27f768F2b34"],
        },
        katana: {
          bridgedFromETH: ["0x09D4214C03D01F49544C0448DBE3A27f768F2b34"],
        },
        solana: {
          bridgedFromETH: ["Ejqkht2dyN1BaaEtK92zBKY6S8HbVH8APB5sDK9Rmokt"],
        },
        linea: {
          bridgedFromETH: ["0x09D4214C03D01F49544C0448DBE3A27f768F2b34"],
        },
        monad: {
          bridgedFromETH: ["0x09D4214C03D01F49544C0448DBE3A27f768F2b34"],
        },
        tempo: {
          issued: ["0x20c0000000000000000000007f7ba549dd0251b9"],
        },
      },
    },
  },
  {
    id: "218",
    name: "River Stablecoin",
    address: "bob:0xecf21b335B41f9d5A89f6186A99c19a3c467871f",
    symbol: "satUSD",
    url: "https://app.river.inc",
    description:
      `River is building the circulatory system for crypto, connecting liquidity, yield and contributions across chains. Powered by the omni-CDP stablecoin protocol, earn, leverage, and scale — all without selling your assets.`,
    mintRedeemDescription:
      "River's Omni-CDP module allows users to access liquidity by depositing collateral, enabling them to borrow up to 90.91% of the collateral's value in satUSD",
    onCoinGecko: "true",
    gecko_id: "satoshi-stablecoin",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    auditLinks: ["https://github.com/Satoshi-Protocol/satoshi-audit-report"],
    priceSource: "defillama",
    twitter: "https://x.com/River4fun",
    wiki: "https://docs.river.inc/",
    chainConfig: {
      chains: {
        bevm: {
          issued: ["0xF2692468666E459D87052f68aE474E36C1a34fbB", "0x2031c8848775a5EFB7cfF2A4EdBE3F04c50A1478"],
        },
        btr: {
          issued: ["0xa1e63CB2CE698CfD3c2Ac6704813e3b870FEDADf", "0xba50dDac6B2F5482cA064EFAc621E0C7c0f6A783"],
        },
        bob: {
          issued: ["0x78Fea795cBFcC5fFD6Fb5B845a4f53d25C283bDB", "0xecf21b335B41f9d5A89f6186A99c19a3c467871f"],
        },
        bsquared: {
          issued: ["0x62b4B8F5a03e40b9dAAf95c7A6214969406e28c3", "0x8dD8b12d55C73c08294664a5915475eD1c8b1F6f"],
        },
        bsc: {
          issued: ["0xb4818BB69478730EF4e33Cc068dD94278e2766cB"],
        },
        hemi: {
          issued: ["0xb4818BB69478730EF4e33Cc068dD94278e2766cB"],
        },
        base: {
          issued: ["0x70654AaD8B7734dc319d0C3608ec7B32e03FA162"],
        },
        arbitrum: {
          issued: ["0xb4818BB69478730EF4e33Cc068dD94278e2766cB"],
        },
        sonic: {
          issued: ["0xb4818BB69478730EF4e33Cc068dD94278e2766cB"],
        },
        xlayer: {
          issued: ["0xceF6c74Ce218c0E1F48cA2430635D0a65Cd3737A"],
        },
        ethereum: {
          issued: ["0x1958853A8BE062dc4f401750Eb233f5850F0D0d2"],
        },
      },
    },
  },
  {
    id: "219",
    name: "Astherus",
    address: "bsc:0x5A110fC00474038f6c02E89C707D638602EA44B5",
    symbol: "USDF",
    url: "https://astherus.com/en/usdf",
    description:
      `USDF is a token minted by depositing USDT on AstherusEarn. USDT and USDF are fully convertible at a 1:1 ratio. `,
    mintRedeemDescription:
      "Redemptionare temporarily unavailable during the ‘fundraising’ period. After the ‘fundraising’ period, users could redeem the USDF by clicking the button of “Redeem”. Then USDT tokens are claimable after three days after submitting the request for redemption.",
    onCoinGecko: "false",
    gecko_id: "astherus-usdf",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    auditLinks: null,
    priceSource: "defillama",
    twitter: "https://x.com/AstherusHub",
    wiki: "https://docs.astherus.com/",
    chainConfig: {
      chains: {
        bsc: {
          issued: ["0x5A110fC00474038f6c02E89C707D638602EA44B5"],
        },
      },
    },
  },
  {
    id: "220",
    name: "Avalon USDa",
    address: "0x8a60e489004ca22d775c5f2c657598278d17d9c2",
    symbol: "USDA",
    url: "https://usda.avalonfinance.xyz/",
    description:
      `USDa is the flagship CDP (Collateralized Debt Position) product based on Avalon's CeDeFi lending platform`,
    mintRedeemDescription:
      "USDa is minted by depositing collateral or USDT (1:1) into Avalon CeDeFi, while redemptions require loan repayment or conversion to USDT",
    onCoinGecko: "true",
    gecko_id: "usda-2",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    auditLinks: null,
    priceSource: "defillama",
    twitter: "https://x.com/avalonfinance_",
    wiki: "https://docs.avalonfinance.xyz/cedefi-cdp-usda",
    module: "avalon-usda",
    bridgeConfig: {
      lzConfig: {
        symbols: ["USDA"],
      }
    }
  },
  {
    id: "221",
    name: "Ethena USDtb",
    address: "0xc139190f447e929f090edeb554d95abb8b18ac1c",
    symbol: "USDTB",
    url: "https://usdtb.money/",
    description:
      `USDtb is a digital dollar, otherwise known as a USD stablecoin. USDtb can be used the same way a holder would use any other dollar, whether to send and receive payments, acquire and trade assets, or to simply hold dollars.`,
    mintRedeemDescription:
      "The mint and redeem contract is a smart contract defining the operations for minting and redeeming USDtb tokens based on cryptographically signed orders controlled by a single admin. EIP-712 and EIP-1271 are the signing methods currently supported. The price present in any mint/redeem orders is determined by an off-chain RFQ system, which a benefactor may accept by signing an order and submitting it to the USDtb RFQ server",
    onCoinGecko: "true",
    gecko_id: "usdtb",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    auditLinks: ["https://docs.usdtb.money/audits"],
    priceSource: "defillama",
    twitter: "https://x.com/ethena_labs",
    wiki: "https://docs.usdtb.money/",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xC139190F447e929f090Edeb554D95AbB8b18aC1C"],
        },
        solana: {
          issued: ["8yXrtJ54jZtE84xEBzTESKuegjcAkAuDrdAhRd8i8n3T"],
        },
      },
    },
  },
  {
    id: "222",
    name: "Parallel USD",
    address: "0x571f54d23cdf2211c83e9a0cbd92aca36c48fa02",
    symbol: "PAUSD",
    url: "https://pausd.mimo.capital/",
    description:
      `paUSD is a USD stablecoin backed by collaterals, and can only be minted with governance-approved collaterals. paUSD are created when users deposit accepted tokens (such as WETH, WBTC, USDC, etc) as collateral in vaults and in turn receive a loan against that collateral`,
    mintRedeemDescription:
      "Tokens are minted by creating a vault on Parallel",
    onCoinGecko: "false",
    gecko_id: null,
    module: "parallel-usd",

    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    auditLinks: ["https://docs.usdtb.money/audits"],
    priceSource: "defillama",
    twitter: "https://x.com/ParallelMoney",
    wiki: "https://docs.mimo.capital/parallel-protocol/parallel-protocol/par-1",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x571f54D23cDf2211C83E9A0CbD92AcA36c48Fa02"],
        },
        polygon: {
          issued: ["0x8054d4D130C3A84852f379424Bcac75673a7486B"],
        },
      },
    },
  },
  {
    id: "223",
    name: "TREN Debt Token",
    address: "arbitrum:0xd4fe6e1e37dfcf35e9eeb54d4cca149d1c10239f",
    symbol: "XY",
    url: "https://www.tren.finance/",
    description:
      `XY is a synthetic dollar debt token in the Tren Finance ecosystem, backed by overcollateralized loans and using LayerZero's OFT standard for cross-chain transfers`,
    mintRedeemDescription:
      "Users mint XY by depositing collateral, while redemption is managed through automated peg stability contracts and buyback-and-burn mechanisms, avoiding direct redemptions to protect user collateral",
    onCoinGecko: "false",
    gecko_id: null,
    module: "tren-debt-token",

    cmcId: "16013",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    auditLinks: ["https://github.com/zokyo-sec/audit-reports/blob/main/Tren%20Finance/Tren%20Finance_Zokyo_audit_report_Nov19th_2024.pdf"],
    priceSource: "defillama",
    twitter: "https://x.com/TrenFinance",
    wiki: "https://docs.tren.finance/tokens/xy",
    chainConfig: {
      chains: {
        arbitrum: {
          issued: ["0xD4fe6e1e37dfCf35E9EEb54D4cca149d1c10239f"],
        },
      },
    },
  },
  {
    id: "224",
    name: "dTRINITY USD",
    address: "fraxtal:0x788D96f655735f52c676A133f4dFC53cEC614d4A",
    symbol: "dUSD",
    url: "https://dtrinity.org/",
    description:
      `dUSD is a decentralized and full-reserve stablecoin, backed by an on-chain reserve of other USD-denominated stablecoins and yieldcoins. Based on the ERC-20 standard, every dUSD token is backed by at least $1 of collateral and can be minted permissionlessly via smart contracts with no fees (excluding gas).`,
    mintRedeemDescription: "Users can mint and redeem dUSD with other stablecoins and yield-bearing assets.",
    onCoinGecko: "true",
    gecko_id: "dtrinity-usd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    auditLinks: ["https://docs.dtrinity.org/developer/audits-and-security"],
    priceSource: "coingecko",
    twitter: "https://x.com/dtrinity_defi",
    wiki: "https://docs.dtrinity.org",
    doublecounted: true,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x07fFf99e1664d9B116fbC158c0E99785F81cA236"],
        },
        fraxtal: {
          issued: ["0x788D96f655735f52c676A133f4dFC53cEC614d4A"],
        },
        sonic: {
          issued: ["0x53a6aBb52B2F968fA80dF6A894e4f1b1020DA975"],
        },
        ronin: {
          issued: ["0x0043a403ada6b63045112d7e979a057c82714fe7"],
        },
        katana: {
          issued: ["0xcA52d08737E6Af8763a2bF6034B3B03868f24DDA"],
        },
      },
    },
  },
  {
    id: "225",
    name: "Zoth ZeUSD",
    address: "metis:0x2d3D1a6982840Dd88bC2380Fd557F8A9D5e27a77",
    symbol: "ZeUSD",
    url: "https://app.zoth.io/zeusd",
    description:
      `ZeUSD is a fully composable, omnichain, RWA-backed CDP stable token, issued on top of high-quality liquid off-chain or on-chain RWAs like US TBIlls, ETFs, MMFs, Reverse Repos etc`,
    mintRedeemDescription: "ZeUSD is created when users deposit eligible RWA as collateral to open a collateralized debt position",
    onCoinGecko: "false",
    gecko_id: null,
    module: "zoth-zeusd",

    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    auditLinks: ["https://docs.zoth.io/zoth/resources/audits"],
    priceSource: "defillama",
    deadFrom: "2025-03-19",
    twitter: "https://x.com/zothdotio",
    wiki: "https://docs.zoth.io/zoth/products/zeusd-an-omni-chain-and-composable-stable-token",
    chainConfig: {
      decimals: 6,
      chains: {
        ethereum: {
          issued: ["0x7DC9748DA8E762e569F9269f48F69A1a9F8Ea761"],
        },
        metis: {
          bridgedFromETH: ["0x2d3D1a6982840Dd88bC2380Fd557F8A9D5e27a77"],
        },
        manta: {
          bridgedFromETH: ["0x7DC9748DA8E762e569F9269f48F69A1a9F8Ea761"],
        },
        avax: {
          bridgedFromETH: ["0x7DC9748DA8E762e569F9269f48F69A1a9F8Ea761"],
        },
      },
    },
  },
  {
    id: "226",
    name: "Frankencoin",
    address: "0xb58e61c3098d85632df34eecfb899a1ed80921cb",
    symbol: "ZCHF",
    url: "https://app.frankencoin.com/",
    description:
      `Frankencoin ZCHF is a collateralized, oracle-free stablecoin that tracks the value of the Swiss franc`,
    mintRedeemDescription: "To mint ZCHF, propose a new position with a 1,000 ZCHF fee or clone an existing position, with reserves and interest deducted upfront, secured by a challenge-and-auction system to maintain collateral integrity",
    onCoinGecko: "true",
    gecko_id: "frankencoin",
    cmcId: "31379",
    pegType: "peggedCHF",
    pegMechanism: "crypto-backed",
    auditLinks: [
      "https://github.com/Frankencoin-ZCHF/Frankencoin/blob/main/audits/V1/ChainSecurity-audit.pdf",
      "https://github.com/Frankencoin-ZCHF/Frankencoin/blob/main/audits/V1/blockbite-audit.pdf",
      "https://github.com/Frankencoin-ZCHF/Frankencoin/blob/main/audits/V2/ChainSecurity_Frankencoin_Frankencoin_v2024.pdf",
      "https://github.com/Frankencoin-ZCHF/Frankencoin/blob/main/audits/V2/frankencoin-audit-report-2024-1.1.pdf",
      "https://github.com/Frankencoin-ZCHF/Frankencoin/tree/main/audits/V1",
      "https://github.com/Frankencoin-ZCHF/Frankencoin/tree/main/audits/V2"
    ],
    priceSource: "defillama",
    twitter: "https://x.com/frankencoinzchf",
    wiki: "https://docs.frankencoin.com/#frankencoin-zchf-and-frankencoin-pool-shares-fps",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xB58E61C3098d85632Df34EecfB899A1Ed80921cB"],
        },
        polygon: {
          issued: ["0xD4dD9e2F021BB459D5A5f6c24C12fE09c5D45553"],
          bridgedFromETH: ["0x02567e4b14b25549331fCEe2B56c647A8bAB16FD"],
        },
        arbitrum: {
          issued: ["0xD4dD9e2F021BB459D5A5f6c24C12fE09c5D45553"],
          bridgedFromETH: ["0xB33c4255938de7A6ec1200d397B2b2F329397F9B"],
        },
        optimism: {
          issued: ["0xD4dD9e2F021BB459D5A5f6c24C12fE09c5D45553"],
          bridgedFromETH: ["0x4F8a84C442F9675610c680990EdDb2CCDDB8aB6f"],
        },
        base: {
          issued: ["0xD4dD9e2F021BB459D5A5f6c24C12fE09c5D45553"],
          bridgedFromETH: ["0x20D1c515e38aE9c345836853E2af98455F919637"],
        },
        xdai: {
          issued: ["0xD4dD9e2F021BB459D5A5f6c24C12fE09c5D45553"],
          bridgedFromETH: ["0x4cde2b4e7254e6ec5b450d50e3607bade6be3980"],
        },
        avax: {
          issued: ["0xD4dD9e2F021BB459D5A5f6c24C12fE09c5D45553"],
        },
        sonic: {
          issued: ["0xD4dD9e2F021BB459D5A5f6c24C12fE09c5D45553"],
        },
      },
    },
  },
  {
    id: "227",
    name: "Legacy BOLD",
    address: "0xb01dd87b29d187f3e3a4bf6cdaebfb97f3d9ab98",
    symbol: "BOLD",
    url: "https://www.liquity.org/bold",
    description:
      `BOLD is the USD-pegged stablecoin issued in Liquity V2. It’s fully decentralized, overcollateralized and backed only by WETH, wstETH and rETH`,
    mintRedeemDescription: "BOLD is minted in Liquity V2 by borrowing against overcollateralized deposits of WETH, wstETH, or rETH, and it can always be redeemed directly for these underlying assets at a 1:1 USD value",
    onCoinGecko: "false",
    gecko_id: null,
    module: "legacy-bold",

    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    auditLinks: null,
    priceSource: "defillama",
    twitter: "https://x.com/LiquityProtocol",
    wiki: "https://docs.liquity.org/v2-documentation/technical-resources",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xb01dd87b29d187f3e3a4bf6cdaebfb97f3d9ab98"],
        },
        base: {
          bridgedFromETH: ["0x087c440f251ff6cfe62b86dde1be558b95b4bb9b"],
        },
        arbitrum: {
          bridgedFromETH: ["0x087c440f251ff6cfe62b86dde1be558b95b4bb9b"],
        },
        optimism: {
          bridgedFromETH: ["0x087c440f251ff6cfe62b86dde1be558b95b4bb9b"],
        },
        scroll: {
          bridgedFromETH: ["0x087c440f251ff6cfe62b86dde1be558b95b4bb9b"],
        },
        avax: {
          bridgedFromETH: ["0x087c440f251ff6cfe62b86dde1be558b95b4bb9b"],
        },
      },
    },
  },
  {
    id: "228",
    name: "Quill USD",
    address: "scroll:0xdb9e8f82d6d45fff803161f2a5f75543972b229a",
    symbol: "USDQ",
    url: "https://app.quill.finance/",
    description:
      `$USDQ is a decentralized, algorithmic stablecoin that is soft-pegged to the U.S. dollar`,
    mintRedeemDescription: "To mint $USDQ, users deposit an eligible collateral asset into their Trove on the Quill platform. Based on the value of the collateral and the protocol's collateralization requirements, users can mint $USDQ up to a certain limit",
    onCoinGecko: "true",
    gecko_id: "quill-usdq",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    auditLinks: null,
    priceSource: "defillama",
    twitter: "https://x.com/QuillFi",
    wiki: "https://docs.quill.finance/faq/usdusdq",
    module: "quill-usd",
    chainConfig: {
      chains: {
        scroll: {
          issued: ["0xdb9e8f82d6d45fff803161f2a5f75543972b229a"],
        },
      },
    },
  },
  {
    id: "229",
    name: "Level USD",
    address: "0x7c1156e515aa1a2e851674120074968c905aaf37",
    symbol: "LVLUSD",
    url: "https://level.money",
    description:
      `Level USD is a stablecoin backed by USDC and USDT that are deployed on blue-chip restaking and lending protocols. Users can stake Level USD to earn stacked restaking and lending yield with the stable reserves of battle-tested stablecoins`,
    mintRedeemDescription: "Users can mint Level USD with USDC and USDT permissionlessly. The protocol deploys this collateral into blue-chip restaking and lending protocols to generate yield for users",
    onCoinGecko: "true",
    gecko_id: "level-usd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    auditLinks: ["https://level-money.gitbook.io/docs/technical-documentation/audits"],
    priceSource: "defillama",
    twitter: "https://twitter.com/levelusd",
    wiki: "https://level-money.gitbook.io/docs/level-usd/level-usd-a-new-primitive",
    doublecounted: true,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x7c1156e515aa1a2e851674120074968c905aaf37"],
        },
      },
    },
  },
  {
    id: "230",
    name: "Noon USN",
    address: "0xdA67B4284609d2d48e5d10cfAc411572727dc1eD",
    symbol: "USN",
    url: "https://noon.capital",
    description:
      "USN is an over-collateralized stablecoin pegged to the US Dollar. It is a synthetic dollar which provides an yield to users by a basket of delta neutral strategies",
    mintRedeemDescription:
      "Noon enables users to deposit USDT & USDC as collateral to create USN. Stability is secured through delta-neutral hedging strategies.",
    onCoinGecko: "true",
    gecko_id: "noon-usn",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "coingecko",
    auditLinks: ["https://docs.noon.capital/security/smart-contract-audits"],
    twitter: "https://twitter.com/noon_capital",
    wiki: "https://docs.noon.capital",
    doublecounted: true,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xdA67B4284609d2d48e5d10cfAc411572727dc1eD"],
        },
        era: {
          issued: ["0x0469d9d1dE0ee58fA1153ef00836B9BbCb84c0B6"],
        },
        sophon: {
          issued: ["0xC1AA99c3881B26901aF70738A7C217dc32536d36"],
        },
      },
    },
  },
  {
    id: "231",
    name: "Honey",
    address: "berachain:0xfcbd14dc51f0a4d49d5e53c2e0950e0bc26d0dce",
    symbol: "HONEY",
    url: "https://honey.berachain.com/",
    description:
      "HONEY is Berachain's native stablecoin",
    mintRedeemDescription:
      "The initial collateral options will be USDC and BYUSD (pyUSD). New assets used to mint $HONEY can be added via governance",
    onCoinGecko: "true",
    gecko_id: "honey-3",
    cmcId: "35670",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/berachain",
    wiki: "https://docs.berachain.com/learn/pol/tokens/honey",
    doublecounted: true,
    chainConfig: {
      chains: {
        berachain: {
          issued: ["0xfcbd14dc51f0a4d49d5e53c2e0950e0bc26d0dce"],
        },
      },
    },
  },
  {
    id: "232",
    name: "Pinto",
    address: "base:0xb170000aeefa790fa61d6e837d1035906839a3c8",
    symbol: "PINTO",
    url: "https://pinto.money/overview",
    description:
      "Pinto is a censorship-resistant, credit-based stable asset protocol built on Base, designed to provide low-volatility money without reliance on collateral",
    mintRedeemDescription:
      "To mint PINTO, users deposit whitelisted assets into the Silo to earn yield or participate in the Field by lending to the protocol in exchange for future rewards, while to redeem PINTO, users withdraw their deposits or claim rewards based on the protocol's credit-based system",
    onCoinGecko: "true",
    gecko_id: "pinto",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/pintodotmoney",
    wiki: "https://docs.pinto.money/",
    doublecounted: true,
    chainConfig: {
      chains: {
        base: {
          issued: ["0xb170000aeeFa790fa61D6e837d1035906839a3c8"],
        },
      },
    },
  },
  {
    id: "233",
    name: "TheStandard USD",
    address: "arbitrum:0x2ea0be86990e8dac0d09e4316bb92086f304622d",
    symbol: "USDS",
    url: "https://www.thestandard.io/",
    description:
      "USDs is TheStandard's USD-pegged stablecoin, central to the protocol's borrowing operations",
    mintRedeemDescription:
      "To mint USDS, users deposit collateral into a Smart Vault. This can be single or multiple collateral types",
    onCoinGecko: "true",
    gecko_id: "thestandard-usd",
    cmcId: "33452",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://docs.thestandard.io/tst/security-and-risk-management/audits-and-safety-measures"],
    twitter: "https://x.com/thestandard_io",
    wiki: "https://docs.thestandard.io/tst/introduction/usds-and-euros",
    chainConfig: {
      chains: {
        arbitrum: {
          issued: ["0x2Ea0bE86990E8Dac0D09e4316Bb92086F304622d"],
        },
      },
    },
  },
  {
    id: "234",
    name: "Worldwide USD",
    address: "0x7cd017ca5ddb86861fa983a34b5f495c6f898c41",
    symbol: "WUSD",
    url: "https://wspn.io/",
    description:
      "WUSD is a regulated stablecoin designed for worldwide payments and round-the-clock financial markets, always redeemable 1:1 for US dollars",
    mintRedeemDescription:
      "WUSD is backed by liquid assets, including cash, cash equivalents, and short-term treasury bills. Each WUSD token represents one US Dollar held in reserve",
    onCoinGecko: "true",
    gecko_id: "worldwide-usd",
    cmcId: "29318",
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: ["https://wspn.io/Certik%20Smart%20Contract%20Audit%20Report.pdf"],
    twitter: "https://x.com/WSPNpayment",
    wiki: "https://wspn.io/documentation.html",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x7Cd017ca5ddb86861FA983a34b5F495C6F898c41"],
        },
        polygon: {
          issued: ["0x7Cd017ca5ddb86861FA983a34b5F495C6F898c41"],
        },
      },
    },
  },
  {
    id: "235",
    name: "Frax USD",
    address: "0xcacd6fd266af91b8aed52accc382b4e165586e29",
    symbol: "FRXUSD",
    url: "https://frax.com/",
    description:
      "Frax USD (frxUSD) is a fiat-redeemable, fully-collateralized stablecoin issued by the Frax Finance Protocol",
    mintRedeemDescription:
      "Frax USD uses a hybrid model that allows for governance-approved enshrined custodians to mint/redeem the stablecoin by holding cash-equivalent reserves while also having onchain mechanisms built by the Frax Finance Protocol",
    onCoinGecko: "true",
    gecko_id: "frax-usd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/fraxfinance",
    wiki: "https://docs.frax.com/protocol/assets/frxusd/frxusd",
    doublecounted: true
  },
  {
    id: "236",
    name: "Synnax Stablecoin",
    address: "0x059A6b0bA116c63191182a0956cF697d0d2213eC",
    symbol: "syUSD",
    url: "https://synnax.fi",
    description:
      "syUSD is Synnax’s stablecoin, secured by overcollateralized assets and designed to maintain a soft peg to the U.S. dollar",
    mintRedeemDescription:
      "Users mint syUSD by depositing assets into Synnax vaults, where collateral is utilized for market-making strategies. Redemption requires debt repayment",
    onCoinGecko: "true",
    gecko_id: "syusd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://github.com/peckshield/publications/blob/master/audit_reports/PeckShield-Audit-Report-Synnax-v1.0.pdf"],
    twitter: "https://twitter.com/synnax_labs",
    wiki: "https://docs.synnax.fi",
    deadFrom: "2026-01-15",
    deprecated: true,
    deadUrl: true,
    chainConfig: {
      chains: {
        sei: {
          issued: ["0x059A6b0bA116c63191182a0956cF697d0d2213eC"],
        },
      },
    },
  },
  {
    id: "237",
    name: "Circle USYC",
    address: "0x136471a34f6ef19fe571effc1ca711fdb8e49f2b",
    symbol: "USYC",
    url: "https://www.circle.com/usyc",
    description:
      "USYC is a tokenized money market fund backed by U.S. Treasury bills, designed by Hashnote Labs (now part of Circle) to generate yield within the token itself for use as collateral in crypto markets",
    mintRedeemDescription:
      "USYC is minted when users deposit USDC into USYC fund, which then invests in short-term U.S. Treasury bills to create the yield-bearing token, and it can be redeemed by converting it back to USDC at a 1:1 ratio through Circle's system",
    onCoinGecko: "true",
    gecko_id: "hashnote-usyc",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/circle",
    wiki: "https://www.circle.com/usyc",
    doublecounted: true,
    yieldBearing: true,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x136471a34f6ef19fe571effc1ca711fdb8e49f2b"],
        },
        bsc: {
          issued: ["0x8d0fa28f221eb5735bc71d3a0da67ee5bc821311"],
        },
      },
    },
  },
  {
    id: "238",
    name: "Rings scUSD",
    address: "sonic:0xd3dce716f3ef535c5ff8d041c1a41c3bd89b97ae",
    symbol: "SCUSD",
    url: "https://app.rings.money/#/mint",
    description:
      "scUSD is a yield-bearing stablecoin that users mint by depositing stablecoins, which are then deployed into DeFi strategies",
    mintRedeemDescription:
      "scUSD is minted when users deposit stablecoins on Ethereum or Sonic, with the funds deployed into yield-generating DeFi strategies",
    onCoinGecko: "true",
    gecko_id: "rings-scusd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/Rings_Protocol",
    wiki: "https://docs.rings.money/tutorials/introduction",
    chainConfig: {
      chains: {
        sonic: {
          issued: ["0xd3DCe716f3eF535C5Ff8d041c1A41C3bd89b97aE"],
        },
      },
    },
  },
  {
    id: "239",
    name: "StablR Euro",
    address: "0x50753CfAf86c094925Bf976f218D043f8791e408",
    symbol: "EURR",
    url: "https://stablr.com",
    description:
      "StablR Euro (EURR) is a Euro-pegged MiCAR compliant stablecoin designed to maintain a 1:1 value with the Euro. EURR combines the reliability of fiat currency with the efficiency of blockchain. EURR is issued by StablR Ltd., an electronic money institution supervised by the MFSA",
    mintRedeemDescription:
      "StablR customers who have undergone a verification process can exchange EUR for EURR and redeem EURR for EUR",
    onCoinGecko: "true",
    gecko_id: "stablr-euro",
    cmcId: null,
    pegType: "peggedEUR",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/stablreuro/",
    wiki: "https://stablr.com/eurr",
  },
  {
    id: "240",
    name: "StablR USD",
    address: "0x7B43E3875440B44613DC3bC08E7763e6Da63C8f8",
    symbol: "USDR",
    url: "https://stablr.com",
    description:
      "StablR USD (USDR) is a USD-pegged MiCAR compliant stablecoin designed to maintain a 1:1 value with the United States Dollar. USDR combines the reliability of fiat currency with the efficiency of blockchain. USDR is issued by StablR Ltd., an electronic money institution supervised by the MFSA",
    mintRedeemDescription:
      "StablR customers who have undergone a verification process can exchange USD for USDR and redeem USDR for USD",
    onCoinGecko: "true",
    gecko_id: "stablr-usd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/stablrusd/",
    wiki: "https://stablr.com/usdr",
  },
  {
    id: "241",
    name: "OpenDollar USDO",
    address: "0x8238884Ec9668Ef77B90C6dfF4D1a9F4F4823BFe",
    symbol: "USDO",
    url: "https://openeden.com/usdo",
    description:
      "The OpenEden OpenDollar (USDO) is a rebasing yield-bearing stablecoin issued by OpenEden Digital (OED), a Bermuda Monetary Authority (BMA) licensed digital asset issuer. OED is a wholly owned subsidiary of OpenEden Group (OEG). The value of USDO is fixed at $1, providing stability to its holders while offering a yield on the underlying reserve assets. USDO rebases daily, which allows holders to earn yield generated from reserves backed by U.S. Treasury Bills.",
    mintRedeemDescription:
      "USDO can be minted on a primary basis using USDC or TBILL as collateral on the OpenEden platform. USDO is fully-backed 1:1 by tokenized short-term U.S. Treasury Bills.",
    onCoinGecko: "true",
    gecko_id: "openeden-open-dollar",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/OpenEden_X",
    wiki: "https://docs.openeden.com/usdo/introduction",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x8238884Ec9668Ef77B90C6dfF4D1a9F4F4823BFe"],
        },
        base: {
          issued: ["0xaD55aebc9b8c03FC43cd9f62260391c13c23e7c0"],
        },
        plasma: {
          issued: ["0x87e617C7484aDE79FcD90db58BEB82B057facb48"],
        },
        bsc: {
          issued: ["0x302e52AFf9815B9D1682473DBFB9C74F9B750AA8"],
        },
      },
    },
  },
  {
    id: "242",
    name: "Hermetica USDh",
    address: "SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.usdh-token-v1",
    symbol: "USDH",
    url: "https://app.hermetica.fi/stake",
    description:
      "Bitcoin-backed, yield-bearing synthetic dollar on Bitcoin L1 and L2s",
    mintRedeemDescription:
      "USDh is minted through Hermetica by approved users who complete KYC/AML and deposit Bitcoin, with issuance on Bitcoin Layer 1 via Runes and Layer 2 via Stacks.",
    onCoinGecko: "true",
    gecko_id: "hermetica-usdh",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/HermeticaFi",
    wiki: "https://docs.hermetica.fi/usdh/usdh-and-susdh",
  },
  {
    id: "243",
    name: "Coinshift",
    address: "0xbEeFc011e94f43b8B7b455eBaB290C7Ab4E216f1",
    symbol: "csUSDL",
    url: "https://www.coinshift.xyz/personal",
    description:
      "Earn real yield with csUSDL, the institutional-grade stablecoin backed by the world’s most secure onchain assets.",
    mintRedeemDescription:
      "csUSDL can be minted by swapping USDC directly via CoWSwap. For minimal slippage, users can first swap USDC for USDL using Curve, then deposit USDL into wUSDL through LiftDollar, and finally deposit wUSDL into the csUSDL Morpho vault. csUSDL can be redeemed for wUSDL based on available liquidity in the Morpho vault. CoWSwap solvers facilitate redemptions by leveraging all available on-chain liquidity, including Curve and Balancer, ensuring efficient conversions between csUSDL and USDC.",
    onCoinGecko: "true",
    gecko_id: "coinshift-usdl-morpho-vault",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/0xCoinshift",
    wiki: "https://docs.coinshift.xyz/coinshift-assets/csusdl/coinshift-usdl-vault/how-csusdl-vault-works",
    doublecounted: true,
    yieldBearing: true,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xbEeFc011e94f43b8B7b455eBaB290C7Ab4E216f1"],
        },
      },
    },
  },
  {
    id: "244",
    name: "Lift Dollar",
    address: "0xbdc7c08592ee4aa51d06c27ee23d5087d65adbcd",
    symbol: "USDL",
    url: "https://liftdollar.com/",
    description:
      "Lift Dollar (USDL) is a US dollar-backed stablecoin with regulatory oversight that distributes yield from its cash and cash equivalent reserves to its holders every day.",
    mintRedeemDescription:
      "Institutions mint USDL by wiring USD or sending USDC, which Paxos converts and delivers to an Ethereum address; to redeem, they send USDL to Paxos for a USD wire transfer",
    onCoinGecko: "true",
    gecko_id: "lift-dollar",
    cmcId: "32454",
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/LiftDollar_USDL",
    wiki: "https://docs.liftdollar.com/",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xbdC7c08592Ee4aa51D06C27Ee23D5087D65aDbcD"],
        },
        arbitrum: {
          issued: ["0x7F850b0aB1988Dd17B69aC564c1E2857949e4dEe"],
        },
      },
    },
  },
  {
    id: "245",
    name: "Anzens USDA",
    address: "cardano:fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae45655534441",
    symbol: "USDA",
    url: "https://anzens.com/",
    description:
      "USDA stablecoin is designed to be pegged to the U.S. Dollar with 100% reserves backed by dollars and dollar equivalents.",
    mintRedeemDescription:
      "USDA is minted and redeemed through Anzens via bank transfers and requires KYC verification..",
    onCoinGecko: "false",
    gecko_id: "anzens-usda",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/AnzensOfficial",
    wiki: "https://anzens.com/",
    chainConfig: {
      chains: {
        cardano: {
          issued: ["fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae45655534441"],
        },
      },
    },
  },
  {
    id: "246",
    name: "Falcon USD",
    address: "0xFa2B947eEc368f42195f24F36d2aF29f7c24CeC2",
    symbol: "USDf",
    url: "https://falcon.finance/",
    description: "Falcon Finance is a next-generation synthetic dollar protocol. Preserving users’ multi-assets with industry-competitive yields across any market conditions, it sets a new standard in the industry, along with transparency, security, and institutional-grade risk management.",
    mintRedeemDescription: "Falcon Finance users who have completed KYC verification can mint USDf by depositing collateral and redeem USDf for supported assets, subject to eligibility and jurisdictional requirements.",
    onCoinGecko: "true",
    gecko_id: "falcon-finance",
    cmcId: "35721",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://docs.falcon.finance/resources/audits"],
    twitter: "https://x.com/falconfinance",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xFa2B947eEc368f42195f24F36d2aF29f7c24CeC2"],
        },
        bsc: {
          bridgedFromETH: ["0xb3b02E4A9Fb2bD28CC2ff97B0aB3F6B3Ec1eE9D2"],
        },
      },
    },
  },
  {
    id: "247",
    name: "Schuman EUROP",
    address: "0x888883b5f5d21fb10dfeb70e8f9722b9fb0e5e51",
    symbol: "EUROP",
    url: "https://schuman.io/europ/",
    description: "EURØP is a secure, transparent, and MiCA-compliant euro-denominated stablecoin, redeemable 1:1 for the euro",
    mintRedeemDescription: "EURØP is issued by a licensed stablecoin issuer and regulated by the French banking authority ACPR. Each EURØP is 100% backed by euros, with reserves held in government-supervised EU banks such as Société Générale",
    onCoinGecko: "true",
    gecko_id: "schuman-europ",
    cmcId: null,
    pegType: "peggedEUR",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: ["https://skynet.certik.com/projects/schuman-financial"],
    twitter: "https://x.com/Schuman_io",
    wiki: "https://schuman.io/europ/",
  },
  {
    id: "248",
    name: "USDFC",
    address: "filecoin:0x80B98d3aa09ffff255c3ba4A241111Ff1262F045",
    symbol: "USDFC",
    url: "https://app.usdfc.net/#/",
    description: "USDFC is fully collateralized by Filecoin (FIL) and aims to maintain a 1:1 peg to the US dollar",
    mintRedeemDescription: "Users mint USDFC by depositing FIL as collateral, and redeem USDFC by exchanging it back for FIL at the current USD-equivalent value",
    onCoinGecko: "true",
    gecko_id: "usdfc",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://docs.secured.finance/fixed-rate-lending-protocol/security-and-safety-measures/smart-contract-audits"],
    twitter: "https://x.com/USDFC_Protocol",
    wiki: "https://docs.secured.finance/usdfc-stablecoin-protocol/introduction",
    chainConfig: {
      chains: {
        filecoin: {
          issued: ["0x80B98d3aa09ffff255c3ba4A241111Ff1262F045"],
        },
      },
    },
  },
  // { No new attestations provided
  //   id: "249",
  //   name: "Brazilian Digital",
  //   address: "0x01d33fd36ec67c6ada32cf36b31e88ee190b1839",
  //   symbol: "BRZ",
  //   url: "https://transfero.com/stablecoins/brz/",
  //   description: "Brazilian Digital Token (BRZ) is a stablecoin, pegged to the official currency of Brazil, the Brazilian Real",
  //   mintRedeemDescription: "BRZ tokens are minted and redeemed through Transfero, the official issuer of BRZ, by exchanging Brazilian Reais (BRL) directly at a 1:1 ratio, and minting or redeeming requires users to complete a KYC verification process",
  //   onCoinGecko: "true",
  //   gecko_id: "brz",
  //   cmcId: null,
  //   pegType: "peggedREAL",
  //   pegMechanism: "fiat-backed",
  //   priceSource: "defillama",
  //   auditLinks: [],
  //   twitter: "https://x.com/BrzToken",
  //   wiki: "https://transfero.com/stablecoins/brz/#brz-token"
  // },
  {
    id: "250",
    name: "Ripple USD",
    address: "0x8292bb45bf1ee4d140127049757c2e0ff06317ed",
    symbol: "RLUSD",
    url: "https://ripple.com/solutions/stablecoin/",
    description: "Ripple USD (RLUSD) is designed to maintain a constant value of one US dollar",
    mintRedeemDescription: "Natively issued on XRP Ledger and Ethereum blockchains, Ripple USD is fully backed by a segregated reserve of cash and cash equivalents and redeemable 1:1 for US dollars",
    onCoinGecko: "true",
    gecko_id: "ripple-usd",
    cmcId: "34387",
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/Ripple",
    wiki: "https://docs.ripple.com/stablecoin/",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x8292bb45bf1ee4d140127049757c2e0ff06317ed"],
        },
        ripple: {
          issued: ["524C555344000000000000000000000000000000.rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De"],
        },
      },
    },
  },
  {
    id: "251",
    name: "Felix feUSD",
    address: "hyperliquid:0x02c6a2fA58cC01A18B8D9E00eA48d65E4dF26c70",
    symbol: "FEUSD",
    url: "https://usefelix.xyz/borrow",
    description: "Felix feUSD is a synthetic dollar protocol on Hyperliquid L1",
    mintRedeemDescription: "Users can deposit HYPE, PURR, or bridged majors (BTC, ETH, SOL) as collateral to mint feUSD, and later redeem feUSD for an equivalent value in collateral",
    onCoinGecko: "true",
    gecko_id: "felix-feusd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/felixprotocol",
    wiki: "https://usefelix.gitbook.io/felix-docs",
    chainConfig: {
      chains: {
        hyperliquid: {
          issued: ["0x02c6a2fA58cC01A18B8D9E00eA48d65E4dF26c70"],
        },
      },
    },
  },
  {
    id: "252",
    name: "StandX DUSD",
    address: "solana:DUSDt4AeLZHWYmcXnVGYdgAzjtzU5mXUVnTMdnSzAttM",
    symbol: "DUSD",
    url: "https://standx.com",
    description: "DUSD is a native yield bearing stablecoin designed to provide users with a stablecoin that offers competitive returns",
    mintRedeemDescription: "Users can mint DUSD by depositing USDT or USDC and redeem by swapping DUSD back to USDT or USDC through the platform.",
    onCoinGecko: "false",
    gecko_id: "standx-dusd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://docs.standx.com/docs/solutions/audits"],
    twitter: "https://x.com/StandX_Official",
    wiki: "https://docs.standx.com/docs/dusd-overview",
    doublecounted: true,
    chainConfig: {
      chains: {
        bsc: {
          issued: ["0xaf44A1E76F56eE12ADBB7ba8acD3CbD474888122"],
        },
        solana: {
          issued: ["DUSDt4AeLZHWYmcXnVGYdgAzjtzU5mXUVnTMdnSzAttM"],
        },
      },
    },
  },
  {
    id: "253",
    name: "USBD",
    address: "0x6bedE1c6009a78c222D9BDb7974bb67847fdB68c",
    symbol: "USBD",
    url: "https://bima.money/",
    description: "USBD is a capital-efficient stablecoin over-collateralized by Bitcoin derivatives",
    mintRedeemDescription: "Users mint USBD by locking approved collateral like LSTs or BTC in a vault, and can redeem it by repaying USBD to unlock their collateral.",
    onCoinGecko: "false",
    gecko_id: "usbd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: [
      "https://github.com/Cyfrin/cyfrin-audit-reports/blob/main/reports/2024-09-27-cyfrin-bima-v2.0.pdf",
      "https://cantina.xyz/portfolio/0e4d03d9-b8c4-4cd7-ab20-15a480096d49",
      "https://scalebit.xyz/reports/20241023-Bima-Final-Audit-Report.pdf"
    ],
    twitter: "https://x.com/BimaBTC",
    wiki: "https://docs.bima.money/",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x6bedE1c6009a78c222D9BDb7974bb67847fdB68c"],
          unreleased: [
            "0xF0DE02A2d05A82222CBB98df3EEA10CAFc8c92C1", // burner
            "0xEA811C2C400EE846E352D45C849657D920A888fe", // psm
            "0x97bb3167A88FE34B1EC6d7F02560c4F0aa6009E9", // psm
            "0x42Ad6834a6599a0B7a7812F01f8092B580523d67", // psm
            "0x705fd2306bf6E4dec47bF8Aaab378B04024792d4", // psm
          ],
        },
        core: {
          issued: ["0x6bedE1c6009a78c222D9BDb7974bb67847fdB68c"],
          unreleased: ["0xBA4197EF8DdDa01E628FA98d0b1E87751628a3B2"], // burner
        },
        hemi: {
          issued: ["0x6bedE1c6009a78c222D9BDb7974bb67847fdB68c"],
          unreleased: ["0xf9240FeEe9d1d6e8614a8d22D6864fFbc3f52235"], // burner
        },
        bsc: {
          issued: ["0x6bedE1c6009a78c222D9BDb7974bb67847fdB68c"],
          unreleased: ["0x93ee18e6d372a2c9bf8c876932e39c4126f80f09"], // burner
        },
        sonic: {
          issued: ["0x6bedE1c6009a78c222D9BDb7974bb67847fdB68c"],
          unreleased: ["0x93EE18e6d372A2C9Bf8c876932E39C4126F80f09"], // burner
        },
        plume_mainnet: {
          issued: ["0x6bedE1c6009a78c222D9BDb7974bb67847fdB68c"],
          unreleased: ["0x71E7c8F2B7D7F6c99E375023916CB3ed9ffC4621"], // burner
        },
        goat: {
          issued: ["0x6bedE1c6009a78c222D9BDb7974bb67847fdB68c"],
          unreleased: ["0x93EE18e6d372A2C9Bf8c876932E39C4126F80f09"], // burner
        },
      },
    },
  },
  {
    id: "254",
    name: "EUR CoinVertible",
    address: "0x5f7827fdeb7c20b443265fc2f40845b715385ff2",
    symbol: "EURCV",
    url: "https://www.sgforge.com/product/coinvertible/",
    description: "EUR CoinVertible (EURCV) is a fully collateralized, regulatory-compliant stablecoin issued by Societe Generale-FORGE to bridge traditional finance and public blockchains",
    mintRedeemDescription: "EURCV is minted and redeemed by authorized institutions through SG-FORGE’s infrastructure, where fiat deposits back on-chain issuance and redemptions trigger equivalent fiat withdrawals",
    onCoinGecko: "true",
    gecko_id: "societe-generale-forge-eurcv",
    cmcId: "32796",
    pegType: "peggedEUR",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: [
      "https://www.sgforge.com/wp-content/uploads/2024/07/Hacken_EURCV_-2024-06-06.pdf"
    ],
    twitter: null,
    wiki: "https://www.sgforge.com/product/coinvertible/",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x5F7827FDeb7c20b443265Fc2F40845B715385Ff2"],
          unreleased: [
            "0xc98Cb9F53e20AFbbeb75Caf6456eD52D5d7903f6",
            "0x7dE0bbdfCd4A6a956F149bEFcca30D6B5Bc5DA69",
          ],
        },
        solana: {
          issued: ["DghpMkatCiUsofbTmid3M3kAbDTPqDwKiYHnudXeGG52"],
          unreleased: [
            "4N1WwAaSukn7YtRKRArA3Ntp4CfcB1nCiqCDGEjEBhEj",
            "5tg4qRdiXJ7XxYd6KK4UnnNvxgHJqfBUygPqZLwSnhnt",
          ],
        },
        ripple: {
          issued: [
            "4555524356000000000000000000000000000000.rUNaS5sqRuxZz6V7rBGhoSaZiVYA3ut4UL",
          ],
        },
        stellar: {
          issued: ["CANKBYNNAYKEZXLB655F2UPNTAZFK5HILZUXL7ZTFR3NF6LKDSVY7KFH"],
        },
      },
    },
  },
  {
    id: "255",
    name: "Aegis YUSD",
    address: "0x4274cd7277c7bb0806bd5fe84b9adae466a8da0a",
    symbol: "YUSD",
    url: "https://app.aegis.im/",
    description: "YUSD is a Bitcoin-backed stablecoin issued by Aegis Protocol, using a delta-neutral funding rate arbitrage strategy to maintain its peg and generate native yield",
    mintRedeemDescription: "YUSD is minted by depositing USDT, USDC, or DAI into the Aegis Mint contract, and redeemed by burning YUSD to withdraw the original collateral",
    onCoinGecko: "true",
    gecko_id: "aegis-yusd",
    cmcId: "35976",
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/aegis_im",
    wiki: "https://docs.aegis.im/",
    doublecounted: true,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x4274cd7277c7bb0806bd5fe84b9adae466a8da0a"],
        },
        bsc: {
          issued: ["0xAB3dBcD9B096C3fF76275038bf58eAC10D22C61f"],
        },
      },
    },
  },
  {
    id: "256",
    name: "Resupply USD",
    address: "0x57ab1e0003f623289cd798b1824be09a793e4bec",
    symbol: "REUSD",
    url: "https://resupply.fi/",
    description: "A decentralized stablecoin backed by stablecoin collateral in yield-bearing Curve Lend and Frax Lend markets, designed to maintain a 1:1 USD peg while sharing earned lending fees with borrowers.",
    mintRedeemDescription: "Deposit crvUSD or frxUSD into a collateralized vault to mint reUSD (minimum 1,000). The borrow rate is half the market’s lending rate, half the risk-free rate, or 2%, whichever is higher. Repaying reUSD unlocks the original collateral.",
    onCoinGecko: "true",
    gecko_id: "resupply-usd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/ResupplyFi",
    wiki: "https://docs.resupply.fi/resupply-protocol/overview",
    doublecounted: true,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x57ab1e0003f623289cd798b1824be09a793e4bec"],
        },
      },
    },
  },
  /*{ not a stablecoin
    id: "257",
    name: "OpenEden TBILL",
    address: "0xdd50c053c096cb04a3e3362e2b622529ec5f2e8a",
    symbol: "TBILL",
    url: "https://app.openeden.com/tbill",
    description: "The TBILL Vault is the world's first smart-contract vault for U.S. Treasury Bills. Earn the U.S. risk-free rate on your stablecoins by minting TBILL tokens, with 24/7 liquidity.",
    mintRedeemDescription: "TBILL tokens are issued out of a bankruptcy remote BVIFSC regulated professional fund and has its underlying portfolio of short-dated Treasury Bills managed by a licensed fund managers complying with strict regulatory and reporting requirements.",
    onCoinGecko: "true",
    gecko_id: "openeden-tbill",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/OpenEden_X",
    wiki: "https://docs.openeden.com/",
    yieldBearing: true,
  },*/
  {
    id: "258",
    name: "A7A5",
    address: "0x6fA0BE17e4beA2fCfA22ef89BF8ac9aab0AB0fc9",
    symbol: "A7A5",
    url: "https://a7a5.io/",
    description: "A7A5 is a RUB stablecoin, fully backed by real assets and integrated into the Tron and Ethereum ecosystem. The main goal is to provide crypto enthusiasts with a safe and transparent tool for trading and passive income",
    mintRedeemDescription: "Users mint A7A5 by depositing Russian rubles through authorized partners with KYC, receiving tokens 1:1 on-chain, and can redeem them by returning A7A5 for an equivalent ruble payout",
    onCoinGecko: "true",
    gecko_id: "a7a5",
    cmcId: "36549",
    pegType: "peggedRUB",
    pegMechanism: "fiat-backed",
    priceSource: "coingecko",
    auditLinks: ["https://docs.a7a5.io/a7a5-token/token-contracts", "https://github.com/user-attachments/files/20347736/Financial.statement.and.reserve.report.as.of.March.31.2025.pdf"],
    twitter: "https://x.com/A7A5official",
    wiki: "https://a7a5.io/transparency",
  },
  {
    id: "259",
    name: "Arche Protocol MSD",
    address: "0x7c9d9f4972072b6ff7dfa48f259688e7286abac9ebd192bbda30fea910139024",
    symbol: "MSD",
    url: "https://www.archeprotocol.xyz/borrow",
    description: "Arche Protocol is the first native decentralized USD-pegged algorithmic stablecoin with exogenous collateral protocol built on the Movement Blockchain",
    mintRedeemDescription: "Users deposit native assets like APT, SUI, and MOVE as collateral, which are staked via liquid staking providers, to mint MSD stablecoins on the Movement chain",
    onCoinGecko: "false",
    gecko_id: null,
    module: "arche-protocol-msd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/archeprotocol",
    wiki: "https://arche-protocol.gitbook.io/arche-protocol",
    deadUrl: true
  },
  {
    id: "260",
    name: "VDollar Finance",
    address: "0x677ddbd918637E5F2c79e164D402454dE7dA8619",
    symbol: "VUSD",
    url: "https://app.vdollar.finance/",
    description: "vUSD is a stablecoin pegged to the US dollar, backed by over-collateralized, interest-generating collateral tokens",
    mintRedeemDescription: "To mint VUSD, the user swaps an acceptable input asset (DAI, USDC, USDT) for newly minted VUSD at a 1:1 ratio, less minting fee (currently zero), in any amount with zero slippage",
    onCoinGecko: "false",
    gecko_id: null,
    module: "vdollar-finance",

    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: null,
    wiki: "https://docs.vdollar.finance/",
    doublecounted: true,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x677ddbd918637E5F2c79e164D402454dE7dA8619"],
        },
        base: {
          bridgedFromETH: ["0x0937876EFd6C4101Be68cd89ba58D5Ecf0d53A64"],
        },
        hemi: {
          bridgedFromETH: ["0x7A06C4AeF988e7925575C50261297a946aD204A8"],
        },
      },
    },
  },
  {
    id: "261",
    name: "Solomon USDv",
    address: "solana:Ex5DaKYMCN6QWFA4n67TmMwsH8MJV68RX6YXTmVM532C",
    symbol: "USDV",
    url: "https://solomonlabs.org/",
    description: "USDv is a Solana-native synthetic stablecoin backed by delta-hedged spot positions and perpetual shorts, designed to maintain a 1:1 USD peg while generating yield for stakers",
    mintRedeemDescription: "Whitelisted users mint USDv by depositing assets that are delta-hedged into market-neutral positions, and redeem USDv by burning it to unlock the underlying collateral through the Solomon protocol",
    onCoinGecko: "true",
    gecko_id: "solomon-usdv",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://docs.solomonlabs.org/audits"],
    twitter: "https://x.com/solomon_labs",
    wiki: "https://docs.solomonlabs.org/",
    yieldBearing: true,
    chainConfig: {
      decimals: 9,
      chains: {
        solana: {
          issued: ["Ex5DaKYMCN6QWFA4n67TmMwsH8MJV68RX6YXTmVM532C"],
        },
      },
    },
  },
  {
    id: "262",
    name: "World Liberty Financial USD",
    address: "bsc:0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d",
    symbol: "USD1",
    url: "https://www.worldlibertyfinancial.com/",
    description: "USD1 is a stablecoin backed by U.S. Treasuries and cash equivalents",
    mintRedeemDescription: "Minting USD1 involves authorized institutions depositing dollars or equivalent assets held in custody, while redemption requires burning USD1 to receive an equivalent amount of underlying reserves through the issuer's managed process",
    onCoinGecko: "true",
    gecko_id: "usd1-wlfi",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/worldlibertyfi",
    wiki: null,
    chainConfig: {
      chains: {
        abcore: {
          issued: ["0x111111d2bf19e43c34263401e0cad979ed1cdb61"],
        },
        bsc: {
          issued: ["0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d"],
        },
        ethereum: {
          issued: ["0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d"],
        },
        tron: {
          issued: ["TPFqcBAaaUMCSVRCqPaQ9QnzKhmuoLR6Rc"],
        },
        solana: {
          issued: ["USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB"],
        },
        aptos: {
          issued: ["0x05fabd1b12e39967a3c24e91b7b8f67719a6dacee74f3c8b9fb7d93e855437d2"],
        },
        plume_mainnet: {
          issued: ["0x111111d2bf19e43C34263401e0CAd979eD1cdb61"],
        },
        monad: {
          issued: ["0x111111d2bf19e43C34263401e0CAd979eD1cdb61"],
        },
      },
    },
  },
  {
    id: "263",
    name: "Hex Trust USDX",
    address: "0x7a486f809c952a6f8dec8cb0ff68173f2b8ed56c",
    symbol: "USDX",
    url: "https://www.htdigitalassets.com/",
    description: "USDX is a stablecoin designed to maintain a stable value relative to the US dollar, backed by at least 1 USD or an asset of equivalent fair value kept in reserve",
    mintRedeemDescription: "Authorized Merchants who wish to mint directly through USDX' issuer are required to undergo a verification process to comply with KYC requirements",
    onCoinGecko: "true",
    gecko_id: "hex-trust-usdx",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/_HTDA",
    wiki: null,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x7a486f809c952a6f8dec8cb0ff68173f2b8ed56c"],
        },
        flare: {
          issued: ["0x4A771Cc1a39FDd8AA08B8EA51F7Fd412e73B3d2B"],
        },
        songbird: {
          issued: ["0x4A771Cc1a39FDd8AA08B8EA51F7Fd412e73B3d2B"],
        },
      },
    },
  },
  {
    id: "264",
    name: "XBANKING USDE",
    address: "solana:8dt9fQhoRKuWCSAsYweG2UMF3rbcG9xzNCTWXXSmdmEi",
    symbol: "USDE",
    url: "https://xbanking.org/usde",
    description: "USDE is a decentralized stablecoin pegged USD 1:1 from XBANKING protocol with a yield mechanism in DeFi",
    mintRedeemDescription: "USDE is minted when users deposit stablecoins like USDT, USDC, or DAI into XBANKING’s smart contract, and it is redeemed by burning USDE to withdraw the underlying stablecoins, which are passively earning yield through DeFi strategies",
    onCoinGecko: "true",
    gecko_id: "xbanking-usde",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/xbanking",
    wiki: null,
    doublecounted: true,
    chainConfig: {
      chains: {
        solana: {
          issued: ["8dt9fQhoRKuWCSAsYweG2UMF3rbcG9xzNCTWXXSmdmEi"],
        },
      },
    },
  },
  {
    id: "265",
    name: "Orki USD",
    address: "swell:0x0000bAa0b1678229863c0A941C1056b83a1955F5",
    symbol: "USDK",
    url: "https://app.orki.finance/",
    description: "USDK is the USD-pegged, overcollateralized and native stablecoin on Swellchain. Issued by Orki Finance and backed by LST/LRT-based assets like swETH and rswETH",
    mintRedeemDescription: "USDK maintains its $1 peg through a market-driven mechanism where borrowers adjust interest rates in response to price fluctuations, and arbitrageurs engage in redemptions when USDK trades below $1. USDK can be redeemed at face value for its underlying collateral, ensuring liquidity and price stability",
    onCoinGecko: "false",
    gecko_id: null,
    module: "orki-usd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/OrkiFi",
    wiki: "https://orki-finance.gitbook.io/orki-finance-docs/products/usdk",
    chainConfig: {
      chains: {
        swellchain: {
          issued: ["0x0000bAa0b1678229863c0A941C1056b83a1955F5"],
        },
      },
    },
  },
  {
    id: "266",
    name: "Plume USD",
    address: "plume_mainnet:0xdddd73f5df1f0dc31373357beac77545dc5a6f3f",
    symbol: "pUSD",
    url: "https://pusd.plume.org/",
    description:
      "Plume USD is the premier stablecoin of the Plume ecosystem, designed to support seamless financial operations within Real World Asset Finance (RWAfi). Plume USD maintains a 1:1 peg with the US dollar, backed by a reserve of the world's most trusted stablecoins.",
    mintRedeemDescription:
      "Plume USD is minted by depositing USDC or USDT into the pUSD vault, and is redeemable 1:1 for USDC at any time, or for USDT at the current USDT/USDC exchange rate.",
    onCoinGecko: "true",
    gecko_id: "plume-usd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/plumenetwork",
    wiki: "https://docs.plume.org/plume/plume-chain/official-tokens/plume-usd",
    doublecounted: true,
    chainConfig: {
      chains: {
        plume_mainnet: {
          issued: ["0xdddD73F5Df1F0DC31373357beAC77545dC5A6f3F"],
        },
        ethereum: {
          issued: ["0xdddD73F5Df1F0DC31373357beAC77545dC5A6f3F"],
        },
      },
    },
  },
  {
    id: "267",
    name: "Mead",
    address: "berachain:0xedb5180661f56077292c92ab40b1ac57a279a396",
    symbol: "MEAD",
    url: "https://www.rootsfi.com/",
    description:
      "MEAD is a Berachain-native stablecoin minted against LP tokens and other yield-bearing assets, allowing users to unlock liquidity without giving up rewards.",
    mintRedeemDescription:
      "MEAD is minted by depositing approved LP tokens or collateral into RootsFi, and is redeemed by repaying the MEAD debt to unlock the original collateral.",
    onCoinGecko: "true",
    gecko_id: "mead-2",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/rootsfi",
    wiki: "https://docs.rootsfi.com/introduction",
    doublecounted: true,

    chainConfig: {
      chains: {
        berachain: {
          issued: ["0xedb5180661f56077292c92ab40b1ac57a279a396"],
        },
      },
    },
  },
  {
    id: "268",
    name: "YU",
    address: "ethereum:0xE868084cf08F3c3db11f4B73a95473762d9463f7",
    symbol: "YU",
    url: "https://www.yala.org/",
    description:
      "Yala Protocol allows users to lock Bitcoin as collateral to mint YU stablecoins. YU serves as both an asset and a tool, connecting Bitcoin with any ecosystem. Users can borrow, earn interest, and gain seamless access to DeFi applications across multiple chains.",
    mintRedeemDescription:
      "Users mint YU by depositing Bitcoin as collateral assets into the Yala Protocol. When the loan is repaid to retrieve the collateral, the paid back YU is burned.",
    onCoinGecko: "true",
    gecko_id: "yu",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/yalaorg",
    wiki: "https://docs.yala.org/user-guide-mainnet/metamint-usdyu",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xE868084cf08F3c3db11f4B73a95473762d9463f7"],
        },
        bsc: {
          issued: ["0xE868084cf08F3c3db11f4B73a95473762d9463f7"],
        },
        base: {
          issued: ["0xE868084cf08F3c3db11f4B73a95473762d9463f7"],
        },
        solana: {
          issued: ["YUYAiJo8KVbnc6Fb6h3MnH2VGND4uGWDH4iLnw7DLEu"],
        },
      },
    },
  },
  {
    id: "269",
    name: "Liquity BOLD",
    address: "0x6440f144b7e50D6a8439336510312d2F54beB01D",
    symbol: "BOLD",
    url: "https://www.liquity.org/bold",
    description:
      `BOLD is the USD-pegged stablecoin issued in Liquity V2. It’s fully decentralized, overcollateralized and backed only by WETH, wstETH and rETH`,
    mintRedeemDescription: "BOLD is minted in Liquity V2 by borrowing against overcollateralized deposits of WETH, wstETH, or rETH, and it can always be redeemed directly for these underlying assets at a 1:1 USD value",
    onCoinGecko: "true",
    gecko_id: "liquity-bold-2",
    module: "liquity-bold",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    auditLinks: null,
    priceSource: "defillama",
    twitter: "https://x.com/LiquityProtocol",
    wiki: "https://docs.liquity.org/v2-documentation/technical-resources",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x6440f144b7e50D6a8439336510312d2F54beB01D"],
        },
        base: {
          bridgedFromETH: ["0x03569CC076654F82679C4BA2124D64774781B01D"],
        },
        arbitrum: {
          bridgedFromETH: ["0x03569CC076654F82679C4BA2124D64774781B01D"],
        },
        optimism: {
          bridgedFromETH: ["0x03569CC076654F82679C4BA2124D64774781B01D"],
        },
        scroll: {
          bridgedFromETH: ["0x03569CC076654F82679C4BA2124D64774781B01D"],
        },
        avax: {
          bridgedFromETH: ["0x03569CC076654F82679C4BA2124D64774781B01D"],
        },
        hyperliquid: {
          bridgedFromETH: ["0x84533b1512A3A23F0c9668D88FDf86FEffdbb11A"],
        },
      },
    },
  },
  // {
  //   id: "270",
  //   name: "Franklin Onchain U.S. Government Money Fund",
  //   address: "stellar:BENJI-GBHNGLLIE3KWGKCHIKMHJ5HVZHYIK7WTBE4QF5PLAKL4CJGSEU7HZIW5",
  //   symbol: "BENJI",
  //   url: "https://www.franklintempleton.com/investments/options/money-market-funds/products/29386/SINGLCLASS/franklin-on-chain-u-s-government-money-fund/FOBXX",
  //   description:
  //     `The fund seeks to provide as high a level of current income as is consistent with the preservation of shareholders' capital and liquidity. The fund also tries to maintain a stable $1 share price.`,
  //   mintRedeemDescription: "Franklin Onchain U.S. Government Money Fund is minted by depositing U.S. government money market funds into the Franklin Onchain U.S. Government Money Fund, and it can always be redeemed directly for these underlying assets at a 1:1 USD value",
  //   onCoinGecko: "false",
  //   gecko_id: "franklin-onchain-u-s-government-money-fund",
  //  module: "franklin-onchain-u-s-government-money-fund",
  //   module: "franklin-onchain-u-s-government-money-fund",
  //   cmcId: null,
  //   pegType: "peggedUSD",
  //   pegMechanism: "fiat-backed",
  //   auditLinks: null,
  //   priceSource: "defillama",
  //   twitter: "https://x.com/FTI_US",
  //   wiki: "https://www.franklintempleton.com/investments/options/money-market-funds/products/29386/SINGLCLASS/franklin-on-chain-u-s-government-money-fund/FOBXX"
  // },
  {
    id: "271",
    name: "Avant USD",
    address: "avax:0x24de8771bc5ddb3362db529fc3358f2df3a0e346",
    symbol: "avUSD",
    url: "https://www.avantprotocol.com",
    description:
      `Avant’s flagship stable value token, minted when users deposit USDC. avUSD can be redeemed for USDC, but receives no yield.`,
    mintRedeemDescription: "Minted when users deposit USDC. avUSD can be redeemed for USDC",
    onCoinGecko: "true",
    gecko_id: "avant-usd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    auditLinks: null,
    priceSource: "defillama",
    twitter: "https://x.com/avantprotocol",
    wiki: "https://docs.avantprotocol.com/overview/core-tokens",
    doublecounted: true,
    chainConfig: {
      chains: {
        avax: {
          issued: ["0x24dE8771bC5DdB3362Db529Fc3358F2df3A0E346"],
        },
        monad: {
          bridgedFromAvax: ["0x0D9D741FE423Cd5419e4BCb6cB2FfA87AFa93bA4"],
        },
      },
    },
  },
  {
    id: "272",
    name: "YLDS",
    address: "provenance:uylds.fcc",
    symbol: "YLDS",
    url: "https://www.figuremarkets.com/c/learn/ylds",
    description:
      `YLDS is a fixed price, daily accrual public debt security native to blockchain. It is the first interest-bearing transferable stablecoin native to a public blockchain, registered with the Securities and Exchange Commission. YLDS can be transferred peer-to-peer and is backed by the same securities that prime money market funds hold.`,
    mintRedeemDescription: "Minted when users purchase YLDS on figuremarkets.com and can be redeemed 1:1 for USD/USDC 24/7.",
    onCoinGecko: "false",
    gecko_id: "ylds",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    auditLinks: null,
    priceSource: "defillama",
    twitter: "https://x.com/figuremarkets",
  },
  {
    id: "273",
    name: "Asymmetry USDaf",
    address: "0x85e30b8b263bc64d94b827ed450f2edfee8579da",
    symbol: "USDaf",
    url: "https://usdaf.asymmetry.finance/",
    description:
      `USDaf is a crypto-backed stablecoin minted via Collateralized Debt Positions (CDPs) on Asymmetry Finance, built using Liquity v2. It allows users to borrow against assets like wBTC, sfrxUSD, and tBTC, with user-defined interest rates and collateral ratios.`,
    mintRedeemDescription: "Minted when users lock supported collateral into a USDaf CDP on Asymmetry and can be redeemed by repaying the borrowed amount plus accrued interest.",
    onCoinGecko: "true",
    gecko_id: "asymmetry-usdaf",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    auditLinks: ["https://docs.asymmetry.finance/security/audits-bug-bounties"],
    priceSource: "defillama",
    twitter: "https://x.com/asymmetryfin",
    wiki: "https://docs.asymmetry.finance/usdaf-stablecoin/what-is-usdaf",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x85e30b8b263bc64d94b827ed450f2edfee8579da"],
        },
      },
    },
  },
  {
    id: "274",
    name: "Quantoz EURQ",
    address: "algorand:2768422954",
    symbol: "EURQ",
    url: "https://quantozpay.com/",
    description:
      "The Quantoz EURQ is a stablecoin pegged 1:1 to the euro. The EURQ is issued by Quantoz Payments BV, an Electronic Money Institution under supervision of the Dutch Central Bank (DNB). The EURQ is designed to be Micar compliant and its whitepaper as Electronic Money Token (EMT) has been submitted to the Dutch Financial Authorities (AFM). The EURQs are distributed through Authorized Participants.",
    mintRedeemDescription:
      "All funded EURQ can be redeemed 1:1 to the whitelisted bank account of the EURQ users",
    onCoinGecko: false,
    gecko_id: "quantoz-eurq",
    cmcId: null,
    pegType: "peggedEUR",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/Quantoz",
    wiki: null,
    chainConfig: {
      decimals: 6,
      chains: {
        ethereum: {
          issued: ["0x8df723295214ea6f21026eeeb4382d475f146f9f"],
        },
        polygon: {
          issued: ["0xd571edb2ef29df10fcd6200fd6d0ed2389983db3"],
        },
        ripple: {
          issued: [
            "4555525100000000000000000000000000000000.rDk1xiArDMjDqnrR2yWypwQAKg4mKnQYvs",
          ],
        },
        algorand: {
          issued: ["2768422954"],
          unreleased: [
            "3PJ3E3D6XI7YWMJAUX6WDCHWZ4GC2WHTAQIWJBYVJ326LM2I6NSMSLGCDY",
          ],
        },
      },
    },
  },
  {
    id: "275",
    name: "Quantoz USDQ",
    address: "algorand:2768603795",
    symbol: "USDQ",
    url: "https://quantozpay.com/",
    description:
      "The Quantoz USDQ is a stablecoin pegged 1:1 to the dollar. The USDQ is issued by Quantoz Payments BV, an Electronic Money Institution under supervision of the Dutch Central Bank (DNB). The USDQ is designed to be Micar compliant and its whitepaper as Electronic Money Token (EMT) has been submitted to the Dutch Financial Authorities (AFM). The USDQs are distributed through Authorized Participants.",
    mintRedeemDescription:
      "All funded USDQ can be redeemed 1:1 to the whitelisted bank account of the USDQ users",
    onCoinGecko: false,
    gecko_id: "quantoz-usdq",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/Quantoz",
    wiki: null,
    chainConfig: {
      decimals: 6,
      chains: {
        ethereum: {
          issued: ["0xc83e27f270cce0a3a3a29521173a83f402c1768b"],
        },
        polygon: {
          issued: ["0xb291996477504506bf5f583102b5b5ea5d1e40e0"],
        },
        ripple: {
          issued: [
            "5553445100000000000000000000000000000000.rDk1xiArDMjDqnrR2yWypwQAKg4mKnQYvs",
          ],
        },
        algorand: {
          issued: ["2768603795"],
          unreleased: [
            "3PJ3E3D6XI7YWMJAUX6WDCHWZ4GC2WHTAQIWJBYVJ326LM2I6NSMSLGCDY",
          ],
        },
      },
    },
  },
  {
    id: "276",
    name: "Hyperstable USD",
    address: "hyperliquid:0x8ff0dd9f9c40a0d76ef1bcfaf5f98c1610c74bd8",
    symbol: "USH",
    url: "https://app.hyperstable.xyz/",
    description:
      "USH is an over-collateralized, crypto-backed stablecoin designed to maintain a 1:1 peg to the US dollar, with decentralized, non-custodial vaults and onchain interest rate adjustments to ensure stability and resilience",
    mintRedeemDescription:
      "To mint the USH stablecoin, users deposit one of the supported collateral types into the designated vault. Each vault has its own minimum health factor requirement and interest rate",
    onCoinGecko: true,
    gecko_id: "hyperstable",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://docs.hyperstable.xyz/docs/security/audits/"],
    twitter: "https://x.com/hyperstableX",
    wiki: "https://docs.hyperstable.xyz/docs/protocol/ush/",
    chainConfig: {
      chains: {
        hyperliquid: {
          issued: ["0x8ff0dd9f9c40a0d76ef1bcfaf5f98c1610c74bd8"],
        },
      },
    },
  },
  {
    id: "277",
    name: "SMARDEX USDN",
    address: "0xde17a000ba631c5d7c2bd9fb692efea52d90dee2",
    symbol: "USDN",
    url: "https://smardex.io/usdn/vault",
    description: "The USDN token is the first synthetic U.S. dollar backed by a structured product utilizing a delta-Neutral strategy. Unlike traditional stablecoins, whose value is guaranteed by centralized entities, the value of a synthetic dollar is determined by a purely mathematical financial process.",
    mintRedeemDescription: "Deposit Lido token (WSTETH) in USDN Vault allows to Mint USDN tokens and profit from its yield. Redeem Lido burns USDN",
    onCoinGecko: "true",
    gecko_id: "smardex-usdn",
    cmcId: "35672",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://docs.smardex.io/ultimate-synthetic-delta-neutral/audits"],
    twitter: "https://x.com/SmarDex",
    wiki: null,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xde17a000ba631c5d7c2bd9fb692efea52d90dee2"],
        },
      },
    },
  },
  {
    id: "278",
    name: "WEUSD",
    address: "movement:0xed805e77c40d7e6ac5cd3e67514c485176621a2aa21e860cd515121d44a2f83d",
    symbol: "WEUSD",
    coin_icon: "https://raw.githubusercontent.com/pipimove/logo/refs/heads/main/coin_weusd.ico",
    url: "https://picwe.org",
    description:
      "$WEUSD is a key component of PicWe’s ecosystem, designed to provide stability and facilitate efficient, reliable cross-chain transactions. As a native decentralized stablecoin, $WEUSD is created on-chain via smart contracts and plays a critical role in PicWe’s Omni-chain asset settlement layer.",
    mintRedeemDescription:
      "Users can mint WEUSD by depositing USDT/USDC assets.",
    onCoinGecko: "false",
    gecko_id: "weusd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://drive.google.com/file/d/12APmNFf_dy2HBnDof_u0mM03_5vKSPWN/view?usp=sharing"],
    twitter: "https://x.com/PicWeGlobal",
    wiki: "https://picwe.gitbook.io/picwe",
    doublecounted: true
  },
  {
    id: "279",
    name: "Parabol USD",
    address: "base:0x1f94d6A61973eDf53252b9E61c6250F303957b9D",
    symbol: "paraUSD",
    url: "https://parabol.fi/",
    description:
      "Parabol USD (paraUSD) is a fiat-backed stablecoin built on the Parabol Protocol, offering a revolutionary approach to yield generation in the stablecoin ecosystem. The protocol enables savers to access risk-free yields as a baseline through its innovative Reserve Stability Pool (RSP). Users can lend their paraUSD for specific time periods (like 28-day notes), earning both fixed income based on T-Bill rates and additional floating income derived from overnight repo market performance. Treasury departments can optimize cash management while maintaining security, and developers can easily embed these institutional-grade yields into their applications through Parabol's comprehensive APIs and SDKs. All positions are represented as NFTs that can be transferred across markets.",
    mintRedeemDescription:
      "paraUSD can be obtained in three ways: (1) minting it directly with fiat after completing Know Your Business (KYB) or Know Your Customer (KYC) verification; (2) trading on centralized exchanges; or (3) trading on decentralized exchanges.",
    onCoinGecko: true,
    gecko_id: "parabol-usd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: ["https://github.com/Parabol-Finance/parabol-protocol-contracts/blob/main/audits/trailofbits-audit-250124.pdf", "https://github.com/Parabol-Finance/parabol-protocol-contracts/blob/main/audits/trailofbits-audit-240514.pdf"],
    twitter: "https://x.com/parabolfi",
    wiki: "https://docs.parabol.fi/",
    chainConfig: {
      chains: {
        base: {
          issued: ["0x1f94d6A61973eDf53252b9E61c6250F303957b9D"],
        },
      },
    },
  },
  {
    id: "280",
    name: "Tether CNH",
    address: "0x6e109e9dd7fa1a58bc3eff667e8e41fc3cc07aef",
    symbol: "CNHT",
    url: "https://tether.to/en/",
    description:
      "All Tether tokens are pegged at 1-to-1 with a matching fiat currency and are backed 100% by Tether’s Reserves. Information about Tether Tokens in circulation is typically published daily.",
    mintRedeemDescription:
      "Redeem 1:1",
    onCoinGecko: true,
    gecko_id: "cnh-tether",
    cmcId: null,
    pegType: "peggedCNY",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    twitter: "https://x.com/Tether_to",
    wiki: "https://tether.to/en/",
  },
  {
    id: "281",
    name: "Mexican Peso Tether",
    address: "0xed03ed872159e199065401b6d0d487d78d9464aa",
    symbol: "MXNT",
    url: "https://tether.to/en/",
    description:
      "All Tether tokens are pegged at 1-to-1 with a matching fiat currency and are backed 100% by Tether’s Reserves. Information about Tether Tokens in circulation is typically published daily.",
    mintRedeemDescription:
      "Redeem 1:1",
    onCoinGecko: true,
    gecko_id: "mexican-peso-tether",
    cmcId: null,
    pegType: "peggedMXN",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    twitter: "https://x.com/Tether_to",
    wiki: "https://tether.to/en/",
  },
  {
    id: "282",
    name: "Noble Dollar",
    address: null,
    symbol: "USDN",
    url: "https://dollar.noble.xyz/",
    description:
      "Noble Dollar (USDN) is a yield-bearing stablecoin backed by U.S. Treasuries and built on the M^0 protocol",
    mintRedeemDescription:
      "Users can mint or redeem USDN by depositing or withdrawing USDC via the Noble Express app using supported chains like Ethereum, Solana, or Cosmos",
    onCoinGecko: true,
    gecko_id: "noble-dollar-usdn",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    twitter: "https://x.com/noble_xyz/",
    wiki: "https://dollar.noble.xyz/how-noble-dollar-works",
  },
  {
    id: "283",
    name: "Unitas",
    address: "solana:9ckR7pPPvyPadACDTzLwK2ZAEeUJ3qGSnzPs8bVaHrSy",
    symbol: "USDU",
    url: "https://unitas.so/",
    description: "Unitas is a decentralized, yield-bearing stablecoin protocol built for the next generation of finance. It issues stablecoins that earn yield natively — no reliance on traditional banks. Powered by Solana, it's fast, scalable, and censorship-resistant",
    mintRedeemDescription: "Minting and redemption are available only to users who have successfully completed our KYC/KYB process. We provide real-time quotes for both actions, and counterparties can finalize their mint or redeem requests by interacting with our API using the quoted terms.",
    onCoinGecko: true,
    gecko_id: "usdu",
    module: "unitas",

    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    twitter: "https://x.com/UnitasLabs",
    wiki: "https://docs.unitas.so/",
    doublecounted: true
  },
  {
    id: "284",
    name: "MNEE USD",
    address: "0x8ccedbae4916b79da7f3f612efb2eb93a2bfd6cf",
    symbol: "MNEE",
    url: "https://www.mnee.io/",
    description: "MNEE is revolutionizing the way we move money. It's the fastest, most scalable, lowest-fee fully regulated stablecoin on the market.",
    mintRedeemDescription: "MNEE is fully backed 1‑for‑1 by U.S. dollars. Reserves are held in regulated financial institutions and are regularly audited by independent third parties to ensure full collateralization.",
    onCoinGecko: true,
    gecko_id: "mnee-usd-stablecoin",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    twitter: "https://x.com/MNEE_cash",
    wiki: "https://www.mnee.io/faq",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x8ccedbae4916b79da7f3f612efb2eb93a2bfd6cf"],
        },
      },
    },
  },
  {
    id: "285",
    name: "Good Game US Dollar",
    address: "polygon:0xFFFFFF9936BD58a008855b0812B44D2c8dffE2aA",
    symbol: "GGUSD",
    url: "https://fsl.com/ggusd",
    description: "GGUSD is a USD-pegged stablecoin developed with Agora (backed by VanEck) and secured by U.S. Treasuries. It combines stability with on-chain rewards - becoming the first flexible stablecoin to pay yield with no staking or lockups. As the native currency of 2184, GGUSD powers purchases, rewards, trading, real-world spending via the GMT Pay Card, and earns daily yield. Live on Polygon and BNB, it delivers an industry-leading APY for FSL ID holders.",
    mintRedeemDescription: "All users can 1:1 mint GGUSD by depositting AUSD on Polygon",
    onCoinGecko: true,
    gecko_id: "good-game-us-dollar",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    twitter: "https://x.com/fslweb3",
    wiki: "https://fsl.com/ggusd",
    doublecounted: true,
    chainConfig: {
      decimals: 6,
      chains: {
        polygon: {
          issued: ["0xFFFFFF9936BD58a008855b0812B44D2c8dffE2aA"],
        },
        bsc: {
          bridgedFromPolygon: ["0xFFFFFF9936BD58a008855b0812B44D2c8dffE2aA"],
        },
        solana: {
          bridgedFromPolygon: ["GGUSDyBUPFg5RrgWwqEqhXoha85iYGs6cL57SyK4G2Y7"],
        },
      },
    },
  },
  {
    id: "286",
    name: "Global Dollar",
    address: "ink:0xe343167631d89B6Ffc58B88d6b7fB0228795491D",
    symbol: "USDG",
    url: "https://globaldollar.com/",
    description: "Global Dollar (USDG) is a single currency stablecoin pegged to the US dollar that is regulated under the Monetary Authority of Singapore (MAS). USDG is issued by Paxos Digital Singapore (PDS) and will always be fully redeemable from Paxos on a one-to-one basis for US dollars.",
    mintRedeemDescription: "KYC'ed users can mint and redeem USDG through paxos dashboard or through the Paxos API. USDG is redeemable 1:1 for US dollars.",
    onCoinGecko: true,
    gecko_id: "global-dollar",
    cmcId: "33793",
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "coingecko",
    twitter: "https://x.com/global_dollar",
    wiki: "https://globaldollar.com/global-dollar",
    bridgeConfig: {
      lzConfig: {
        symbols: ["USDG"],
      }
    },
    chainConfig: {
      decimals: 6,
      chains: {
        ethereum: {
          issued: ["0xe343167631d89B6Ffc58B88d6b7fB0228795491D"],
        },
        solana: {
          issued: ["2u1tszSeqZ3qBWF3uNGPFc8TzMk2tdiwknnRMWGWjGWH"],
        },
        ink: {
          bridgedFromETH: ["0xe343167631d89B6Ffc58B88d6b7fB0228795491D"],
        },
        xlayer: {
          issued: ["0x4ae46a509f6b1d9056937ba4500cb143933d2dc8"],
        },
        robinhood: {
          issued: ["0x5fc5360d0400a0fd4f2af552add042d716f1d168"],
        },
      },
    },
  },
  {
    id: "287",
    name: "Nerite USND",
    address: "arbitrum:0x4ecf61a6c2FaB8A047CEB3B3B263B401763e9D49",
    symbol: "USND",
    url: "https://app.nerite.org/",
    description: "USND is an over-collateralized, governance-minimized stablecoin native to Arbitrum and fully backed by crypto collateral. USND also supports token streaming via Superfluid to enable real-time yield distribution.",
    mintRedeemDescription: "Users open vaults (“troves”) and deposit accepted collateral to mint USND up to their chosen collateral ratio. To unlock collateral, borrowers repay and burn USND, or anyone can redeem USND directly for $1 of the lowest-rate collateral, ensuring the peg.",
    onCoinGecko: false,
    gecko_id: "us-nerite-dollar",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    twitter: "https://x.com/neriteorg",
    wiki: "https://docs.nerite.org/",
    chainConfig: {
      chains: {
        arbitrum: {
          issued: ["0x4ecf61a6c2FaB8A047CEB3B3B263B401763e9D49"],
        },
      },
    },
  },
  {
    id: "288",
    name: "EBUSD",
    address: "0x09fD37d9AA613789c517e76DF1c53aEce2b60Df4",
    symbol: "EBUSD",
    url: "https://ebisu.money/",
    description: "Ebisu Money is a stablecoin credit market on Ethereum where users can mint ebUSD by depositing collateral and earn yield by providing ebUSD liquidity. The protocol features market-driven interest rates and a liquidation-backed stability mechanism to maintain solvency and capital efficiency.",
    mintRedeemDescription: "Users mint ebUSD by opening a vault and depositing supported collateral. ebUSD can be redeemed by repaying debt and reclaiming collateral, or via redemptions that exchange ebUSD for collateral from the lowest-rate vaults.",
    onCoinGecko: true,
    gecko_id: "ebusd-stablecoin",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    twitter: "https://x.com/Ebisu_Finance",
    wiki: "https://ebisu.gitbook.io/ebisu-money",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x09fD37d9AA613789c517e76DF1c53aEce2b60Df4"],
        },
        plasma: {
          issued: ["0xef7b1a03e0897c33b63159e38d779e3970c0e2fc"],
        },
      },
    },
  },
  {
    id: "289",
    name: "XSGD",
    address: "0x70e8de73ce538da2beed35d14187f6959a8eca96",
    symbol: "XSGD",
    url: "https://www.straitsx.com/",
    description: "XSGD is the StraitsX digital Singapore Dollar, designed to revolutionise money transfers across the region. XSGD is fully backed by reserve assets and is always redeemable on a 1:1 basis with the Singapore Dollar.",
    mintRedeemDescription: "Verified StraitsX users can access the StraitsX platform to set up their StraitsX Mint function and directly mint XSGD into their preferred blockchain address by sending Singapore dollars to the bank account number available in the Mint tab. It can always be redeemed at a 1:1 ratio with SGD on the StraitsX platform.",
    onCoinGecko: true,
    gecko_id: "xsgd",
    cmcId: "8489",
    pegType: "peggedSGD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    twitter: "https://x.com/straitsx",
    wiki: "https://www.straitsx.com/xsgd",
  },
  {
    id: "290",
    name: "StraitsX XUSD",
    address: "0xc08e7e23c235073c6807c2efe7021304cb7c2815",
    symbol: "XUSD",
    url: "https://www.straitsx.com/",
    description: "XUSD is the StraitsX digital US Dollar, designed to revolutionise global payments with stability, transparency, and seamless integration for consumers and businesses",
    mintRedeemDescription: "Verified StraitsX users can access the StraitsX platform to set up their StraitsX Mint function and directly mint XUSD into their preferred blockchain address by sending US dollars to the bank account number available in the Mint tab. It can always be redeemed at a 1:1 ratio with USD on the StraitsX platform.",
    onCoinGecko: true,
    gecko_id: "straitsx-xusd",
    cmcId: "32372",
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    twitter: "https://x.com/straitsx",
    wiki: "https://www.straitsx.com/xusd",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xC08e7E23C235073C6807C2EFE7021304cb7c2815"],
        },
        bsc: {
          issued: ["0xF81aC2E1A0373ddE1BcE01E2Fe694a9b7E3bfcB9"],
        },
      },
    },
  },
  {
    id: "291",
    name: "Parallel USDp",
    address: "0x9B3a8f7CEC208e247d97dEE13313690977e24459",
    symbol: "USDp",
    url: "https://app.parallel.best/",
    description:
      "Parallel's Dollar stablecoin (USDp) is a USD stablecoin supported by a robust Price Stability Module. USDp is over-collateralized, decentralized, transparent, generates yield, and offers competitive pricing for on-chain USD",
    mintRedeemDescription:
      "Users can get USDp, by swapping their assets on the Parallel app or a DEX.",
    onCoinGecko: false,
    gecko_id: null,
    module: "parallel-usdp",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://github.com/parallel-protocol/parrallel-tokens/blob/main/docs/audits/Bailsec%20-%20Parallel%20Protocol%20-%20V3%20Core%20-%20Final%20Report.pdf"],
    twitter: "https://x.com/ParallelMoney",
    wiki: "https://docs.parallel.best/",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x9B3a8f7CEC208e247d97dEE13313690977e24459"],
        },
        avax: {
          issued: ["0x9eE1963f05553eF838604Dd39403be21ceF26AA4"],
        },
        arbitrum: {
          issued: ["0x76A9A0062ec6712b99B4f63bD2b4270185759dd5"],
        },
        base: {
          issued: ["0x76A9A0062ec6712b99B4f63bD2b4270185759dd5"],
        },
        bsc: {
          issued: ["0x048C4e07D170eEdEE8772cA76AEE1C4e2D133d5c"],
        },
        ink: {
          issued: ["0x9eE1963f05553eF838604Dd39403be21ceF26AA4"],
        },
        optimism: {
          issued: ["0x90337e484B1Cb02132fc150d3Afa262147348545"],
        },
        xdai: {
          issued: ["0x9eE1963f05553eF838604Dd39403be21ceF26AA4"],
        },
        hyperliquid: {
          issued: ["0xBE65F0F410A72BeC163dC65d46c83699e957D588"],
        },
        sonic: {
          issued: ["0x08417cdb7F52a5021bB4eb6E0deAf3f295c3f182"],
        },
        polygon: {
          issued: ["0x1250304F66404cd153fA39388DDCDAec7E0f1707"],
        },
        sei: {
          issued: ["0x048C4e07D170eEdEE8772cA76AEE1C4e2D133d5c"],
        },
        berachain: {
          issued: ["0x9eE1963f05553eF838604Dd39403be21ceF26AA4"],
        },
        scroll: {
          issued: ["0x9eE1963f05553eF838604Dd39403be21ceF26AA4"],
        },
        unichain: {
          issued: ["0x9eE1963f05553eF838604Dd39403be21ceF26AA4"],
        },
        tac: {
          issued: ["0x4DeF531c3060686948f00EcC7504f2E0b71EDa14"],
        },
        hemi: {
          issued: ["0x8fCf9118fdD359f6277cDd143c2Da206e64140F3"],
        },
        wc: {
          issued: ["0x8fCf9118fdD359f6277cDd143c2Da206e64140F3"],
        },
        fraxtal: {
          issued: ["0x8fCf9118fdD359f6277cDd143c2Da206e64140F3"],
        },
        katana: {
          issued: ["0x8fCf9118fdD359f6277cDd143c2Da206e64140F3"],
        },
        plume_mainnet: {
          issued: ["0x8fCf9118fdD359f6277cDd143c2Da206e64140F3"],
        },
        plasma: {
          issued: ["0xC2f8B5d893217462aE9c9879c9285A5a3AAbcb8F"],
        },
        xlayer: {
          issued: ["0x8fCf9118fdD359f6277cDd143c2Da206e64140F3"],
        },
        linea: {
          issued: ["0x8fCf9118fdD359f6277cDd143c2Da206e64140F3"],
        },
      },
    },
  },
  {
    id: "292",
    name: "VNX British Pound",
    address: "solana:5H4voZhzySsVvwVYDAKku8MZGuYBC7cXaBKDPW4YHWW1",
    symbol: "VGBP",
    url: "https://vnx.io/british-pound",
    description:
      "VGBP (VNX British Pound) is a fully regulated stablecoin referencing pound sterling. The token is issued by VNX Global Ltd., which is licensed to conduct digital asset business activities under a Class M digital assets business licence issued by the Bermuda Monetary Authority. Each VGBP token is designed to be fully backed 1:1 by pound sterling and redeemable against the underlying pound sterling reserve.",
    mintRedeemDescription:
      "VGBP is minted upon confirmation of fiat funding of the segregated fiduciary account, and redeemed at par at any time per customer instruction. The flow supports two execution paths on the mint side (new issuance against new reserve, or proprietary-trade fill from VNX's liquidity pool) and two paths on the redeem side (direct cancellation against reserves, or buyback into the liquidity pool). An optional crypto-conversion leg is available on either side via VNX's external regulated provider. This page is the institutional-track summary; see Developer Track for sequence-level integration.",
    onCoinGecko: "true",
    gecko_id: "vnx-british-pound",
    cmcId: "36339",
    pegType: "peggedGBP",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: "https://vnx.li/transparency/",
    twitter: "https://twitter.com/VNX_Global",
    wiki: "https://vnx.gitbook.io/vnx-global",
    chainConfig: {
      chains: {
        solana: {
          issued: ["5H4voZhzySsVvwVYDAKku8MZGuYBC7cXaBKDPW4YHWW1"],
        },
        celo: {
          issued: ["0x7ae4265ecfc1f31bc0e112dfcfe3d78e01f4bb7f"],
        },
        base: {
          issued: ["0xaeb4bb7debd1e5e82266f7c3b5cff56b3a7bf411"],
        },
        ethereum: {
          issued: ["0x34C9C643Becd939c950bB9F141E35777559817CB"],
        },
      },
    },
  },
  {
    id: "293",
    name: "Sigma Money bnbUSD",
    address: "bsc:0x5519a479Da8Ce3Af7f373c16f14870BbeaFDa265",
    symbol: "BNBUSD",
    url: "https://sigma.money/",
    description:
      "bnbUSD is redefining what a stablecoin can be on BNB Chain. Born from the foundation of true decentralization, bnbUSD offers a powerful alternative to centralized stablecoins — combining a robust peg, built-in yield, and zero-slippage swaps for a seamless DeFi experience. Its elegant economic architecture ensures that liquidity scales naturally as users tap into the growing utility of BNB-native assets. Designed for composability and yield generation, bnbUSD isn’t just another stablecoin — it’s the future of stable value on BNB Chain.",
    mintRedeemDescription:
      "Users are able to mint and redeem with BNB, slisBNB, WBNB and more.",
    onCoinGecko: "true",
    gecko_id: "sigma-bnb-usd",
    module: "bnbusd",

    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: "https://docs.sigma.money/risk-management/audit-reports",
    twitter: "https://x.com/sigmadotmoney",
    wiki: "https://docs.sigma.money/",
    chainConfig: {
      chains: {
        bsc: {
          issued: ["0x5519a479Da8Ce3Af7f373c16f14870BbeaFDa265"],
        },
      },
    },
  },
  {
    id: "294",
    name: "NonDollar", // previous name: Autonomint
    address: "base:0x4e44fB5c61a89CF44a9080AB987335889FCaA6bd",
    symbol: "USDA+",
    url: "https://nondollar.life/",
    description:
      "NonDollar has created a new mechanism to drastically reduce the costs incurred to hedge any asset. We do this with a combination of stablecoin and on-chain credit default swaps. ",
    mintRedeemDescription:
      "Anyone looking to hedge can deposit ETH & ETH LRT as collateral to mint USDA+, a stablecoin soft pegged to US Dollar.",
    onCoinGecko: "false",
    gecko_id: null,
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: "https://docs.nondollar.life/autonomint/technical-docs/audits-and-contract-deployment",
    twitter: "https://x.com/autonomint",
    wiki: "https://docs.nondollar.life/autonomint",
    module: "autonomint-usda+",

    chainConfig: {
      chains: {
        base: {
          issued: ["0x4e44fB5c61a89CF44a9080AB987335889FCaA6bd"],
        },
        optimism: {
          issued: ["0x4e44fB5c61a89CF44a9080AB987335889FCaA6bd"],
        },
      },
    },
  },
  {
    id: "295",
    name: "Asymmetry USDaf V2",
    address: "0x9cf12ccd6020b6888e4d4c4e4c7aca33c1eb91f8",
    symbol: "USDaf",
    url: "https://www.asymmetry.finance/usdaf",
    description:
      "USDaf is an immutable, decentralized CDP stablecoin built on Liquity v2",
    mintRedeemDescription:
      "Users can borrow at custom fixed interest rates using BTC and yield-bearing stablecoins, or hold USDaf to earn on stablecoins.",
    onCoinGecko: "true",
    gecko_id: "asymmetry-usdaf-2",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: "https://docs.asymmetry.finance/security/audits-bug-bounties",
    twitter: "https://x.com/asymmetryfin",
    wiki: "https://docs.asymmetry.finance/usdaf-stablecoin/what-is-usdaf",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x9cf12ccd6020b6888e4d4c4e4c7aca33c1eb91f8"],
        },
      },
    },
  },
  {
    id: "296",
    name: "Cap cUSD",
    address: "0xcCcc62962d17b8914c62D74FfB843d73B2a3cccC",
    symbol: "CUSD",
    url: "https://cap.app/mint",
    description:
      "Cap is a stablecoin protocol that provides credible financial guarantees via two products: the dollar-denominated cUSD and the yield-bearing stcUSD",
    mintRedeemDescription:
      "Users deposit reserve assets to mint cUSD at oracle value. cUSD's reserve is backed by blue chip stablecoins such as USDC, USDT, pyUSD, BUIDL, and BENJI, i.e. issued by regulated institutions with transparent attestations. It is 1:1 redeemable for any of the available reserve assets.",
    onCoinGecko: "true",
    gecko_id: "cap-usd",
    module: "cap-cusd",

    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: "https://docs.cap.app/resources/audits",
    twitter: "https://x.com/CapApp",
    wiki: "https://docs.cap.app/",
    doublecounted: true,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xcCcc62962d17b8914c62D74FfB843d73B2a3cccC"],
        },
        megaeth: {
          issued: ["0xcCcc62962d17b8914c62D74FfB843d73B2a3cccC"],
        },
        tempo: {
          issued: ["0x20c0000000000000000000000520792dcccccccc"],
        },
      },
    },
  },
  {
    id: "297",
    name: "Main Street USD",
    address: "sonic:0xE5Fb2Ed6832deF99ddE57C0b9d9A56537C89121D",
    symbol: "MSUSD",
    url: "https://mainstreet.finance/mint",
    description:
      "Yield-bearing synthetic dollar - democratizing access to the options volatility arbitrage",
    mintRedeemDescription:
      "msUSD can be minted at https://mainstreet.finance/mint by depositing USDC. The depositor will be minted 1:1 msUSD. Redemptions can occur on the same UI.",
    onCoinGecko: "true",
    gecko_id: "main-street-usd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: "https://mainstreet-finance.gitbook.io/mainstreet.finance/audits/watchpug-security-audit",
    twitter: "https://x.com/Main_St_Finance",
    wiki: "https://mainstreet-finance.gitbook.io/mainstreet.finance",
    doublecounted: true,
    chainConfig: {
      chains: {
        sonic: {
          bridgedFromETH: ["0xE5Fb2Ed6832deF99ddE57C0b9d9A56537C89121D"],
        },
        ethereum: {
          issued: ["0x4ba01f22827018b4772CD326C7627FB4956A7C00"],
        },
      },
    },
  },
  {
    id: "298",
    name: "infiniFi USD",
    address: "0x48f9e38f3070ad8945dfeae3fa70987722e3d89c",
    symbol: "IUSD",
    url: "https://infinifi.xyz/",
    description:
      "iUSD is a ERC20 - represents a users deposited value into the infiniFi protocol",
    mintRedeemDescription:
      "infiniFi USD (iUSD) can be minted and redeemed for USDC 1 for 1. There is no mint or redemption fee. In the case of lack of liquid reserves duration asset backing fills up the redemption queue as those assets reach maturity",
    onCoinGecko: "true",
    gecko_id: "infinifi-usd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: "https://docs.infinifi.xyz/audits",
    twitter: "https://x.com/infiniFi_",
    wiki: "https://docs.infinifi.xyz/infiniFi-Docs-1ed44c414f36805a8642e0dcdabae970",
    doublecounted: true,
    chainConfig: {
      decimals: 18,
      chains: {
        ethereum: {
          issued: ["0x48f9e38f3070AD8945DFEae3FA70987722E3D89c"],
        },
        tempo: {
          issued: ["0x20c000000000000000000000ab02d39df30bd17e"],
        },
      },
    },
  },
  {
    id: "299",
    name: "PHT Stablecoin",
    address: "0xbe370ad45d44eb45174c4ec60b88839fef32c077",
    symbol: "PHT",
    url: "https://www.apacx.io/PHT",
    description: "PHT is a stablecoin pegged to the Philippine Peso (PHP)",
    mintRedeemDescription: "PHT Stablecoin can be minted by depositing USDC or USDT as collateral. After minting, users can repay the borrowed PHT with Stability Fees incurred, and withdraw their collaterals.",
    onCoinGecko: "true",
    gecko_id: "pht-stablecoin",
    cmcId: null,
    pegType: "peggedPHP",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: "https://docs.apacx.io/technical-references/smart-contract-audits",
    twitter: "https://x.com/apacx_io",
    wiki: "https://docs.apacx.io/",
    doublecounted: true,
    chainConfig: {
      decimals: 18,
      chains: {
        ethereum: {
          issued: ["0xBe370Ad45D44eB45174C4Ec60b88839feF32C077"],
        },
        polygon: {
          bridgedFromETH: ["0xe75220cB014Dfb2D354bb59be26d7458bB8d0706"],
        },
        tron: {
          bridgedFromETH: ["TXdN5fvFjCdqjWJRvWmBzSRLBN7JLYmmrs"],
        },
      },
    },
  },
  {
    id: "300",
    name: "Bilira",
    address: "0x2c537e5624e4af88a7ae4060c022609376c8d0eb",
    symbol: "TRYB",
    url: "https://bilira.site",
    description: "TRYB is a stablecoin pegged to the Turkish Lira (TRY)",
    mintRedeemDescription: "TRYB can be converted to Turkish Lira at a 1:1 ratio at any time. Its reserves are securely held in Turkish bank accounts, with audit reports regularly released to ensure transparency.",
    onCoinGecko: "true",
    gecko_id: "bilira",
    cmcId: "5181",
    pegType: "peggedTRY",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: "https://www.bilira.co/en/audit-reports",
    twitter: "https://x.com/BiLira_Kripto",
    wiki: "https://iq.wiki/wiki/bilira",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x2c537e5624e4af88a7ae4060c022609376c8d0eb"],
          unreleased: ["0xd03846601b6b77965693741aAF296491Bc10A0EB"],
        },
        base: {
          issued: ["0xfb8718a69aed7726afb3f04d2bd4bfde1bdcb294"],
        },
        avax: {
          issued: ["0x564a341df6c126f90cf3ecb92120fd7190acb401"],
        },
        bsc: {
          issued: ["0xc1fdbed7dac39cae2ccc0748f7a80dc446f6a594"],
        },
        polygon: {
          issued: ["0x4fb71290ac171e1d144f7221d882becac7196eb5"],
        },
        solana: {
          issued: ["A94X2fRy3wydNShU4dRaDyap2UuoeWJGWyATtyp61WZf"],
        },
        plasma: {
          issued: ["0x90729a45948c3078890Bc80F2a4e7870A2Ea4C5E"],
        },
      },
    },
  },
  {
    id: "301",
    name: "Jigsaw USD",
    address: "0x000000096cb3d4007fc2b79b935c4540c5c2d745",
    symbol: "JUSD",
    url: "https://jigsaw.finance/",
    description: "jUSD is Jigsaw's overcollateralized stablecoin, which allows users to access liquidity while keeping their collateral actively deployed",
    mintRedeemDescription: "Users mint jUSD by depositing overcollateralized assets into Jigsaw and borrow against them fee-free, with dynamic collateral reallocation; redemption requires repaying jUSD to unlock the collateral",
    onCoinGecko: "true",
    gecko_id: "jigsaw-usd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: "https://jigsaw.gitbook.io/jigsaw-protocol/security/smart-contract-audits",
    twitter: "https://x.com/jigsawdefi",
    wiki: "https://jigsaw.gitbook.io/jigsaw-protocol",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x000000096cb3d4007fc2b79b935c4540c5c2d745"],
        },
      },
    },
  },
  {
    id: "302",
    name: "Hylo HYUSD",
    address: "5YMkXAYccHSGnHn9nob9xEvv6Pvka9DZWH7nTbotTu9E",
    symbol: "HYUSD",
    url: "https://hylo.so/",
    description: "hyUSD is a USD-soft-pegged stablecoin backed by liquid staking tokens (LSTs) and stabilized through a dual-token system with xSOL, liquidation mechanisms, and a stability pool.",
    mintRedeemDescription: "Users mint hyUSD by depositing supported LSTs into Hylo's collateral pool, and redeem it by burning hyUSD to withdraw an equivalent amount of collateral.",
    onCoinGecko: "true",
    gecko_id: "hylo-usd",
    module: "hylo-hyusd",

    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: "https://docs.hylo.so/security/audits",
    twitter: "https://x.com/hylo_so",
    wiki: "https://docs.hylo.so/protocol-overview/hyUSD-&-xSOL",
    chainConfig: {
      chains: {
        solana: {
          issued: ["5YMkXAYccHSGnHn9nob9xEvv6Pvka9DZWH7nTbotTu9E"],
        },
      },
    },
  },
  {
    id: "303",
    name: "Mezo USD",
    address: "ethereum:0xdd468a1ddc392dcdbef6db6e34e89aa338f9f186",
    symbol: "MUSD",
    url: "https://mezo.org/",
    description: "MUSD is a permissionless stablecoin 100% backed by Bitcoin reserves and designed to maintain a 1:1 peg with the U.S. dollar.",
    mintRedeemDescription: "MUSD uses a CDP (collateralized debt position) model. Every outstanding MUSD is redeemable for Bitcoin. $1 in BTC collateral can be used to mint 1 MUSD.",
    onCoinGecko: "true",
    gecko_id: "mezo-usd",
    cmcId: "37163",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: "https://mezo.org/docs/audits/2025-04-15%20-%20Cantina%20-%20MUSD.pdf",
    twitter: "https://x.com/mezonetowrk",
    wiki: "https://mezo.org/docs/users/musd/",
    chainConfig: {
      chains: {
        mezo: {
          issued: ["0xdD468A1DDc392dcdbEf6db6e34E89AA338F9F186"],
        },
        ethereum: {
          bridgedFromMezo: ["0xdD468A1DDc392dcdbEf6db6e34E89AA338F9F186"],
        },
      },
    },
  },
  {
    id: "304",
    name: "USDU Finance",
    address: "ethereum:0xdde3eC717f220Fc6A29D6a4Be73F91DA5b718e55",
    symbol: "USDU",
    url: "https://usdu.finance/",
    description: "USDU is a next-generation stablecoin designed to bring deep liquidity and yield-backed stability to the decentralized finance ecosystem. It is a yield-collateralized stablecoin, fully backed by on-chain lending income from credit-rated markets.",
    mintRedeemDescription: "USDU uses modular adapters (e.g., Curve, Morpho) to mint or redeem stablecoins based on liquidity conditions. Anyone can interact with the protocol by providing the opposite side of liquidity.",
    onCoinGecko: "false",
    gecko_id: "usdu",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: "https://usdu.finance/wp-content/uploads/2025/07/BlockBite-USDU-Security-Audit-2025.pdf",
    twitter: "https://x.com/USDUfinance",
    wiki: "https://usdu.gitbook.io/docs/",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xdde3eC717f220Fc6A29D6a4Be73F91DA5b718e55"],
        },
      },
    },
  },
  {
    id: "305",
    name: "XSY UTY",
    address: "0xDBc5192A6B6FfEe7451301bb4ec312f844F02B4A",
    symbol: "UTY",
    url: "https://xsy.fi",
    description:
      "A delta-neutral asset and serves as the synthetic dollar at the center of XSY's ecosystem of decentralized financial products.",
    mintRedeemDescription:
      "XSY enables users to deposit USDC or USDT to mint UTY. Stability is secured through delta-neutral hedging strategies.",
    onCoinGecko: "true",
    gecko_id: "unity-2",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "coingecko",
    auditLinks: ["https://xsy-1.gitbook.io/xsy-main/audits"],
    twitter: "https://x.com/xsy_fi",
    wiki: "https://xsy.fi",
    doublecounted: true,
    chainConfig: {
      chains: {
        avax: {
          issued: ["0xdbc5192a6b6ffee7451301bb4ec312f844f02b4a"],
        },
      },
    },
  },
  {
    id: "306",
    name: "Gate USD",
    address: "0xaf6186b3521b60e27396b5d23b48abc34bf585c5",
    symbol: "GUSD",
    url: "https://www.gate.com/gusd",
    description:
      "GUSD is a flexible, principal-protected investment product that distributes rewards daily. Its returns are sourced from the Gate ecosystem's revenue, tokenized treasuries or other RWA, and stablecoin-backed yield assets—designed to provide relatively stable yields in both bullish and bearish market conditions. Additionally, GUSD is fully tradable and can be used as collateral.",
    mintRedeemDescription:
      "You can stake USDT/USDC to mint GUSD as a yield-bearing certificate. Upon redemption, GUSD will be converted to USDT/USDC at a 1:1 ratio",
    onCoinGecko: "true",
    gecko_id: "gusd",
    cmcId: "38330",
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "coingecko",
    auditLinks: [],
    twitter: "https://x.com/Gate",
    doublecounted: true
  },
  {
    id: "307",
    name: "USD CoinVertible",
    address: "0x5422374B27757da72d5265cC745ea906E0446634",
    symbol: "USDCV",
    url: "https://www.sgforge.com/product/coinvertible/",
    description: "The institutional investor can buy USDCV, 1:1 by sending USD to SG-FORGE bank account or buy EURCV, 1:1 by sending Euro to SG-FORGE bank account",
    mintRedeemDescription: "USDCV or EURCV can be redeemed 1:1 against fiat USD (for USDCV) or EUR (for EURCV)",
    onCoinGecko: "true",
    gecko_id: "usd-coinvertible",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: [
      "https://www.sgforge.com/product/coinvertible/"
    ],
    twitter: null,
    wiki: "https://www.sgforge.com/product/coinvertible/",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x5422374B27757da72d5265cC745ea906E0446634"],
          unreleased: [
            "0xc98Cb9F53e20AFbbeb75Caf6456eD52D5d7903f6",
            "0x7dE0bbdfCd4A6a956F149bEFcca30D6B5Bc5DA69",
          ],
        },
        solana: {
          issued: ["8smindLdDuySY6i2bStQX9o8DVhALCXCMbNxD98unx35"],
          unreleased: [
            "4N1WwAaSukn7YtRKRArA3Ntp4CfcB1nCiqCDGEjEBhEj",
            "5tg4qRdiXJ7XxYd6KK4UnnNvxgHJqfBUygPqZLwSnhnt",
          ],
        },
      },
    },
  },
  {
    id: "308",
    name: "Saga Dollar",
    address: "0xB76144F87DF95816e8c55C240F874C554B4553C3",
    symbol: "D",
    url: "https://coltstable.com/",
    description: "Saga Dollar (D) is a fully backed stablecoin by an onchain reserve of other stablecoins and yield-bearing assets on SagaEVM. The yields generated by D’s reserve are redirected to its borrowers on integrated Saga lending protocols, such as Palomino, to subsidize their interest expenses",
    mintRedeemDescription: "Users can mint and redeem Saga Dollar (D) with other stablecoins and yield-bearing assets on Colt protocol",
    onCoinGecko: "false",
    gecko_id: null,
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/ColtProtocol",
    wiki: "https://coltstable.notion.site/Colt-Stable-Documentation-257c9bce381680ca9f5edcfb47779710",
    module: "saga-dollar",
    doublecounted: true,
    chainConfig: {
      chains: {
        saga: {
          issued: ["0xB76144F87DF95816e8c55C240F874C554B4553C3"],
        },
      },
    },
  },
  {
    id: "309",
    name: "USD.AI",
    address: "plasma:0x0A1a1A107E45b7Ced86833863f482BC5f4ed82EF",
    symbol: "USDai",
    url: "https://usd.ai/",
    description: "USD.AI is a synthetic dollar protocol with USDai, a redeemable stablecoin, and sUSDai, a yield-bearing version backed by infrastructure loans and reserve assets",
    mintRedeemDescription: "Users mint USDai by depositing USDC into USD.AI and can redeem it 1:1, while sUSDai converts USDai into a yield-bearing token redeemable after a notice period",
    onCoinGecko: "true",
    gecko_id: "usdai",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://docs.usd.ai/technical-overview/audits"],
    twitter: "https://x.com/USDai_Official",
    wiki: "https://docs.usd.ai/how-usd.ai-works",
    doublecounted: true,
    module: 'usd-ai',
    chainConfig: {
      chains: {
        arbitrum: {
          issued: ["0x0A1a1A107E45b7Ced86833863f482BC5f4ed82EF"],
        },
        plasma: {
          bridgedFromArb: ["0x0A1a1A107E45b7Ced86833863f482BC5f4ed82EF"],
        },
        ethereum: {
          bridgedFromArb: ["0x0A1a1A107E45b7Ced86833863f482BC5f4ed82EF"],
        },
      },
    },
  },
  {
    id: "310",
    name: "Solstice USX",
    address: "solana:6FrrzDk5mQARGc1TDYoyVnSyRdds1t4PbtohCD6p3tgG",
    symbol: "USX",
    url: "https://solstice.finance/usx",
    description: "Solstice USX is a synthetic stablecoin protocol built on Solana",
    mintRedeemDescription: "Direct Minting and Redemption of USX is reserved for KYC’d institutional investors who deposit USDC or USDT into the Solstice Protocol. Non-KYCd users can access USX permissionlessly via leading DEXs or via the Solstice Platform",
    onCoinGecko: "true",
    gecko_id: "usx",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://storage.googleapis.com/dapp_prod/audit_reports/halborn_program_audit_250605.pdf"],
    twitter: "https://x.com/solsticefi",
    wiki: null,
    doublecounted: true,
    chainConfig: {
      chains: {
        solana: {
          issued: ["6FrrzDk5mQARGc1TDYoyVnSyRdds1t4PbtohCD6p3tgG"],
        },
      },
    },
  },
  {
    id: "311",
    name: "iAUSD",
    address: "solana:iAUSDhn2B61LBeCgph6JFxxS5KMYoyeXCbJZ4gyZLr7",
    symbol: "IAUSD",
    url: "https://inshallah.fi/stablecoin",
    description: "The first yield-bearing fully Halal stablecoin",
    mintRedeemDescription: "iAUSD is minted via iA Borrow, InshAllah's halal lending protocol. iAUSD is fully collateralized using iASOL collateral. iAUSD yield comes form profit sharing. The staking yield from iASOL is split between the iASOL collateral and minted iAUSD creating the first halal yield-bearing stablecoin",
    onCoinGecko: "false",
    gecko_id: null,
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://public.inshallah.fi/iAUSD-audit-v1.pdf"],
    twitter: "https://x.com/inshAllahfi",
    wiki: "https://inshallah.gitbook.io/inshallah/iausd-stablecoin/what-is-iausd",
    module: "iAUSD",

    chainConfig: {
      chains: {
        solana: {
          issued: ["iAUSDhn2B61LBeCgph6JFxxS5KMYoyeXCbJZ4gyZLr7"],
        },
      },
    },
  },
  {
    id: "312",
    name: "Hydrated Dollar",
    address: "0x531a654d1696ed52e7275a8cede955e82620f99a",
    symbol: "HOLLAR",
    url: "https://app.hydration.net",
    description: "The decentralized digital dollar for trading, saving, and earning",
    mintRedeemDescription: "HOLLAR is minted against crypto collateral deposited by users into the protocol, inheriting the same proven architecture as the Aave GHO protocol",
    onCoinGecko: "true",
    gecko_id: "hydrated-dollar",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://github.com/galacticcouncil/hydration-security/tree/main/audit-reports"],
    twitter: "https://x.com/hydration_net",
    wiki: "https://docs.hydration.net/quick_start/hollar",
    chainConfig: {
      chains: {
        hydradx: {
          issued: ["0x531a654d1696ed52e7275a8cede955e82620f99a"],
        },
      },
    },
  },
  {
    id: "313",
    name: "Metamask USD",
    address: "0xaca92e438df0b2401ff60da7e4337b687a2435da",
    symbol: "MUSD",
    url: "https://metamask.io/",
    description: "MetaMask USD (mUSD) is a cryptocurrency stablecoin, launched by MetaMask in September 2025. Issued by Bridge, and powered by M0, mUSD is the first stablecoin created by a self-custodial wallet. A stablecoin is a type of token that’s designed to maintain a steady value, by being pegged to less volatile assets like the US Dollar",
    mintRedeemDescription: "Issuance using Bridge.xyz , spendable equivalent to USD via metamask card at Mastercard merchants worldwide",
    onCoinGecko: "true",
    gecko_id: "metamask-usd",
    cmcId: "38167",
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "coingecko",
    auditLinks: ["https://diligence.consensys.io/audits/2025/08/metamask-usd-token/"],
    twitter: "https://x.com/MetaMask",
    wiki: "https://metamask.io/price/metamask-usd",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xaca92e438df0b2401ff60da7e4337b687a2435da"],
        },
        linea: {
          issued: ["0xaca92e438df0b2401ff60da7e4337b687a2435da"],
        },
        monad: {
          issued: ["0xaca92e438df0b2401ff60da7e4337b687a2435da"],
        },
      },
    },
  },
  {
    id: "314",
    name: "Palm USD",
    address: "0xFAF0cEe6B20e2Aaa4B80748a6AF4CD89609a3d78",
    symbol: "PUSD",
    url: "https://palmfi.xyz/",
    description: "Palm tokens maintain a 1:1 peg with real-world currencies and are fully backed by cash and Shariah-compliant financial products. This structure provides traders, merchants, and funds with a secure, low-volatility means to exit market positions while adhering to sound finance principles",
    mintRedeemDescription: "Palm customers and other institutions who have undergone a verification process can exchange currency for PUSD and redeem PUSD for currency",
    onCoinGecko: "false",
    gecko_id: null,
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/joinpalmfi",
    wiki: null,
    module: "palm-usd",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xFAF0cEe6B20e2Aaa4B80748a6AF4CD89609a3d78"],
          reserves: ["0x4b3974aaabdc251b3086ae4a8163110d766c88c8", "0x1760bFB0f8461Fcf4c6768a82436840d23F40252", "0xa1B2A2dFe6300D3f2174e0a4f073Fc0F78F5169F"],
        },
        bsc: {
          issued: ["0xFAF0cEe6B20e2Aaa4B80748a6AF4CD89609a3d78"],
        },
        solana: {
          issued: ["CZzgUBvxaMLwMhVSLgqJn3npmxoTo6nzMNQPAnwtHF3s"],
        },
        tron: {
          issued: ["TF39FD5YwW63mtB1zr9gpVdyFUx1icac2y"],
        },
      },
    },
  },
  {
    id: "315",
    name: "US Permissionless Dollar",
    address: "0x476ef9ac6D8673E220d0E8BC0a810C2Dc6A2AA84",
    symbol: "USPD",
    url: "https://uspd.io",
    description: "USPD is a permissionless over-collateralized stablecoin backed by staked ETH with built-in yield pass-through to holders and autonomous peg maintenance via a stabilizer architecture",
    mintRedeemDescription: "Mint or Burn with a guaranteed 1:1 ETH/USD dollar price (USPD Dollar Peg) via https://uspd.io/mint-burn-uspd",
    onCoinGecko: "true",
    gecko_id: "us-permissionless-dollar",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://uspd.io/docs/uspd/audit"],
    twitter: "https://x.com/USPD_io",
    wiki: "https://uspd.io/docs/uspd",
    deadFrom: "2025-12-04",
  },
  {
    id: "316",
    name: "CASH",
    address: "solana:CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH",
    symbol: "CASH",
    url: "https://www.usecash.xyz/",
    description: "CASH is a stablecoin issued by Bridge Building Inc. (BBI), fully backed 1:1 by U.S. dollars",
    mintRedeemDescription: "BBI maintains a segregated reserve of liquid, high-quality assets—such as short-term U.S. Treasuries, reverse repos, money market funds, and tokenized equivalents—to support redemptions. The reserves comply with GENIUS Act standards, but holders do not have a direct claim on the underlying assets",
    onCoinGecko: "true",
    gecko_id: "cash-4",
    cmcId: "38760",
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "coingecko",
    auditLinks: ["https://uspd.io/docs/uspd/audit"],
    twitter: "https://x.com/usecash",
    wiki: null,
    module: "cash",
    chainConfig: {
      chains: {
        solana: {
          issued: ["CASHx9KJUStyftLFWGvEVf59SGeG9sh5FfcnZMVPCASH"],
        },
      },
    },
  },
  {
    id: "317",
    name: "Tokenised GBP",
    address: "0x27f6c8289550fCE67f6B50BeD1F519966aFE5287",
    symbol: "tGBP",
    url: "https://www.tokenisedgbp.com/",
    description: "Tokenised GBP (tGBP) is the only British Pound backed stablecoin issued by a UK FCA-registered firm. tGBP is fully backed with cash and short-term UK gilts and pegged 1:1 with the British Pound",
    mintRedeemDescription: "To mint Tokenised GBP (tGBP), eligible businesses need to create a tGBP Mint account and complete the required KYB and AML checks. Once the account is approved, businesses can mint and redeem tGBP with GBP from their UK bank account. Retail users can access mint and redemption services through a variety of exchange and payment partners",
    onCoinGecko: "true",
    gecko_id: "tokenised-gbp",
    cmcId: null,
    pegType: "peggedGBP",
    pegMechanism: "fiat-backed",
    priceSource: "coingecko",
    auditLinks: ["https://www.openzeppelin.com/news/tgbp-audit"],
    twitter: "https://x.com/tokenGBP",
    wiki: null,
    module: "tgbp",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x27f6c8289550fCE67f6B50BeD1F519966aFE5287"],
        },
        bsc: {
          issued: ["0x27f6c8289550fCE67f6B50BeD1F519966aFE5287"],
        },
        base: {
          issued: ["0x27f6c8289550fCE67f6B50BeD1F519966aFE5287"],
        },
        polygon: {
          issued: ["0x27f6c8289550fCE67f6B50BeD1F519966aFE5287"],
        },
        avax: {
          issued: ["0x27f6c8289550fCE67f6B50BeD1F519966aFE5287"],
        },
        solana: {
          issued: ["2zMqyX4AYCk6mgy5UZ2S7zUaLxwERhK5WjqDzkPPbSpW"],
        },
        arbitrum: {
          issued: ["0x27f6c8289550fCE67f6B50BeD1F519966aFE5287"],
        },
        xdai: {
          issued: ["0x1F34490F8e8E776FFc547b39B864364035Eaf44F"],
        },
      },
    },
  },
  {
    id: "318",
    name: "litUSD",
    address: "0x3B5F2810fB2168FfA9C73160F97BF9f2461fFa5c",
    symbol: "litUSD",
    url: "https://brale.xyz/stablecoins/litUSD",
    description: "litUSD is a U.S. dollar stablecoin developed with Brale and Stably for LitFinancial, a U.S-regulated mortgage lender. litUSD enables Lit to tokenize idle treasury cash for more efficient operations and on-chain liquidity.",
    mintRedeemDescription: "Consumers can mint and redeem litUSD via bank transfer or Circle's USDC stablecoin through Brale's verified business accounts.",
    onCoinGecko: "false",
    gecko_id: null,
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/LitFinancial_",
    wiki: "https://brale.xyz/stablecoins/litUSD",
    module: "lit-usd",
    doublecounted: true,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x3B5F2810fB2168FfA9C73160F97BF9f2461fFa5c"],
        },
      },
    },
  },
  {
    id: "319",
    name: "AllUnity EUR",
    address: "0x4933a85b5b5466fbaf179f72d3de273c287ec2c2",
    symbol: "EURAU",
    url: "https://allunity.com/",
    description: "EURAU is a MiCAR-compliant, fully backed euro stablecoin that delivers speed, stability, and security in one.",
    mintRedeemDescription: "EURAU Euro stablecoin can be seamlessly minted and redeemed by Verified Institutions - fully reserved, built for regulatory compliance, speed, and stability. Always redeemable at par value.",
    onCoinGecko: "true",
    gecko_id: "allunity-eur",
    cmcId: null,
    pegType: "peggedEUR",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/AllUnityStable",
    wiki: "https://allunity.com/eurau/",
    doublecounted: true,
    chainConfig: {
      chains: {
        ethereum: { issued: "0x4933a85b5b5466fbaf179f72d3de273c287ec2c2" },
        polygon: { issued: "0x4933a85b5b5466fbaf179f72d3de273c287ec2c2" },
        base: { issued: "0x4933a85b5b5466fbaf179f72d3de273c287ec2c2" },
        optimism: { issued: "0x4933a85b5b5466fbaf179f72d3de273c287ec2c2" },
        tempo: { issued: "0x20c0000000000000000000009a4a4b17e0dc6651" }, // EURAU on Tempo Mainnet
      },
    },
  },
  {
    id: "320",
    name: "Rocky USDr",
    address: "sei:0x53fdd705873d8259d6d179901fc3fdcb5339f921",
    symbol: "USDR",
    url: "https://rocky.cash/",
    description: "USDr is the USD stablecoin of Rocky. It is a decentralized, overcollateralized asset backed by a basket of cryptocurrencies and stablecoins, including yield-bearing versions such as Morpho vaults.",
    mintRedeemDescription: "The Rocketizer Module, which is going to serve as the main minting module, is deployed on Sei. Tokens allowed in the backing of USDr have been carefully reviewed for their stability, robustness, sustainable yield generation and business development potential. Allowed assets and their parameters can be updated at any time by contributors.",
    onCoinGecko: "false",
    gecko_id: null,
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/rockydotcash",
    wiki: "https://docs.rocky.cash/products/stablecoins-and-savings/usdr-and-susdr",
    module: "rocky-usdr",
    chainConfig: {
      chains: {
        sei: {
          issued: ["0x53fdd705873d8259d6d179901fc3fdcb5339f921"],
        },
      },
    },
  },
  {
    id: "321",
    name: "USDH Stablecoin",
    address: "hyperliquid:0x111111a1a0667d36bd57c0a9f569b98057111111",
    symbol: "USDH",
    url: "https://nativemarkets.com/",
    description: "USDH is a fiat-backed digital dollar built natively for Hyperliquid. Designed by Native Markets and issued by Bridge Building Inc, it delivers a credible, ecosystem-aligned, and native dollar solution for Hyperliquid.",
    mintRedeemDescription: "USDH is fully reserved by cash, short-term U.S. Treasuries, repo agreements, treasury-focused funds (e.g., BlackRock TTTXX), and tokenized treasury products (e.g., BlackRock BUIDL, Superstate USTB).",
    onCoinGecko: "true",
    gecko_id: "usdh-2",
    cmcId: "38331",
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/nativemarkets",
    wiki: null,
    module: "hyperliquid-native-stablecoin",
    chainConfig: {
      chains: {
        hyperliquid: {
          issued: ["0x111111a1a0667d36bd57c0a9f569b98057111111"],
          unreleased: ["0x4c2c0f0bb2631b02ac9299c59690914ee7a200b8", "0xc5c21723fdd9e74fd853dd19c8dded71c3767cc2"],
        },
      },
    },
  },
  {
    id: "322",
    name: "Last USD",
    address: "hyperliquid:0xca79db4b49f608ef54a5cb813fbed3a6387bc645",
    symbol: "USDXL",
    url: "https://www.last.net/",
    description: "Last USD (USDXL) is a crypto-backed stablecoin designed to maintain a peg to the U.S. dollar.",
    mintRedeemDescription: "USDXL lets users mint synthetic dollars against blue chip over-collateralized cryptoassets",
    onCoinGecko: "true",
    gecko_id: "last-usd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/lastdotnet",
    wiki: null,
    chainConfig: {
      chains: {
        hyperliquid: {
          issued: ["0xca79db4b49f608ef54a5cb813fbed3a6387bc645"],
        },
      },
    },
  },
  {
    id: "323",
    name: "KEI Stablecoin",
    address: "hyperliquid:0xb5fe77d323d69eb352a02006ea8ecc38d882620c",
    symbol: "KEI",
    url: "https://keikofinance.com",
    description: "KEI is a USD-pegged stablecoin issued by Keiko Finance. Users can mint KEI by depositing supported crypto collateral into the Keiko Protocol. It maintains a 1:1 peg to USD through over-collateralization and vault mechanics.",
    mintRedeemDescription: "Users may mint and redeem KEI through the Keiko Protocol by depositing and withdrawing supported crypto collateral via on-chain vaults",
    onCoinGecko: "true",
    gecko_id: "kei-stablecoin",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/KeikoFinance",
    wiki: "https://docs.keikofinance.com/protocol-overview/kei-stablecoin",
    chainConfig: {
      chains: {
        hyperliquid: {
          issued: ["0xb5fe77d323d69eb352a02006ea8ecc38d882620c"],
        },
      },
    },
  },
  {
    id: "324",
    name: "Stable Coin",
    address: "0xf9FB20B8E097904f0aB7d12e9DbeE88f2dcd0F16",
    symbol: "SBC",
    url: "https://stablecoin.xyz/",
    description: "Stable Coin (SBC) is a payments-focused stablecoin issued by Brale and Stable Coin Inc. It emphasizes redeemability, regulatory compliance, and transparency, offering a reliable USD-pegged asset supported by tools that enable seamless, gasless payment integrations.",
    mintRedeemDescription: "SBC can be minted and redeemed directly through Brale’s platform under standard KYC/AML requirements. All tokens are fully backed and redeemable 1:1, ensuring transparent and compliant issuance aligned with established financial practices",
    onCoinGecko: "true",
    gecko_id: "stable-coin-2",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/stablecoin_xyz",
    wiki: null,
    chainConfig: {
      chains: {
        ethereum: { issued: ["0xf9FB20B8E097904f0aB7d12e9DbeE88f2dcd0F16"] },
        ethereumclassic: { issued: ["0xfdcC3dd6671eaB0709A4C0f3F53De9a333d80798"] },
        arbitrum: { issued: ["0xfdcC3dd6671eaB0709A4C0f3F53De9a333d80798"] },
        avax: { issued: ["0xf9FB20B8E097904f0aB7d12e9DbeE88f2dcd0F16"] },
        base: { issued: ["0xfdcC3dd6671eaB0709A4C0f3F53De9a333d80798"] },
        celo: { issued: ["0xDE093684c796204224BC081f937aa059D903c52a"] },
        optimism: { issued: ["0xf9FB20B8E097904f0aB7d12e9DbeE88f2dcd0F16"] },
        polygon: { issued: ["0xfdcC3dd6671eaB0709A4C0f3F53De9a333d80798"] },
        solana: { issued: ["DBAzBUXaLj1qANCseUPZz4sp9F8d2sc78C4vKjhbTGMA"] },
        tempo: { issued: ["0x20c000000000000000000000ae247a1130450f09"] },
        stellar: {
          issued: ["SBC-GCQCNWT22JDLENQAVIE6DRJGHWAQ6EX2H5ABGPV55EJUPPZM5UA7KHZR"],
        },
      },
    },
  },
  {
    id: "325",
    name: "Eurite",
    address: "bsc:0x9d1a7a3191102e9f900faa10540837ba84dcbae7",
    symbol: "EURI",
    url: "https://www.eurite.com/",
    description: "EURI is one of the first MiCA-regulated euro stablecoins, issued by Banking Circle S.A. It is designed to complement Banking Circle's existing payment systems by enabling efficient euro-denominated transfers, smart contract use, treasury management, reduced volatility exposure, and out-of-hours settlement. MiCA compliance ensures adherence to high EU regulatory standards, thereby improving trust, transparency, and overall system stability.",
    mintRedeemDescription: "EURI is minted when users deposit euros with Banking Circle S.A. and is redeemed 1:1 for euros through a regulated MiCA-compliant process. Redemptions require sending EURI to a burn address; after verification and processing, the equivalent amount of EUR is transferred back to the user’s bank account. MiCA oversight ensures consumer protection, transparency, and proper reserve management throughout the minting and redemption lifecycle",
    onCoinGecko: "true",
    gecko_id: "eurite",
    cmcId: null,
    pegType: "peggedEUR",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/Eurite_BC",
    wiki: null,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x9d1a7a3191102e9f900faa10540837ba84dcbae7"],
        },
        bsc: {
          issued: ["0x9d1a7a3191102e9f900faa10540837ba84dcbae7"],
        },
      },
    },
  },
  {
    id: "326",
    name: "Metronome Synth USD",
    address: "0xab5eb14c09d416f0ac63661e57edb7aecdb9befa",
    symbol: "MSUSD",
    url: "https://metronome.io/",
    description: "MSUSD is a synthetic USD token issued by the Metronome DAO, built on the Metronome protocol as a decentralized, on-chain USD peg.",
    mintRedeemDescription: "MSUSD can be minted by depositing supported on-chain assets into Metronome's smart contracts and redeemed by burning METUSD to unlock the backing collateral",
    onCoinGecko: "true",
    gecko_id: "metronome-synth-usd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/MetronomeDAO",
    wiki: null,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xab5eb14c09d416f0ac63661e57edb7aecdb9befa"],
        },
        optimism: {
          issued: ["0x9dabae7274d28a45f0b65bf8ed201a5731492ca0"],
        },
        base: {
          issued: ["0x526728dbc96689597f85ae4cd716d4f7fccbae9d"],
        },
        plasma: {
          issued: ["0x29ad7fe4516909b9e498b5a65339e54791293234"],
        },
      },
    },
  },
  {
    id: "327",
    name: "Mu Digital AZND",
    address: "monad:0x4917a5ec9fCb5e10f47CBB197aBe6aB63be81fE8",
    symbol: "AZND",
    url: "https://mudigital.net/",
    description: `AZND (the "Asian Dollar") is a synthetic dollar backed by Asia's best RWAs, designed for stability and steady yield.`,
    mintRedeemDescription: `Direct minting and redemption of AZND is available to approved counterparties that have cleared Mu Digital's KYC procedures.`,
    onCoinGecko: "true",
    gecko_id: "mu-digital-aznd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: [
      "https://github.com/slowmist/Knowledge-Base/blob/master/open-report-V2/smart-contract/Mu%20Protocol%20-%20SlowMist%20Audit%20Report.pdf",
      "https://hacken.io/audits/mu-digital/",
    ],
    twitter: "https://x.com/MuDigitalHQ",
    wiki: null,
    chainConfig: {
      chains: {
        monad: {
          issued: ["0x4917a5ec9fCb5e10f47CBB197aBe6aB63be81fE8"],
        },
      },
    },
    delisted: true, // Mu Digital orderly wind-down 2026-07; peg broken (no market price, unredeemable at $1) — stop reporting monad supply at face value
  },
  {
    id: "328",
    name: "Mustang Finance",
    address: "saga:0xA8b56ce258a7f55327BdE886B0e947EE059ca434",
    symbol: "MUST",
    url: "https://must.finance/",
    description: `Mustang USD is a decentralized over-collateralized stablecoin that is pegged to the US dollar and backed by crypto assets on the Saga EVM chain. Mustang is a friendly fork of Liquity V2. 1 $MUST is always redeemable for $1 in backing assets.`,
    mintRedeemDescription: `Users open vaults (“troves”) and deposit accepted collateral to mint MUST up to their chosen collateral ratio. To unlock collateral, borrowers repay and burn MUST, or anyone can redeem 1 MUST token directly for $1 of collateral from which ever trove is paying the lowest interest rate, ensuring the peg.`,
    onCoinGecko: "false",
    gecko_id: null,
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: [
      "https://github.com/MustangProtocol/audit-reports",
    ],
    twitter: "https://x.com/mustangfinance",
    wiki: "https://docs.must.finance/",
    module: "mustng-usd",
    chainConfig: {
      chains: {
        saga: {
          issued: ["0xA8b56ce258a7f55327BdE886B0e947EE059ca434"],
        },
      },
    },
    deadUrl: true,
  },
  {
    id: "329",
    name: "Nectar",
    address: "berachain:0x1ce0a25d13ce4d52071ae7e02cf1f6606f4c79d3",
    symbol: "NECT",
    url: "https://www.beraborrow.com/",
    description: `Nectar (NECT) is Berachain's first natively backed stablecoin, minted through the Beraborrow CDP protocol and redeemable 1:1 against its underlying collateral.`,
    mintRedeemDescription: `Users mint NECT by opening a Den and depositing approved Berachain assets as collateral. NECT can be redeemed at any time for the underlying collateral at face value.`,
    onCoinGecko: "true",
    gecko_id: "nectar",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/beraborrow",
    wiki: null,
    module: "nectar",
    chainConfig: {
      chains: {
        berachain: {
          issued: ["0x1ce0a25d13ce4d52071ae7e02cf1f6606f4c79d3"],
        },
      },
    },
  },
  {
    id: "330",
    name: "Gaming XP USD",
    address: "avax:0xcc18b41a0f63c67f17f23388c848aec67b583422",
    symbol: "xpUSD",
    url: "https://growthprotocol.xyz/",
    description: "xpUSD, developed by The Growth Protocol (TGP), is the universal stablecoin powering a new gaming economy, enabling players to earn tokens across games and instantly convert them to xpUSD for real value, while trading skins, NFTs, and in-game assets with true liquidity across PC and mobile ecosystems—unlocking previously siloed items in walled gardens. It provides real ownership for players, boosts retention and engagement through cash-out options, and offers publishers instant xpUSD-backed financing for growth, plus new revenue layers, all unified on a dedicated gaming-optimized layer.",
    mintRedeemDescription: "Users can mint and redeem xpUSD via bank transfer or Circle's USDC stablecoin through Brale's verified business accounts.",
    onCoinGecko: "false",
    gecko_id: null,
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/GrowthProtocol_",
    wiki: null,
    module: "xpusd",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x31Bc2bAa782e5180e9EfA32261D2Bb33Ce8918Bc"],
        },
        avax: {
          issued: ["0xcc18b41a0f63c67f17f23388c848aec67b583422"],
        },
      },
    },
  },
  {
    id: "331",
    name: "USP",
    address: "0x098697bA3Fee4eA76294C5d6A466a4e3b3E95FE6",
    symbol: "USP",
    url: "https://piku.co/app",
    description: "The USP token is classified as a yield-optimized stablecoin that uniquely combines the stability of a traditional stablecoin with the growth potential of yield-generating assets. Governed by PikuDAO.",
    mintRedeemDescription: "Verified users can mint USP by depositing supported assets (initially USD-denominated stablecoins), with instant execution and a 0% minting fee at launch. When redeeming, USP is burned and returned as USD stablecoins via a T0 + queue process, with redemptions processed within 24 hours. A 0.2% redemption fee is added back to USP reserves to support long-term stability..",
    onCoinGecko: "true",
    gecko_id: "usp-yield-optimized-stablecoin",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/piku_dao",
    wiki: "https://docs.piku.co/piku/piku/usp",
    module: "usp",
    doublecounted: true,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x098697bA3Fee4eA76294C5d6A466a4e3b3E95FE6"],
        },
      },
    },
  },
  {
    id: "332",
    name: "pmUSD",
    address: "0xc0c17dd08263c16f6b64e772fb9b723bf1344ddf",
    symbol: "pmUSD",
    url: "https://pmusd.raac.io/",
    description: "pmUSD is an overcollateralized stablecoin backed by tokenized precious metals (XAU).",
    mintRedeemDescription: "pmUSD is minted against the deposited XAU at a predefined collateral target ratio.",
    onCoinGecko: "true",
    gecko_id: "precious-metals-usd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://docs.raac.io/audits-rwfx/"],
    twitter: "https://x.com/Raacfi",
    wiki: "https://docs.raac.io/rw-fx/",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xc0c17dd08263c16f6b64e772fb9b723bf1344ddf"],
        },
      },
    },
  },
  {
    id: "333",
    name: "mantraUSD",
    address: "mantra:0xd2b95283011E47257917770D28Bb3EE44c849f6F",
    symbol: "mantraUSD",
    url: "https://mantrausd.com/",
    description: "mantraUSD is the native stablecoin for the MANTRA RWA ecosystem. Backed by short-term US Treasuries, it provides seamless value transfer and serves as the native settlement layer that converts offchain yield into onchain ecosystem rewards. It is the preferred currency for all the regulated and licensed activities of MANTRA Finance, which include RWA vaults, RWA launchpad, and a DEX.",
    mintRedeemDescription: "mantraUSD can be minted and redeemed on-chain through the M0 stablecoin infrastructure. Users mint mantraUSD by depositing supported collateral into the protocol and can redeem mantraUSD back into underlying assets at a 1:1 rate.",
    onCoinGecko: "true",
    gecko_id: "mantra-usd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/mantraUSD",
    wiki: null,
    chainConfig: {
      chains: {
        mantra: {
          issued: ["0xd2b95283011E47257917770D28Bb3EE44c849f6F"],
        },
      },
    },
  },
  {
    id: "334",
    name: "Macropod",
    address: "0x081599e4936d12c46bd48913b2329115cd26cbdd",
    symbol: "AUDM",
    url: "https://www.macropod.com",
    description: "Australia’s first licensed stablecoin issuer, the birthplace of Aussie dollar-pegged AUDM and built for real-world payments.",
    mintRedeemDescription: "AUDM each fully backed by AUD reserves safeguarded in a trust account with a Big 4 Australian bank.",
    onCoinGecko: "true",
    gecko_id: "macropod",
    cmcId: null,
    pegType: "peggedAUD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/Macropod_AU",
    wiki: null,
    module: "macropod",
    chainConfig: {
      chains: {
        rbn: {
          issued: ["0x081599E4936D12c46Bd48913B2329115Cd26cbdd"],
        },
        ethereum: {
          issued: ["0x081599E4936D12c46Bd48913B2329115Cd26cbdd"],
        },
        solana: {
          issued: ["CiYXBwHPrdNkMtxR8YEWKv78K6bQjFoEWhPQrZqEmubi"],
        },
        base: {
          issued: ["0xeded6ae915b129b67a4ad49901518f2736427063"],
        },
      },
    },
  },
  {
    id: "335",
    name: "JupUSD",
    address: "solana:JuprjznTrTSp2UFa3ZBUFgwdAmtZCq4MQCwysN55USD",
    symbol: "JUPUSD",
    url: "https://jupusd.money/",
    description: "JupUSD is a Solana-native, reserve-backed stablecoin pegged to the U.S. dollar, built by Jupiter in partnership with Ethena.",
    mintRedeemDescription: "JupUSD is minted and redeemed against reserve assets held in custody - primarily Ethena's USDtb and USDC. Direct minting and redemption are available to onboarded and whitelisted partners, KYC’d market makers, and institutional participants.",
    onCoinGecko: "true",
    gecko_id: "jupusd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "coingecko",
    auditLinks: ["https://docs.jup.ag/user-docs/earn/jupusd#security-and-transparency"],
    twitter: "https://x.com/JupiterExchange",
    wiki: "https://docs.jup.ag/user-docs/earn/jupusd",
    module: "jupusd",
    doublecounted: true,
    chainConfig: {
      chains: {
        solana: {
          issued: ["JuprjznTrTSp2UFa3ZBUFgwdAmtZCq4MQCwysN55USD"],
        },
      },
    },
  },
  {
    id: "336",
    name: "United Stables",
    address: "bsc:0xce24439f2d9c6a2289f741120fe202248b666666",
    symbol: "U",
    url: "https://u.tech/",
    description: `$U is a next-generation stablecoin backed by fully fluid assets, designed to unify fragmented liquidity across trading, payments, DeFi, institutional settlement, and AI-driven autonomous systems. It is the embodiment of a "fluid" future where value flows seamlessly between humans and AI.`,
    mintRedeemDescription: "An eligible business can exchange USD and $USDT/USDC/USD1 for $U and redeem $U for USD and $USDT/USDC/USD1 through an United Stables Account.",
    onCoinGecko: "true",
    gecko_id: "united-stables",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "coingecko",
    auditLinks: [],
    twitter: "https://x.com/UTechStables",
    wiki: null,
    module: "united-stables",
    doublecounted: true,
    chainConfig: {
      chains: {
        bsc: {
          issued: ["0xce24439f2d9c6a2289f741120fe202248b666666"],
        },
        ethereum: {
          issued: ["0xce24439f2d9c6a2289f741120fe202248b666666"],
        },
        tron: {
          issued: ["TFNirp6PbqYE1ZTtWuCMUKJWLNZkoCoeFJ"],
        },
      },
    },
  },
  {
    id: "337",
    name: "USE",
    address: "ergo:a55b8735ed1a99e46c2c89f8994aacdf4b1109bdcf682f1e5b34479c6e392669",
    symbol: "USE",
    url: "https://cruxfinance.io/use-analytics",
    description: `$USE (Universal Stablecoin for Ergo) is a new decentralized, algorithmic stablecoin built on the Ergo blockchain. It is designed to be a more resilient and scalable alternative to previous models like SigUSD.`,
    mintRedeemDescription: `$USE is a next-generation stablecoin that tries to solve the liquidity and "lock-up" issues of older models. It uses a bank-and-arbitrage system to keep its $1 peg and relies on a community-funded liquidity pool to stay healthy.`,
    onCoinGecko: "false",
    gecko_id: null,
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "algorithmic",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/StableUSE",
    wiki: "https://github.com/kushti/dexy-stable/blob/master/paper-lipics/dexy.pdf",
    module: "use",
  },
  {
    id: "338",
    name: "Fuse Dollar V3",
    address: "fuse:0xCE86a1cf3cFf48139598De6bf9B1dF2E0f79F86F",
    symbol: "FUSD",
    url: "https://docs.voltage.finance/voltage/the-platform/fusd-v3",
    description: `Fuse Dollar (fUSD) is a decentralized, 1:1 USD-pegged stablecoin native to the Fuse Network, fully backed by a reserve of top-tier stablecoins (USDC and USDT) held in smart contracts. It is designed to provide a stable medium of exchange for everyday payments and decentralized finance (DeFi) within the Fuse ecosystem.`,
    mintRedeemDescription: `Users can mint fUSD 1:1 by depositing supported stablecoin collateral (typically USDC or USDT) into the protocol. fUSD can be redeemed for the underlying collateral at any time. The v3 protocol utilizes a dynamic "Basket" mechanism to maintain its peg, ensuring the token is always fully collateralized by on-chain reserves.`,
    onCoinGecko: "true",
    gecko_id: "fuse-dollar",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/fuse_network",
    wiki: null,
    module: "fuse-dollar-v3",
    chainConfig: {
      chains: {
        fuse: {
          issued: ["0xCE86a1cf3cFf48139598De6bf9B1dF2E0f79F86F"],
        },
      },
    },
  },
  {
    id: "339",
    name: "Re Protocol reUSD",
    address: "0x5086bf358635b81d8c47c66d1c8b9e567db70c72",
    symbol: "reUSD",
    url: "https://re.xyz/",
    description: `reUSD is a principal-protected, yield-accruing token that tracks the higher of the risk-free rate or Ethena basis-trade yield, plus 250 bps. It earns on-chain, deploys off-chain via Surplus Notes, and provides transparent, oracle-verified collateral reporting.`,
    mintRedeemDescription: `reUSD is minted by depositing approved stablecoins into Re Protocol’s Insurance Capital Layer smart contracts and is redeemed by burning reUSD to withdraw the underlying stablecoins.`,
    onCoinGecko: "true",
    gecko_id: "re-protocol-reusd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://docs.re.xyz/security-and-audits"],
    twitter: "https://x.com/re",
    wiki: null,
    module: "re-protocol-reusd",
    doublecounted: true,
    bridgeConfig: {
      lzConfig: {
        symbols: ["reUSD"],
      }
    },
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x5086bf358635b81d8c47c66d1c8b9e567db70c72"],
        },
        arbitrum: {
          issued: ["0x76ce01f0ef25aa66cc5f1e546a005e4a63b25609"],
        },
        base: {
          issued: ["0x7d214438d0f27afccc23b3d1e1a53906ace5cfea"],
        },
        avax: {
          issued: ["0x180af87b47bf272b2df59dccf2d76a6eafa625bf"],
        },
        ink: {
          issued: ["0x5bcf6b008bf80b9296238546bace1797657b05d6"],
        },
        bsc: {
          issued: ["0xba9425ec55ee0e72216d18e0ad8bbba2553bfb60"],
        },
        tempo: {
          issued: ["0x20c000000000000000000000383a23bacb546ab9"],
        },
        monad: {
          issued: ["0xD25f563e12FF616262F8c947feC108db934F8059"],
        },
      },
    },
  },
  {
    id: "340",
    name: "rwaUSDi",
    address: "0xa39986f96b80d04e8d7aeaaf47175f47c23fd0f4",
    symbol: "rwaUSDi",
    url: "https://multipli.fi/",
    description: `rwaUSD is a credit-backed stablecoin designed to represent value backed by highly liquid tokenized real-world assets (RWAs) and make that value usable across DeFi.`,
    mintRedeemDescription: `rwaUSD is minted by depositing supported tokenized real-world assets into Multipli's collateral framework under risk-adjusted mint-to-value parameters, and is redeemed by burning rwaUSD to withdraw the underlying collateral.`,
    onCoinGecko: "false",
    gecko_id: null,
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://docs.multipli.fi/risks/audit-reports"],
    twitter: "https://x.com/multiplifi",
    wiki: "https://docs.multipli.fi/",
    module: "rwausdi",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xa39986f96b80d04e8d7aeaaf47175f47c23fd0f4"],
        },
        monad: {
          issued: ["0x650b616b46fF94000Eb115926aB8393B90788D76"],
        },
        base: {
          issued: ["0xd74FB32112b1eF5b4C428Fead8dA8d85A0019009"],
        },
        arbitrum: {
          issued: ["0xa39986f96b80d04e8d7aeaaf47175f47c23fd0f4"],
        },
      },
    },
  },
  {
    id: "341",
    name: "Pleasing USD",
    address: "arbitrum:0xc8fb643d18f1e53698cfda5c8fdf0cdc03c1dbec",
    symbol: "PUSD",
    url: "https://www.pleasinggold.com/",
    description: `Pleasing USD (PUSD) is a fully backed synthetic dollar with a 1:1 conversion path to USDT. PUSD not only passes through yield, but also gives users instant metals exposure and deep market liquidity across precious metal market.`,
    mintRedeemDescription: `PUSD is minted by depositing USDT, and it can always be redeemed directly for USDT at a 1:1 value.`,
    onCoinGecko: "true",
    gecko_id: "pleasing-usd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/PleasingGolden",
    wiki: null,
    module: "pleasing-usd",
    doublecounted: true,
    chainConfig: {
      chains: {
        arbitrum: {
          issued: ["0xc8fb643d18f1e53698cfda5c8fdf0cdc03c1dbec"],
        },
      },
    },
  },
  {
    id: "342",
    name: "MegaUSD",
    address: "megaeth:0xEc2AF1C8B110a61fD9C3Fa6a554a031Ca9943926",
    symbol: "USDM",
    url: "https://www.megaeth.com/",
    description: `MegaETH's native stablecoin.`,
    mintRedeemDescription: `USDm is issued through Ethena's stablecoin stack, with mint/redeem facilitated on Ethereum mainnet via USDC then bridged to MegaETH.`,
    onCoinGecko: "true",
    gecko_id: "megausd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/megaeth",
    wiki: "https://www.megaeth.com/blog-news/megaeth-introduces-usdm",
    module: "megausd",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xEc2AF1C8B110a61fD9C3Fa6a554a031Ca9943926"],
        },
        megaeth: {
          issued: ["0xFAfDdbb3FC7688494971a79cc65DCa3EF82079E7"],
        },
      },
    },
  },
  {
    id: "343",
    name: "USAT",
    address: "0x07041776f5007ACa2A54844F50503a18A72A8b68",
    symbol: "USAT",
    url: "https://usat.io/",
    description: `USAT (USA₮) is a U.S.-regulated, fully dollar-backed stablecoin issued under the GENIUS Act framework, designed to maintain a 1:1 USD peg with reserves held in U.S. liquid assets and deployed for compliant digital payments and settlement.`,
    mintRedeemDescription: `USAT is minted when authorized participants deposit U.S. dollars with Anchorage Digital Bank, N.A., which issues USAT 1:1 onchain against segregated liquid reserves.`,
    onCoinGecko: "true",
    gecko_id: "usa",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/usat",
    wiki: null,
    module: "usat",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x07041776f5007ACa2A54844F50503a18A72A8b68"],
        },
      },
    },
  },
  {
    id: "344",
    name: "Yuzu USD",
    address: "plasma:0x6695c0f8706C5ACe3Bdf8995073179cCA47926dc",
    symbol: "YZUSD",
    url: "https://yuzu.money",
    description: `Yuzu USD (yzUSD) is an overcollateralized synthetic USD stablecoin designed to combine price stability with high-yield DeFi strategies. Backed by on-chain collateral and protected by layered risk-management frameworks, yzUSD provides a transparent and resilient stable asset within the Yuzu ecosystem.`,
    mintRedeemDescription: `Users mint yzUSD by depositing on-chain collateral, which is deployed into curated DeFi yield strategies. The peg is maintained through overcollateralization (>$1 backing per yzUSD) and layered protections such as risk tranching and smart contract insurance, with reserves and risk metrics transparently verifiable on-chain.`,
    onCoinGecko: "true",
    gecko_id: "yuzu-usd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/YuzuMoneyX",
    wiki: null,
    module: "yuzu-usd",
    doublecounted: true,
    chainConfig: {
      chains: {
        plasma: {
          issued: ["0x6695c0f8706c5ace3bdf8995073179cca47926dc"],
        },
        monad: {
          bridgedFromPlasma: ["0x9dcB0D17eDDE04D27F387c89fECb78654C373858"],
        },
      },
    },
  },
  {
    id: "345",
    name: "Uncap USD",
    address: "starknet:0x02f94539f80158f9a48a7acf3747718dfbec9b6f639e2742c1fb44ae7ab5aa04",
    symbol: "USDU",
    url: "https://uncap.finance",
    description: `Uncap USD (USDU) is a fully decentralized, Bitcoin-backed synthetic dollar built on Starknet. It is hard-pegged to USD and overcollateralized by on-chain Bitcoin, enabling users to mint a censorship-resistant stable asset while retaining full custody and verifiability of the underlying collateral.`,
    mintRedeemDescription: `Users can mint USDU by depositing Bitcoin as collateral into the Uncap protocol. USDU maintains its $1 peg through direct redemptions, allowing anyone to redeem 1 USDU for $1 worth of Bitcoin at any time. Price stability is enforced via arbitrage incentives, when USDU trades below $1, redemptions reduce supply, and when it trades above $1, new USDU can be minted, ensuring a stable peg without centralized control or algorithmic intervention.`,
    onCoinGecko: "true",
    gecko_id: "uncap-usd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/uncapfinance",
    wiki: null,
    module: "uncap-usd",
    chainConfig: {
      chains: {
        starknet: {
          issued: ["0x2F94539F80158f9a48a7acF3747718dfBec9B6f639E2742c1FB44aE7ab5AA04"],
        },
      },
    },
    deadUrl: true,
    deadFrom: "2026-03-04",
  },
  {
    id: "346",
    name: "Neutrl USD",
    address: "0xe556aba6fe6036275ec1f87eda296be72c811bce",
    symbol: "NUSD",
    url: "https://www.neutrl.finance/",
    description: `Neutrl USD (NUSD) is a crypto-native synthetic dollar designed to deliver market-neutral yield while maintaining price stability. It is backed by a diversified, overcollateralized portfolio that combines discounted OTC-acquired crypto assets, liquid stablecoin reserves, and delta-neutral positions, with on-chain transparency and risk management at its core.`,
    mintRedeemDescription: `Users can mint NUSD by depositing supported collateral into the protocol, which is deployed across a delta-neutral portfolio designed to maintain a stable USD peg. Price stability is achieved through fully hedged OTC positions, liquid stablecoin reserves (such as USDC, USDT, and USDe), and duration-matched liquidity management. NUSD can be redeemed against underlying reserves, with peg maintenance supported by arbitrage incentives, dynamic hedging adjustments, and the rapid deployment of liquid reserves during periods of market stress.`,
    onCoinGecko: "true",
    gecko_id: "nusd-2",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/neutrl",
    wiki: null,
    module: "neutrl-usd",
    doublecounted: true,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xe556aba6fe6036275ec1f87eda296be72c811bce"],
        },
      },
    },
  },
  {
    id: "347",
    name: "USDGO",
    address: "solana:72puLt71H93Z9CzHuBRTwFpL4TG3WZUhnoCC7p8gxigu",
    symbol: "USDGO",
    url: "https://www.usdgo.com/",
    description:
      "USDGO is a regulated, enterprise-grade stablecoin issued by Anchorage Digital Bank and distributed by OSL Group.",
    mintRedeemDescription:
      "Eligible users can exchange USD for USDGO and redeem USDGO for USD 1:1 through the issuer and distributor.",
    onCoinGecko: "true",
    gecko_id: "usdgo",
    cmcId: "39683",
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://x.com/usdgo_official",
    wiki: null,
    chainConfig: {
      chains: {
        solana: {
          issued: ["72puLt71H93Z9CzHuBRTwFpL4TG3WZUhnoCC7p8gxigu"],
        },
      },
    },
  },
  {
    id: "348",
    name: "Fidelity Digital Dollar",
    address: "0x7C135549504245B5eAe64fc0E99Fa5ebabb8e35D",
    symbol: "FIDD",
    url: "https://www.fidelitydigitalassets.com/stablecoin",
    description: `Fidelity Digital Dollar℠ (FIDD) is a stablecoin pegged 1:1 to the U.S. dollar and is issued by Fidelity Digital Assets, National Association, a subsidiary of Fidelity Investments®. FIDD is backed by the stringent operational standards of Fidelity Digital Assets® and draws on the history, principles, and expertise of the traditional Fidelity Investments® business.`,
    mintRedeemDescription: `FIDD can be bought and sold for $1 (in eligible jurisdictions) by institutional clients on the Fidelity Digital Assets platform, by retail customers through Fidelity Crypto®, and by advisors through Fidelity Crypto® for Wealth Managers.* It is also available on exchanges where FIDD is listed. Clients will not be able to transfer to addresses Fidelity Digital Assets has frozen/restricted on the blockchain, even if they hold FIDD off-platform.`,
    onCoinGecko: "true",
    gecko_id: "fidelity-digital-dollar",
    cmcId: "39549",
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: ["https://github.com/fidelity/mintable-token-ethereum-contract/blob/main/audits/Fidelity_Mintable_Token_Audit_Report-OpenZeppelin.pdf"],
    twitter: "https://x.com/digitalassets",
    wiki: null,
    module: "fidelity-digital-dollar",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x7C135549504245B5eAe64fc0E99Fa5ebabb8e35D"],
        },
      },
    },
  },
  {
    id: "349",
    name: "Pareto USP",
    address: "0x97ccc1c046d067ab945d3cf3cc6920d3b1e54c88",
    symbol: "USP",
    url: "https://pareto.credit",
    description: `Pareto USP is a synthetic dollar protocol soft-pegged to stablecoins backed by real-world, institutional-grade private credit, alongside a globally accessible savings asset, sUSP.`,
    mintRedeemDescription: `Users mint USP by depositing stablecoins (such as USDC or USDS) into the USP contract. The contract mints USP and deposits the underlying assets into Credit Vaults, which lend to institutional players executing yield strategies. Generated yield is later distributed to USP stakers (sUSP holders).`,
    onCoinGecko: "true",
    gecko_id: "pareto-usp",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/paretocredit",
    wiki: "https://docs.pareto.credit/product/usp",
    module: "pareto-usp",
    doublecounted: true,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x97ccc1c046d067ab945d3cf3cc6920d3b1e54c88"],
        },
      },
    },
  },
  {
    id: "350",
    name: "Citrea USD",
    address: "0x8D82c4E3c936C7B5724A382a9c5a4E6Eb7aB6d5D",
    symbol: "ctUSD",
    url: "https://citrea.xyz/",
    description: "ctUSD is the native, compliant stablecoin for the Citrea ecosystem, designed to serve as the foundational liquidity standard for Bitcoin applications. Issued by MoonPay, and fully backed 1:1 by U.S. Treasury bills and cash, it eliminates liquidity fragmentation while providing seamless banking rails between on-chain Bitcoin collateral and off-chain fiat systems.",
    mintRedeemDescription: "ctUSD issued through M0 technology, by MoonPay. Mint/Redeem facilitated on Citrea with M token.",
    onCoinGecko: "false",
    gecko_id: "citrea-usd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/citrea_xyz",
    wiki: "https://docs.citrea.xyz/developer-documentation/citrea-usd-ctusd",
    module: "citrea-ctusd",
    chainConfig: {
      chains: {
        citrea: {
          issued: ["0x8D82c4E3c936C7B5724A382a9c5a4E6Eb7aB6d5D"],
        },
      },
    },
  },
  {
    id: "351",
    name: "Tetris Money",
    address: "0xe103f85c23577675f82438a2866C7EE3bBC9c8C8",
    symbol: "RUBT",
    url: "https://tetris.money/",
    description: "RUBT is an ERC-20 token representing a digital claim denominated in Russian rubles. It is used as an on-chain instrument for exchanging ruble liquidity with other digital assets within a regulated operational framework.",
    mintRedeemDescription: "Fiat-pegged digital claim (1 RUBT = 1 RUB). Legal form: on‑chain digital monetary claim representing a monetary obligation of the Issuer.",
    onCoinGecko: "false",
    gecko_id: "rubt",
    cmcId: null,
    pegType: "peggedRUB",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/Tetris_Money",
    wiki: "https://tetrismoney.gitbook.io/docs/en/whitepaper/summary",
    module: "rubt",
    chainConfig: {
      decimals: 6,
      chains: {
        ethereum: {
          issued: ["0xe103f85c23577675f82438a2866C7EE3bBC9c8C8"],
          unreleased: ["0xc92383f1283ccee38Ef8Ca783a82592E643adFBB"],
        },
        tron: {
          bridgedFromETH: ["TAufZEJdyKLBjBKAPCVBjciabaTci2sUPv"],
        },
        hyperliquid: {
          bridgedFromETH: ["0xead4BCe5B9b5777cDc45B94DFa88209dE7A4EfBe"],
        },
      },
    },
  },
  {
    id: "352",
    name: "BRTH",
    address: "polygon:0x38fd02Dc840F099772392f2DFe3A3BEE9Aab3AB7",
    symbol: "BRTH",
    url: "https://brth.tokenhaus.com.br",
    description: "BRTH is a stablecoin pegged 1:1 to the Brazilian Real (BRL), deployed on the Polygon network. Fiat-backed by reserves held by Develop Ltda.",
    mintRedeemDescription: "BRTH is minted and redeemed through the issuer (Develop Ltda / TokenHaus). Authorized minters can mint new tokens backed by BRL reserves.",
    onCoinGecko: "false",
    gecko_id: "brth",
    cmcId: null,
    pegType: "peggedREAL",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://x.com/BRTH_stablecoin",
    wiki: null,
    module: "brth",
    chainConfig: {
      chains: {
        polygon: {
          issued: ["0x38fd02Dc840F099772392f2DFe3A3BEE9Aab3AB7"],
        },
      },
    },
  },
  {
    id: "353",
    name: "GAIB AID",
    address: "0x18f52b3fb465118731d9e0d276d4eb3599d57596",
    symbol: "AID",
    url: "https://aid.gaib.ai",
    description: "AI Dollar (AID) is a synthetic dollar fully backed by the U.S. Treasuries and stable assets and minted 1:1 by depositing USDC, USDT and other accepted stablecoins. It's the first product built on GAIB's economic layer, an entry point to GAIB's tokenized portfolio of AI infrastructure, and a base currency in the broader DeFi ecosystem.",
    mintRedeemDescription: "AID supports native mint/redeem flows on Ethereum, Arbitrum, Base, and BSC, with 1:1 reserve backing managed by GAIB.",
    onCoinGecko: "true",
    gecko_id: "gaib-aid",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: ["https://docs.gaib.ai/audits"],
    twitter: "https://x.com/gaib_ai",
    wiki: "https://docs.gaib.ai/",
    module: "gaib-aid",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x18f52b3fb465118731d9e0d276d4eb3599d57596"],
        },
        arbitrum: {
          issued: ["0x18f52b3fb465118731d9e0d276d4eb3599d57596"],
        },
        base: {
          issued: ["0x18f52b3fb465118731d9e0d276d4eb3599d57596"],
        },
        bsc: {
          issued: ["0x18f52b3fb465118731d9e0d276d4eb3599d57596"],
        },
      },
    },
  },
  {
    id: "354",
    name: "apxUSD",
    address: "0x98A878b1Cd98131B271883B390f68D2c90674665",
    symbol: "apxUSD",
    url: "https://apyx.fi",
    description: "apxUSD is Apyx's synthetic dollar backed by a diversified basket of low-volatility, variable-rate, preferred shares issued by industry leading Digital Asset Treasuries (DATs).",
    mintRedeemDescription: "apxUSD is minted when users deposit collateral through Apyx. It can be redeemed for underlying collateral at any time.",
    onCoinGecko: "true",
    gecko_id: "apxusd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://certificate.quantstamp.com/full/apx-usd-stablecoin/2a5be074-3d9f-49e7-aa08-46fb5f1e5bd6/index.html"],
    twitter: "https://x.com/apyx_fi",
    wiki: "https://docs.apyx.fi",
    module: "apxusd",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x98A878b1Cd98131B271883B390f68D2c90674665"],
        },
        base: {
          issued: ["0xd993935e13851dd7517af10687ec7e5022127228"],
        },
        bsc: {
          issued: ["0x6b3788fd6604bbf03c5378d24e57bb334baad4af"],
        },
      },
    },
  },
  {
    id: "355",
    name: "JPY Coin",
    address: "0xe7c3d8c9a439fede00d2600032d5db0be71c3c29",
    symbol: "JPYC",
    url: "https://corporate.jpyc.co.jp/en",
    description: "JPYC is a Japanese yen–denominated stablecoin issued by JPYC Inc. on public blockchains under Japanese regulatory licenses.",
    mintRedeemDescription: "JPYC is minted by JPYC Inc. after receiving JPY via bank transfer and redeemed through a regulated off-ramp process; issuance and redemption are centrally controlled by the licensed issuer.",
    onCoinGecko: "true",
    gecko_id: "jpycoin",
    cmcId: null,
    pegType: "peggedJPY",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/jpy_coin",
    wiki: "https://drive.google.com/file/d/1LDm-Pl3pxojqJVyMVriQ-_vh0o9zHYtP/view",
    module: "jpycoin",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xe7c3d8c9a439fede00d2600032d5db0be71c3c29"],
          unreleased: [
            "0x8549e82239a88f463ab6e55ad1895b629a00def3", // issuer wallet
            "0xb808af91bdc577bfb3f9c91470f3286dd076e5c1", // redemption wallet
          ],
        },
        avax: {
          issued: ["0xe7c3d8c9a439fede00d2600032d5db0be71c3c29"],
          unreleased: [
            "0x8549e82239a88f463ab6e55ad1895b629a00def3", // issuer wallet
            "0xb808af91bdc577bfb3f9c91470f3286dd076e5c1", // redemption wallet
          ],
        },
        polygon: {
          issued: ["0xe7c3d8c9a439fede00d2600032d5db0be71c3c29"],
          unreleased: [
            "0x8549e82239a88f463ab6e55ad1895b629a00def3", // issuer wallet
            "0xb808af91bdc577bfb3f9c91470f3286dd076e5c1", // redemption wallet
          ],
        },
        klaytn: {
          issued: ["0xe7c3d8c9a439fede00d2600032d5db0be71c3c29"],
          unreleased: [
            "0x8549e82239a88f463ab6e55ad1895b629a00def3", // issuer wallet
            "0xb808af91bdc577bfb3f9c91470f3286dd076e5c1", // redemption wallet
          ],
        },
      },
    },
  },
  {
    id: "356",
    name: "US Sonic Dollar",
    address: "0x000000000eCcFf26B795F73fb0A70d48da657fEf",
    symbol: "USSD",
    url: "https://www.soniclabs.com/ussd",
    description: "USSD is Sonic's flagship stablecoin - backed 1:1 by U.S. Treasuries and fully compliant with the GENIUS Act.",
    mintRedeemDescription: "Anyone can mint USSD by depositing supported USD assets at a 1:1 ratio, with zero minting fees.",
    onCoinGecko: "true",
    gecko_id: "us-sonic-dollar",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/SonicLabs",
    wiki: "https://blog.soniclabs.com/ussd-sonics-native-permissionless-usd-stablecoin-built-with-frax/",
    module: "us-sonic-dollar",
    doublecounted: true,
    chainConfig: {
      chains: {
        sonic: {
          issued: ["0x000000000eCcFf26B795F73fb0A70d48da657fEf"],
        },
      },
    },
  },
  {
    id: "357",
    name: "Bytecash",
    address: "chia:ae1536f56760e471ad85ead45f00d680ff9cca73b8cc3407be778f1c0c606eac",
    symbol: "BYC",
    url: "https://circuitdao.com",
    description:
      "Bytecash (BYC) is a USD-pegged stablecoin natively issued by Circuit, a CDP protocol on Chia. BYC is overcollateralized with XCH, the native coin of Chia.",
    mintRedeemDescription:
      "BYC gets minted when users borrow against collateral they have deposited. BYC gets melted when debt is being repaid.",
    onCoinGecko: "false",
    gecko_id: null,
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: [
      "https://github.com/circuitdao/puzzles/blob/main/audits/Zellic-Audit-Report.pdf",
      "https://github.com/circuitdao/puzzles/blob/main/audits/Immunefi-invite-only-audit.pdf",
      "https://github.com/circuitdao/puzzles/blob/main/audits/Cantina-public-competition-audit.pdf",
      "https://cantina.xyz/bounties/8f671963-4313-4ac3-aed9-3186a240b75a"
    ],
    twitter: "https://x.com/Circuit_DAO",
    wiki: "https://docs.circuitdao.com",
    module: "bytecash-byc",
  },
  {
    id: "358",
    name: "Mento British Pound",
    address: "celo:0xCCF663b1fF11028f0b19058d0f7B674004a40746",
    symbol: "GBPm",
    url: "https://app.mento.org/",
    description:
      "GBPm is a GBP-pegged synthetic stablecoin on Celo, part of the Mento Protocol. It is minted via Liquity v2-style CDPs: users deposit USDm as collateral and borrow GBPm against it.",
    mintRedeemDescription:
      "GBPm is minted by depositing collateral into a Mento CDP (trove) and borrowing GBPm against it. Repaying the borrowed GBPm closes or reduces the trove and releases the USDm collateral.",
    onCoinGecko: "true",
    gecko_id: "mento-british-pound",
    cmcId: null,
    pegType: "peggedGBP",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://docs.mento.org/mento-v3/dive-deeper/security/audit-reports"],
    twitter: "https://twitter.com/MentoLabs",
    module: "mento-british-pound",
    doublecounted: true,
    chainConfig: {
      chains: {
        celo: {
          issued: ["0xCCF663b1fF11028f0b19058d0f7B674004a40746"],
        },
        monad: {
          bridgedFromCelo: ["0x39bb4E0a204412bB98e821d25e7d955e69d40Fd1"],
        },
      },
    },
  },
  {
    id: "359",
    name: "Mento Philippine Peso",
    address: "celo:0x105d4a9306d2e55a71d2eb95b81553ae1dc20d7b",
    symbol: "PHPm",
    url: "https://app.mento.org/",
    description:
      "PHPm is a PHP-pegged synthetic stablecoin on Celo, part of the Mento Protocol. It is minted via Liquity v2-style CDPs: users deposit USDm as collateral and borrow PHPm against it.",
    mintRedeemDescription:
      "PHPm is minted by depositing collateral into a Mento CDP (trove) and borrowing PHPm against it. Repaying the borrowed PHPm closes or reduces the trove and releases the USDm collateral.",
    onCoinGecko: "true",
    gecko_id: "puso",
    cmcId: null,
    pegType: "peggedPHP",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://docs.mento.org/mento-v3/dive-deeper/security/audit-reports"],
    twitter: "https://twitter.com/MentoLabs",
    module: "mento-philippine-peso",
    doublecounted: true,
    chainConfig: {
      chains: {
        celo: {
          issued: ["0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B"],
        },
      },
    },
  },
  {
    id: "360",
    name: "Mento Canadian Dollar",
    address: "celo:0xff4ab19391af240c311c54200a492233052b6325",
    symbol: "CADm",
    url: "https://app.mento.org/",
    description:
      "CADm is a CAD-pegged synthetic stablecoin on Celo, part of the Mento Protocol. It is minted via Liquity v2-style CDPs: users deposit USDm as collateral and borrow CADm against it.",
    mintRedeemDescription:
      "CADm is minted by depositing collateral into a Mento CDP (trove) and borrowing CADm against it. Repaying the borrowed CADm closes or reduces the trove and releases the USDm collateral.",
    onCoinGecko: "true",
    gecko_id: "celo-canadian-dollar",
    cmcId: null,
    pegType: "peggedCAD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://docs.mento.org/mento-v3/dive-deeper/security/audit-reports"],
    twitter: "https://twitter.com/MentoLabs",
    module: "mento-canadian-dollar",
    doublecounted: true,
    chainConfig: {
      chains: {
        celo: {
          issued: ["0xff4Ab19391af240c311c54200a492233052B6325"],
        },
      },
    },
  },
  {
    id: "361",
    name: "Mento Australian Dollar",
    address: "celo:0x7175504c455076f15c04a2f90a8e352281f492f9",
    symbol: "AUDm",
    url: "https://app.mento.org/",
    description:
      "AUDm is a AUD-pegged synthetic stablecoin on Celo, part of the Mento Protocol. It is minted via Liquity v2-style CDPs: users deposit USDm as collateral and borrow AUDm against it.",
    mintRedeemDescription:
      "AUDm is minted by depositing collateral into a Mento CDP (trove) and borrowing AUDm against it. Repaying the borrowed AUDm closes or reduces the trove and releases the USDm collateral.",
    onCoinGecko: "true",
    gecko_id: "celo-australian-dollar",
    cmcId: null,
    pegType: "peggedAUD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://docs.mento.org/mento-v3/dive-deeper/security/audit-reports"],
    twitter: "https://twitter.com/MentoLabs",
    module: "mento-australian-dollar",
    doublecounted: true,
    chainConfig: {
      chains: {
        celo: {
          issued: ["0x7175504c455076f15c04a2f90a8e352281f492f9"],
        },
      },
    },
  },
  {
    id: "362",
    name: "Mento Colombian Peso",
    address: "celo:0x8a567e2ae79ca692bd748ab832081c45de4041ea",
    symbol: "COPm",
    url: "https://app.mento.org/",
    description:
      "COPm is a COP-pegged synthetic stablecoin on Celo, part of the Mento Protocol. It is minted via Liquity v2-style CDPs: users deposit USDm as collateral and borrow COPm against it.",
    mintRedeemDescription:
      "COPm is minted by depositing collateral into a Mento CDP (trove) and borrowing COPm against it. Repaying the borrowed COPm closes or reduces the trove and releases the USDm collateral.",
    onCoinGecko: "true",
    gecko_id: "ccop",
    cmcId: null,
    pegType: "peggedCOP",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://docs.mento.org/mento-v3/dive-deeper/security/audit-reports"],
    twitter: "https://twitter.com/MentoLabs",
    module: "mento-colombian-peso",
    doublecounted: true,
    chainConfig: {
      chains: {
        celo: {
          issued: ["0x8A567e2aE79CA692Bd748aB832081C45de4041eA"],
        },
      },
    },
  },
  {
    id: "363",
    name: "Mento Japanese Yen",
    address: "celo:0xc45ecf20f3cd864b32d9794d6f76814ae8892e20",
    symbol: "JPYm",
    url: "https://app.mento.org/",
    description:
      "JPYm is a JPY-pegged synthetic stablecoin on Celo, part of the Mento Protocol. It is minted via Liquity v2-style CDPs: users deposit USDm as collateral and borrow JPYm against it.",
    mintRedeemDescription:
      "JPYm is minted by depositing collateral into a Mento CDP (trove) and borrowing JPYm against it. Repaying the borrowed JPYm closes or reduces the trove and releases the USDm collateral.",
    onCoinGecko: "true",
    gecko_id: "celo-japanese-yen",
    cmcId: null,
    pegType: "peggedJPY",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://docs.mento.org/mento-v3/dive-deeper/security/audit-reports"],
    twitter: "https://twitter.com/MentoLabs",
    module: "mento-japanese-yen",
    doublecounted: true,
    chainConfig: {
      chains: {
        celo: {
          issued: ["0xc45ecf20f3cd864b32d9794d6f76814ae8892e20"],
        },
        monad: {
          issued: ["0x22f6A6752800eAB67b84748FeFc3cC658384aF72"],
        },
      },
    },
  },
  {
    id: "364",
    name: "Whale Asset Dollar",
    address: "algorand:3334160924",
    symbol: "WAD",
    url: "https://dork.fi",
    description: "WAD is an overcollateralized stablecoin minted through DorkFi, a cross-chain borrow/lend protocol on the Algorand Virtual Machine (AVM). Users deposit collateral assets and borrow WAD at controlled interest rates.",
    mintRedeemDescription: "WAD is minted by depositing accepted collateral (ALGO, USDC, UNIT, VOI) into DorkFi lending pools. WAD can be repaid at any time to reclaim collateral. The protocol uses utilization-based dynamic interest rates.",
    onCoinGecko: "false",
    gecko_id: null,
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/dork_fi",
    wiki: "https://docs.dork.fi",
    module: "wad-stablecoin",
  },
  {
    id: "365",
    name: "BRLA Digital",
    address: "polygon:0xe6a537a407488807f0bbeb0038b79004f19dddfb",
    symbol: "BRLA",
    url: "https://avenia.io/",
    description: "BRLA is a stablecoin pegged 1:1 to the Brazilian Real (BRL), issued by Avenia and backed by audited fiat reserves.",
    mintRedeemDescription: "BRLA can be minted and redeemed 1:1 for Brazilian Reais. Reserves are held in Brazil and audited by a third-party firm.",
    onCoinGecko: "true",
    gecko_id: "brla-digital-brla",
    cmcId: null,
    pegType: "peggedREAL",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: ["https://brladigital.notion.site/BRLA-Transparency-Page-238ba143aa2f4338902ee91ebe50298a"],
    twitter: "https://x.com/aveniaio",
    wiki: "",
    module: "brla-digital-brla",
    chainConfig: {
      chains: {
        polygon: {
          issued: ["0xe6a537a407488807f0bbeb0038b79004f19dddfb"],
        },
        xdai: {
          issued: ["0xfecb3f7c54e2caae9dc6ac9060a822d47e053760"],
        },
        celo: {
          issued: ["0xfecb3f7c54e2caae9dc6ac9060a822d47e053760"],
        },
        moonbeam: {
          issued: ["0xfeb25f3fddad13f82c4d6dbc1481516f62236429"],
        },
      },
    },
  },
  {
    id: "366",
    name: "Alto DUSD",
    address: "0x63d74d22E689C715a04F2C13962b1f77F443d35b",
    symbol: "DUSD",
    url: "https://altofoundation.org/",
    description:
      "DUSD is a crypto-backed stablecoin pegged to the US Dollar, issued through the Alto lending protocol. It is minted against collateral assets deposited into Alto markets and can be redeemed 1:1 for USDC via the Permissionless PSM, subject to available USDC liquidity.",
    mintRedeemDescription:
      "Users mint DUSD by depositing collateral into Alto mint markets. DUSD is burned when the loan is repaid. DUSD can also be exchanged 1:1 for USDC through the Permissionless PSM, subject to available USDC liquidity in the PSM.",
    onCoinGecko: "true",
    gecko_id: "alto-dusd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    auditLinks: ["https://github.com/altomoney/Security-Review-Engagements"],
    priceSource: "defillama",
    twitter: "https://x.com/alto_money",
    wiki: "https://docs.alto.money/",
    module: "alto-dusd",
    doublecounted: true,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x63d74d22E689C715a04F2C13962b1f77F443d35b"],
        },
      },
    },
  },
  {
    id: "367",
    name: "Mento Kenyan Shilling",
    address: "celo:0x456a3D042C0DbD3db53D5489e98dFb038553B0d0",
    symbol: "KESm",
    url: "https://app.mento.org/",
    description:
      "KESm is a KES-pegged synthetic stablecoin on Celo, part of the Mento Protocol. It is minted via Liquity v2-style CDPs: users deposit USDm as collateral and borrow KESm against it.",
    mintRedeemDescription:
      "KESm is minted by depositing collateral into a Mento CDP (trove) and borrowing KESm against it. Repaying the borrowed cKES closes or reduces the trove and releases the USDm collateral.",
    onCoinGecko: "true",
    gecko_id: "celo-kenyan-shilling",
    cmcId: null,
    pegType: "peggedKES",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://docs.mento.org/mento-v3/dive-deeper/security/audit-reports"],
    twitter: "https://twitter.com/MentoLabs",
    module: "mento-kenyan-shilling",
    doublecounted: true,
    chainConfig: {
      chains: {
        celo: {
          issued: ["0x456a3D042C0DbD3db53D5489e98dFb038553B0d0"],
        },
      },
    },
  },
  {
    id: "368",
    name: "Mento South African Rand",
    address: "celo:0x4c35853A3B4e647fD266f4de678dCc8fEC410BF6",
    symbol: "ZARm",
    url: "https://app.mento.org/",
    description:
      "ZARm is a ZAR-pegged synthetic stablecoin on Celo, part of the Mento Protocol. It is minted via Liquity v2-style CDPs: users deposit USDm as collateral and borrow ZARm against it.",
    mintRedeemDescription:
      "ZARm is minted by depositing collateral into a Mento CDP (trove) and borrowing ZARm against it. Repaying the borrowed ZARm closes or reduces the trove and releases the USDm collateral.",
    onCoinGecko: "true",
    gecko_id: "celo-south-african-rand",
    cmcId: null,
    pegType: "peggedZAR",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://docs.mento.org/mento-v3/dive-deeper/security/audit-reports"],
    twitter: "https://twitter.com/MentoLabs",
    module: "mento-south-african-rand",
    doublecounted: true,
    chainConfig: {
      chains: {
        celo: {
          issued: ["0x4c35853A3B4e647fD266f4de678dCc8fEC410BF6"],
        },
      },
    },
  },
  {
    id: "369",
    name: "Mento Nigerian Naira",
    address: "celo:0xE2702Bd97ee33c88c8f6f92DA3B733608aa76F71",
    symbol: "NGNm",
    url: "https://app.mento.org/",
    description:
      "NGNm is a NGN-pegged synthetic stablecoin on Celo, part of the Mento Protocol. It is minted via Liquity v2-style CDPs: users deposit USDm as collateral and borrow NGNm against it.",
    mintRedeemDescription:
      "NGNm is minted by depositing collateral into a Mento CDP (trove) and borrowing cNGN against it. Repaying the borrowed NGNm closes or reduces the trove and releases the USDm collateral.",
    onCoinGecko: "true",
    gecko_id: "celo-nigerian-naira",
    cmcId: null,
    pegType: "peggedNGN",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://docs.mento.org/mento-v3/dive-deeper/security/audit-reports"],
    twitter: "https://twitter.com/MentoLabs",
    module: "mento-nigerian-naira",
    doublecounted: true,
    chainConfig: {
      chains: {
        celo: {
          issued: ["0xE2702Bd97ee33c88c8f6f92DA3B733608aa76F71"],
        },
      },
    },
  },
  {
    id: "370",
    name: "Mento Swiss Franc",
    address: "celo:0xb55a79F398E759E43C95b979163f30eC87Ee131D",
    symbol: "CHFm",
    url: "https://app.mento.org/",
    description:
      "CHFm is a CHF-pegged synthetic stablecoin on Celo, part of the Mento Protocol. It is minted via Liquity v2-style CDPs: users deposit USDm as collateral and borrow CHFm against it.",
    mintRedeemDescription:
      "CHFm is minted by depositing collateral into a Mento CDP (trove) and borrowing CHFm against it. Repaying the borrowed CHFm closes or reduces the trove and releases the USDm collateral.",
    onCoinGecko: "true",
    gecko_id: "celo-swiss-franc",
    cmcId: null,
    pegType: "peggedCHF",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://docs.mento.org/mento-v3/dive-deeper/security/audit-reports"],
    twitter: "https://twitter.com/MentoLabs",
    module: "mento-swiss-franc",
    doublecounted: true,
    chainConfig: {
      chains: {
        celo: {
          issued: ["0xb55a79F398E759E43C95b979163f30eC87Ee131D"],
        },
        monad: {
          issued: ["0xF64e91fFEf7ef43aA314F0Bc2AC39f770797990C"],
        },
      },
    },
  },
  {
    id: "371",
    name: "Mento West African CFA Franc",
    address: "celo:0x73F93dcc49cB8A239e2032663e9475dd5ef29A08",
    symbol: "XOFm",
    url: "https://app.mento.org/",
    description:
      "XOFm is a XOF-pegged synthetic stablecoin on Celo, part of the Mento Protocol. It is minted via Liquity v2-style CDPs: users deposit USDm as collateral and borrow XOFm against it.",
    mintRedeemDescription:
      "XOFm is minted by depositing collateral into a Mento CDP (trove) and borrowing XOFm against it. Repaying the borrowed XOFm closes or reduces the trove and releases the USDm collateral.",
    onCoinGecko: "true",
    gecko_id: "celo-west-african-cfa-franc",
    cmcId: null,
    pegType: "peggedXOF",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://docs.mento.org/mento-v3/dive-deeper/security/audit-reports"],
    twitter: "https://twitter.com/MentoLabs",
    module: "mento-west-african-cfa-franc",
    doublecounted: true,
    chainConfig: {
      chains: {
        celo: {
          issued: ["0x73F93dcc49cB8A239e2032663e9475dd5ef29A08"],
        },
      },
    },
  },
  {
    id: "372",
    name: "Mento Ghanaian Cedi",
    address: "celo:0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313",
    symbol: "GHSm",
    url: "https://app.mento.org/",
    description:
      "GHSm is a GHS-pegged synthetic stablecoin on Celo, part of the Mento Protocol. It is minted via Liquity v2-style CDPs: users deposit USDm as collateral and borrow GHSm against it.",
    mintRedeemDescription:
      "GHSm is minted by depositing collateral into a Mento CDP (trove) and borrowing GHSm against it. Repaying the borrowed GHSm closes or reduces the trove and releases the USDm collateral.",
    onCoinGecko: "true",
    gecko_id: "celo-ghanaian-cedi",
    cmcId: null,
    pegType: "peggedGHS",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://docs.mento.org/mento-v3/dive-deeper/security/audit-reports"],
    twitter: "https://twitter.com/MentoLabs",
    module: "mento-ghanaian-cedi",
    doublecounted: true,
    chainConfig: {
      chains: {
        celo: {
          issued: ["0xfAeA5F3404bbA20D3cc2f8C4B0A888F55a3c7313"],
        },
      },
    },
  },
  {
    id: "373",
    name: "Sui Dollar",
    address: "sui:0x44f838219cf67b058f3b37907b655f226153c18e33dfcd0da559a844fea9b1c1::usdsui::USDSUI",
    symbol: "USDSUI",
    url: "https://www.sui.io",
    description:
      "Sui Dollar (USDsui) is designed to be a foundational digital dollar on Sui",
    mintRedeemDescription:
      "USDsui is minted when a user deposits USD through Bridge's API, the funds are held in cash and Treasury reserves, and an equivalent amount of USDsui is issued on Sui. Redeeming is the reverse: the tokens are burned on-chain and the user receives USD back. Both operations are 1:1 and handled entirely through Bridge (a Stripe company).",
    onCoinGecko: "true",
    gecko_id: "usdsui",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    twitter: "https://x.com/SuiNetwork",
    module: "usdsui",
  },
  {
    id: "374",
    name: "Phoenix USD",
    address: "0xf3B5B661b92B75C71fA5Aba8Fd95D7514A9CD605",
    symbol: "phUSD",
    url: "https://phusd.behodler.io",
    description:
      "phUSD is a USD stablecoin on Ethereum backed 1:1 by a basket of yield-bearing stablecoin collateral (DOLA and USDC) held in ERC4626 yield strategies. Deposits earn yield which is streamed to phUSD stakers via the Phlimbo yield farm.",
    mintRedeemDescription:
      "phUSD is minted 1:1 by depositing supported stablecoins (DOLA, USDC) through PhusdStableMinter. The underlying stablecoins are routed into ERC4626 yield strategies (AutoDOLA, AutoUSDC). phUSD is not redeemable.",
    onCoinGecko: "false",
    gecko_id: "phusd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: null,
    wiki: null,
    module: "phusd",
    doublecounted: true,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xf3B5B661b92B75C71fA5Aba8Fd95D7514A9CD605"],
        },
      },
    },
  },
  {
    id: "375",
    name: "Monet USDmo",
    address: "eden:0x9fa8c4d9f33dcce6eacefb6d5cf9736350a330b1",
    symbol: "USDMO",
    url: "https://monet.cash/",
    description:
      "USDmo is the USD stablecoin of Monet. It is a decentralized, overcollateralized asset backed by a basket of cryptocurrencies and stablecoins, including yield-bearing versions such as Morpho vaults.",
    mintRedeemDescription:
      "The issuance and redemption of USDmo are currently managed by Monet modules. USDmo is deployed on Eden.",
    onCoinGecko: "false",
    gecko_id: null,
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://docs.monet.cash/security/audits"],
    twitter: "https://x.com/monetdotcash",
    wiki: "https://docs.monet.cash/products/stablecoins-and-savings/usdmo-and-susdmo",
    module: "monet-usdmo",
    doublecounted: true,
    chainConfig: {
      chains: {
        eden: {
          issued: ["0x9fa8c4d9f33dcce6eacefb6d5cf9736350a330b1"],
        },
      },
    },
  },
  {
    id: "376",
    name: "eSui Dollar",
    address: "sui:0x41d587e5336f1c86cad50d38a7136db99333bb9bda91cea4ba69115defeb1402::sui_usde::SUI_USDE",
    symbol: "suiUSDe",
    url: "https://www.sui.io/",
    description:
      "eSui Dollar (suiUSDe) is a Sui-native synthetic dollar issued in collaboration with Ethena Labs and integrated across Sui DeFi, including DeepBook Margin for margin trading, lending, and leveraged DeFi strategies.",
    mintRedeemDescription:
      "suiUSDe can be minted by KYCed users depositing USDC into the issuer mint contract, which mints new suiUSDe at a 1:1 ratio, minus any applicable mint fee. The USDC is then managed by the issuer, with part kept as a redemption buffer and the rest used to acquire USDe from Ethena or moved to custody. KYCed users can redeem suiUSDe through the mint contract for USDC, assuming the available USDC buffer is sufficient for the redemption amount.",
    onCoinGecko: "true",
    gecko_id: "esui-dollar",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://docs.monet.cash/security/audits"],
    twitter: "https://x.com/suinetwork",
    wiki: "https://blog.sui.io/esui-dollar-suiusde-deepbook-margin/",
    module: "sui-usde",
    doublecounted: true,
    chainConfig: {
      chains: {
        sui: {
          issued: ["0x41d587e5336f1c86cad50d38a7136db99333bb9bda91cea4ba69115defeb1402::sui_usde::SUI_USDE"],
        },
      },
    },
  },
  {
    id: "377",
    name: "Nerona USD",
    address: "0xD48e565561416dE59DA1050ED70b8d75e8eF28f9",
    symbol: "USDnr",
    url: "https://app.nerona.xyz/",
    description: "A digital dollar fully backed by short-duration US Treasury bills via M0, redeemable 1:1 for USD.",
    mintRedeemDescription: "USDnr issued through M0 technology, by MoonPay. Mint/Redeem facilitated on Ethereum and Fluent with M token.",
    onCoinGecko: "false",
    gecko_id: null,
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/Neronaxyz",
    wiki: "https://docs.nerona.xyz/welcome",
    module: "nerona-usdnr",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xD48e565561416dE59DA1050ED70b8d75e8eF28f9"],
        },
        fluent: {
          issued: ["0xD48e565561416dE59DA1050ED70b8d75e8eF28f9"],
        },
      },
    },
  },
  {
    id: "378",
    name: "USD Somnia",
    address: "somnia:0x00000022da000002656c64d9ea6011ea952d008a",
    symbol: "USDso",
    url: "https://somnia.network/usdso-stablecoin",
    description:
      "USDso is a USD-pegged stablecoin available on the Somnia network. Minting and redemption are operated by Frax through its FraxNet branded-stablecoin program: USDso is collateralized 1:1 by frxUSD held in a Frax-operated BrandedCustodian vault on Somnia, with frxUSD's reserves consisting primarily of tokenized US Treasuries (BUIDL, USTB, USCC, WTGXX, JTRSY) and cash equivalents.",
    mintRedeemDescription:
      "Minting and redemption are handled by Frax on Somnia through the BrandedCustodian (an ERC-4626 vault): frxUSD is deposited 1:1 to receive USDso, and USDso can be burned via the same vault to receive the equivalent frxUSD. Cross-chain mint and redeem with USDC on supported chains is provided through Frax's orchestration API and CrossChainRouter.",
    onCoinGecko: "false",
    gecko_id: "usd-somnia",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://x.com/Somnia_Network",
    wiki: null,
    module: "usd-somnia",
    doublecounted: true,
    chainConfig: {
      decimals: 18,
      chains: {
        somnia: {
          issued: ["0x00000022dA000002656c64D9eA6011ea952D008A"],
        },
      },
    },
  },
  {
    id: "379",
    name: "Argentine Peso",
    address: "0x0dc4f92879b7670e5f4e4e6e3c801d229129d90d",
    symbol: "WARS",
    url: "https://www.ripio.com/en/cryptos/local-stablecoins",
    description: "Argentine Peso stablecoin.",
    mintRedeemDescription: "Issued by Ripio with a 1:1 peg to the Argentine peso. Each wARS is backed by liquid instruments denominated in ARS held in Argentine bank accounts, with reserves periodically attested by local public accountants. Users mint and redeem by on/off-ramping ARS through Ripio's platform.",
    onCoinGecko: "true",
    gecko_id: "argentine-peso",
    cmcId: 39901,
    pegType: "peggedARS",
    pegMechanism: "fiat-backed",
    priceSource: "coingecko",
    twitter: "https://x.com/RipioApp",
    wiki: "https://www.ripio.com/en/cryptocurrencies/wars",
    module: "argentine-peso",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x0dc4f92879b7670e5f4e4e6e3c801d229129d90d"],
        },
        bsc: {
          issued: ["0x0dc4f92879b7670e5f4e4e6e3c801d229129d90d"],
        },
        base: {
          issued: ["0x0dc4f92879b7670e5f4e4e6e3c801d229129d90d"],
        },
        xdai: {
          issued: ["0x0dc4f92879b7670e5f4e4e6e3c801d229129d90d"],
        },
        polygon: {
          issued: ["0x0dc4f92879b7670e5f4e4e6e3c801d229129d90d"],
        },
        wc: {
          issued: ["0x0dc4f92879b7670e5f4e4e6e3c801d229129d90d"],
        },
      },
    },
  },
  {
    id: "380",
    name: "Brazilian Real",
    address: "0xD76f5Faf6888e24D9F04Bf92a0c8B921FE4390e0",
    symbol: "WBRL",
    url: "https://www.ripio.com/en/cryptos/local-stablecoins",
    description: "Brazilian Real stablecoin.",
    mintRedeemDescription: "Issued by Ripio with a 1:1 peg to the Brazilian real. Each wBRL is backed by liquid instruments denominated in BRL held in Brazilian bank accounts, with reserves periodically attested by local public accountants. Users mint and redeem by on/off-ramping BRL through Ripio's platform.",
    onCoinGecko: "true",
    gecko_id: "brazilian-real",
    cmcId: null,
    pegType: "peggedREAL",
    pegMechanism: "fiat-backed",
    priceSource: "coingecko",
    twitter: "https://x.com/RipioApp",
    wiki: "https://www.ripio.com/en/cryptocurrencies/wbrl",
    module: "brazilian-real",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xD76f5Faf6888e24D9F04Bf92a0c8B921FE4390e0"],
        },
        bsc: {
          issued: ["0xD76f5Faf6888e24D9F04Bf92a0c8B921FE4390e0"],
        },
        base: {
          issued: ["0xD76f5Faf6888e24D9F04Bf92a0c8B921FE4390e0"],
        },
        xdai: {
          issued: ["0xD76f5Faf6888e24D9F04Bf92a0c8B921FE4390e0"],
        },
        polygon: {
          issued: ["0xD76f5Faf6888e24D9F04Bf92a0c8B921FE4390e0"],
        },
        wc: {
          issued: ["0xD76f5Faf6888e24D9F04Bf92a0c8B921FE4390e0"],
        },
      },
    },
  },
  {
    id: "381",
    name: "Chilean Peso",
    address: "0x61D450a098b6a7f69fC4b98CE68198fe59768651",
    symbol: "WCLP",
    url: "https://www.ripio.com/en/cryptos/local-stablecoins",
    description: "Chilean Peso stablecoin.",
    mintRedeemDescription: "Issued by Ripio with a 1:1 peg to the Chilean peso. Each wCLP is backed by liquid instruments denominated in CLP held in Chilean bank accounts, with reserves periodically attested by local public accountants. Users mint and redeem by on/off-ramping CLP through Ripio's platform.",
    onCoinGecko: "true",
    gecko_id: "chilean-peso",
    cmcId: null,
    pegType: "peggedCLP",
    pegMechanism: "fiat-backed",
    priceSource: "coingecko",
    twitter: "https://x.com/RipioApp",
    wiki: "",
    module: "chilean-peso",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x61D450a098b6a7f69fC4b98CE68198fe59768651"],
        },
        bsc: {
          issued: ["0x61D450a098b6a7f69fC4b98CE68198fe59768651"],
        },
        base: {
          issued: ["0x61D450a098b6a7f69fC4b98CE68198fe59768651"],
        },
        xdai: {
          issued: ["0x61D450a098b6a7f69fC4b98CE68198fe59768651"],
        },
        polygon: {
          issued: ["0x61D450a098b6a7f69fC4b98CE68198fe59768651"],
        },
        wc: {
          issued: ["0x61D450a098b6a7f69fC4b98CE68198fe59768651"],
        },
      },
    },
  },
  {
    id: "382",
    name: "Colombian Peso",
    address: "0x8a1D45e102e886510e891d2Ec656a708991e2D76",
    symbol: "WCOP",
    url: "https://www.ripio.com/en/cryptos/local-stablecoins",
    description: "Colombian Peso stablecoin.",
    mintRedeemDescription: "Issued by Ripio with a 1:1 peg to the Colombian peso. Each wCOP is backed by liquid instruments denominated in COP held in Colombian bank accounts, with reserves periodically attested by local public accountants. Users mint and redeem by on/off-ramping COP through Ripio's platform.",
    onCoinGecko: "true",
    gecko_id: "colombian-peso",
    cmcId: null,
    pegType: "peggedCOP",
    pegMechanism: "fiat-backed",
    priceSource: "coingecko",
    twitter: "https://x.com/RipioApp",
    wiki: "https://www.ripio.com/en/cryptocurrencies/wcop",
    module: "colombian-peso",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x8a1D45e102e886510e891d2Ec656a708991e2D76"],
        },
        bsc: {
          issued: ["0x8a1D45e102e886510e891d2Ec656a708991e2D76"],
        },
        base: {
          issued: ["0x8a1D45e102e886510e891d2Ec656a708991e2D76"],
        },
        xdai: {
          issued: ["0x8a1D45e102e886510e891d2Ec656a708991e2D76"],
        },
        polygon: {
          issued: ["0x8a1D45e102e886510e891d2Ec656a708991e2D76"],
        },
        wc: {
          issued: ["0x8a1D45e102e886510e891d2Ec656a708991e2D76"],
        },
      },
    },
  },
  {
    id: "383",
    name: "Mexican Peso",
    address: "0x337e7456b420bd3481e7fa61fa9850343d610d34",
    symbol: "WMXN",
    url: "https://www.ripio.com/en/cryptos/local-stablecoins",
    description: "Mexican Peso stablecoin.",
    mintRedeemDescription: "Issued by Ripio with a 1:1 peg to the Mexican peso. Each wMXN is backed by liquid instruments denominated in MXN held in Mexican bank accounts, with reserves periodically attested by local public accountants. Users mint and redeem by on/off-ramping MXN through Ripio's platform.",
    onCoinGecko: "true",
    gecko_id: "mexican-peso",
    cmcId: null,
    pegType: "peggedMXN",
    pegMechanism: "fiat-backed",
    priceSource: "coingecko",
    twitter: "https://x.com/RipioApp",
    wiki: "https://www.ripio.com/en/cryptocurrencies/wmxn",
    module: "mexican-peso",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x337e7456b420bd3481e7fa61fa9850343d610d34"],
        },
        bsc: {
          issued: ["0x337e7456b420bd3481e7fa61fa9850343d610d34"],
        },
        base: {
          issued: ["0x337e7456b420bd3481e7fa61fa9850343d610d34"],
        },
        xdai: {
          issued: ["0x337e7456b420bd3481e7fa61fa9850343d610d34"],
        },
        polygon: {
          issued: ["0x337e7456b420bd3481e7fa61fa9850343d610d34"],
        },
        wc: {
          issued: ["0x337e7456b420bd3481e7fa61fa9850343d610d34"],
        },
      },
    },
  },
  {
    id: "384",
    name: "Peruvian Sol",
    address: "0x4F34c8b3b5FB6D98Da888F0feA543d4d9C9F2eBE",
    symbol: "WPEN",
    url: "https://www.ripio.com/en/cryptos/local-stablecoins",
    description: "Peruvian Sol stablecoin.",
    mintRedeemDescription: "Issued by Ripio with a 1:1 peg to the Peruvian sol. Each wPEN is backed by liquid instruments denominated in PEN held in Peruvian bank accounts, with reserves periodically attested by local public accountants. Users mint and redeem by on/off-ramping PEN through Ripio's platform.",
    onCoinGecko: "true",
    gecko_id: "peruvian-sol",
    cmcId: null,
    pegType: "peggedPEN",
    pegMechanism: "fiat-backed",
    priceSource: "coingecko",
    twitter: "https://x.com/RipioApp",
    wiki: "",
    module: "peruvian-sol",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x4F34c8b3b5FB6D98Da888F0feA543d4d9C9F2eBE"],
        },
        bsc: {
          issued: ["0x4F34c8b3b5FB6D98Da888F0feA543d4d9C9F2eBE"],
        },
        base: {
          issued: ["0x4F34c8b3b5FB6D98Da888F0feA543d4d9C9F2eBE"],
        },
        xdai: {
          issued: ["0x4F34c8b3b5FB6D98Da888F0feA543d4d9C9F2eBE"],
        },
        polygon: {
          issued: ["0x4F34c8b3b5FB6D98Da888F0feA543d4d9C9F2eBE"],
        },
        wc: {
          issued: ["0x4F34c8b3b5FB6D98Da888F0feA543d4d9C9F2eBE"],
        },
      },
    },
  },
  {
    id: "385",
    name: "PathUSD",
    address: "tempo:0x20c0000000000000000000000000000000000000",
    symbol: "pathUSD",
    url: "https://tempo.xyz/",
    description:
      "PathUSD is the first native TIP-20 stablecoin on Tempo Mainnet, predeployed at genesis at 0x20c0000000000000000000000000000000000000. It anchors the chain's quote-token chain and is the default fee token for users that haven't configured one. PathUSD is the price-discovery anchor for Tempo's enshrined Stablecoin DEX (CLOB at 0xdec0000000000000000000000000000000000000) and the Fee AMM (precompile at 0xfeec000000000000000000000000000000000000).",
    mintRedeemDescription:
      "PathUSD is issued by Bridge (Stripe's regulated stablecoin issuer) and backed 1:1 by USD-denominated reserves. Per Tempo's protocol docs (https://docs.tempo.xyz/protocol/exchange/quote-tokens#pathusd), pathUSD is minted by depositing USDC.e on Tempo and redeemed back to USDC through Bridge. Reserves are managed under Bridge's GENIUS-ready framework — short-dated US Treasuries, overnight T-bill repos, money market funds and cash, custodied via BlackRock, Fidelity, and Superstate. On-chain: TIP-20 RBAC enforces ISSUER_ROLE; CoinMarketCap classifies pathUSD under its 'Asset-Backed Stablecoin' tag.",
    onCoinGecko: "true",
    gecko_id: "pathusd",
    cmcId: "39734",
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://x.com/tempo_xyz",
    wiki: "https://docs.tempo.xyz/",
    module: "pathusd",
    chainConfig: {
      chains: {
        tempo: {
          issued: ["0x20c0000000000000000000000000000000000000"],
        },
      },
    },
  },
  {
    id: "386",
    name: "Western Union USDPT",
    address: "solana:HVWf8JmLoHs99Lw8Psf3fyqAtA4crWxCPkrmSdNjhNH3",
    symbol: "USDPT",
    url: "https://www.westernunion.com/",
    description:
      "USDPT is a U.S. dollar-denominated payment stablecoin launched by Western Union, issued by Anchorage Digital Bank N.A. and built on Solana. It is designed for regulated digital payments, always-on settlement, exchange support, and treasury/agent settlement across Western Union's global payments network",
    mintRedeemDescription:
      "USDPT is fully backed by U.S. dollars and issued by Anchorage Digital Bank N.A., a federally regulated U.S. crypto bank",
    onCoinGecko: "true",
    gecko_id: "usdpt-western-union",
    cmcId: "38850",
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://x.com/WesternUnion",
    wiki: "https://ir.westernunion.com/news/archived-press-releases/press-release-details/2026/Western-Union-Launches-USDPT-on-Solana-Advancing-Regulated-Digital-Infrastructure-for-Global-Payments/default.aspx",
    module: "usdpt-western-union",
    chainConfig: {
      chains: {
        solana: {
          issued: ["HVWf8JmLoHs99Lw8Psf3fyqAtA4crWxCPkrmSdNjhNH3"],
        },
      },
    },
  },
  {
    id: "387",
    name: "CAD Digital",
    address: "0x16f93ebc5320c89efc8701577efe49d14a276a06",
    symbol: "CADD",
    url: "https://tetradg.com/cadd-stablecoin/",
    description:
      "CADD is a Canadian dollar-backed payment stablecoin issued by Tetra Trust Company via its agent CAD Digital Inc. It is backed 1:1 by Canadian dollars",
    mintRedeemDescription:
      "CADD is backed 1:1 by Canadian dollars, with minting funds held in trust and dedicated exclusively to redemption",
    onCoinGecko: "true",
    gecko_id: "cad-digital",
    cmcId: null,
    pegType: "peggedCAD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://x.com/TetraDigitalGrp",
    wiki: "https://tetradg.com/cadd-stablecoin/",
    module: "cad-digital",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x16f93ebc5320c89efc8701577efe49d14a276a06"],
        },
        base: {
          issued: ["0x16F93eBC5320C89EfC8701577efe49d14A276a06"],
        },
      },
    },
  },
  {
    id: "388",
    name: "Initia iUSD",
    address: "move:6c69733a9e722f3660afb524f89fce957801fa7e4408b8ef8fe89db9627b570e",
    symbol: "iUSD",
    url: "https://app.testnet.initia.xyz/iusd",
    description:
      "iUSD is the native stablecoin of the Initia network, backed 1:1 by Agora's AUSD bridged to Initia via LayerZero. Unlike traditional stablecoins where the yield from reserves accrues to the issuer, iUSD's yield flows back into the Initia ecosystem.",
    mintRedeemDescription:
      "iUSD is minted on Initia 1:1 against AUSD bridged in via LayerZero from Ethereum and Arbitrum. Holders can redeem iUSD by burning it on Initia to unlock the underlying AUSD, which can then be redeemed for USD through Agora.",
    onCoinGecko: "true",
    gecko_id: "iusd-2",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crytpo-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://x.com/initia",
    wiki: null,
    doublecounted: true,
    chainConfig: {
      decimals: 6,
      chains: {
        initia: {
          cosmosIssued: ["move/6c69733a9e722f3660afb524f89fce957801fa7e4408b8ef8fe89db9627b570e"],
        },
      },
    },
  },
  {
    id: "389",
    name: "CFX MoveUSD",
    address: "solana:3AdhVEX6k85yNivHVXDEiY3WyP2WgFQTUZCahGaeC2qm",
    symbol: "MOVEUSD",
    url: "https://cfx.to/",
    description:
      "MoveUSD is a USD-backed stablecoin issued by CFX Labs on Solana.",
    mintRedeemDescription:
      "CFX-issued digital assets are redeemable 1:1 for U.S. dollars.",
    onCoinGecko: "false",
    gecko_id: null,
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://x.com/MoveUSD",
    wiki: "https://docs.cfx.to/",
    module: "cfx-moveusd",
    chainConfig: {
      decimals: 6,
      chains: {
        solana: {
          issued: ["3AdhVEX6k85yNivHVXDEiY3WyP2WgFQTUZCahGaeC2qm"],
        },
      },
    },
  },
  {
    id: "390",
    name: "FinChain Dollar",
    address: "0x9f6714C302ffe3c3bAFaf2Ccb44201fF64f6371C",
    symbol: "FUSD",
    url: "https://fusd.finchain.global/",
    description:
      "FinChain Dollar (FUSD) is an RWA-backed stablecoin designed to maintain a USD peg across EVM networks.",
    mintRedeemDescription:
      "FUSD is minted and redeemed through FinChain protocol gateway contracts under protocol access controls and reserve constraints.",
    onCoinGecko: "false",
    gecko_id: null,
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: ["https://finchain.gitbook.io/finchain-docs/en/fusd/risks/smart-contract-risks"],
    twitter: "https://x.com/FinChain_CN",
    wiki: "https://finchain.gitbook.io/finchain-docs/en/fusd/introduction",
    module: "finchain-dollar",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x9f6714C302ffe3c3bAFaf2Ccb44201fF64f6371C"],
        },
        monad: {
          issued: ["0x9f6714C302ffe3c3bAFaf2Ccb44201fF64f6371C"],
        },
        sonic: {
          issued: ["0x9f6714C302ffe3c3bAFaf2Ccb44201fF64f6371C"],
        },
        avax: {
          issued: ["0x9f6714C302ffe3c3bAFaf2Ccb44201fF64f6371C"],
        },
        xsat: {
          issued: ["0x9f6714C302ffe3c3bAFaf2Ccb44201fF64f6371C"],
        },
      },
    },
  },
  {
    id: "391",
    name: "USDST",
    address: "strato:0x937efa7e3a77e20bbdbd7c0d32b6514f368c1010",
    symbol: "USDST",
    url: "https://strato.nexus/",
    description:
      "USDST is the native USD-pegged stablecoin of the STRATO chain (BlockApps Mercata), used as the unit of account across its DeFi suite (lending, savings, CDPs, AMM pools). STRATO is the chain/platform; there is no separate STRATO token.",
    mintRedeemDescription:
      "USDST is minted and redeemed 1:1 against USD by BlockApps and via the on-chain CDPEngine, which mints USDST against approved on-chain collateral and burns it on debt repayment.",
    onCoinGecko: "false",
    gecko_id: "usdst",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://x.com/strato_net",
    wiki: null,
    module: "usdst",
    chainConfig: {
      chains: {
        strato: {
          issued: ["0x937efa7e3a77e20bbdbd7c0d32b6514f368c1010"],
        },
      },
    },
  },
  {
    id: "392",
    name: "Newrails Euro",
    address: "monad:0x1111b3ded9f1fe1801ad4ebef8e2788183a24111",
    symbol: "EURW",
    url: "https://www.newrails.xyz/",
    description:
      "EURW is a MiCA-compliant Euro stablecoin issued by Newrails, an EU-licensed Electronic Money Institution regulated by the Bank of Lithuania. Each EURW token is fully backed 1:1 by Euro reserves.",
    mintRedeemDescription:
      "EURW token holders can redeem EURW for fiat Euros with 1:1 redeemability.",
    onCoinGecko: "true",
    gecko_id: "newrails-euro",
    cmcId: null,
    pegType: "peggedEUR",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://x.com/Newrails_xyz",
    wiki: null,
    chainConfig: {
      decimals: 6,
      chains: {
        monad: {
          issued: ["0x1111b3ded9f1fe1801ad4ebef8e2788183a24111"],
        },
      },
    },
  },
  {
    id: "393",
    name: "Harbor haEUR",
    address: "ethereum:0x83Fd69E0FF5767972b46E61C6833408361bF7346",
    symbol: "haEUR",
    url: "https://www.harborfinance.io/",
    description:
      "haEUR is a Harbor Anchored Token (haTOKEN): a synthetic euro stablecoin pegged via oracle feeds, fully collateralized and redeemable through Harbor Finance markets.",
    mintRedeemDescription:
      "Users mint haEUR by depositing approved collateral (e.g. fxUSD or stETH) into Harbor minters on Ethereum and burn haEUR to redeem collateral.",
    onCoinGecko: "false",
    gecko_id: null,
    cmcId: null,
    pegType: "peggedEUR",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://x.com/0xHarborFi",
    wiki: null,
    module: "haeur",
    yieldBearing: true,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x83Fd69E0FF5767972b46E61C6833408361bF7346"],
        },
      },
    },
  },
  {
    id: "394",
    name: "invUSD Stablecoin",
    address: "ethereum:0x5377680B5986296AA4F9e684e5315a4F24832e56",
    symbol: "invUSD",
    url: "https://app.monolith.market/1/coin/0",
    description:
      "Monolith Stablecoin backed by sINV launched on Monolith protocol by the Inverse Finance team.",
    mintRedeemDescription:
      "invUSD can be minted against sINV, when the loan is repaid to retrieve the collateral, the paid back invUSD is burned. invUSD can also be redeemed for collateral minus a redemption fee.",
    onCoinGecko: "true",
    gecko_id: "inverse-usd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/InverseFinance",
    wiki: "https://docs.monolith.market/protocol/stablecoin-factory",
    module: "inverse-usd",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x5377680B5986296AA4F9e684e5315a4F24832e56"],
        },
      },
    },
  },
  {
    id: "395",
    name: "fUSD",
    address: "0x1676b80edd36b18a3c3432c11ed25d37fde9c92a",
    symbol: "FUSD",
    url: "https://falcon.finance/",
    description: "fUSD is a GENIUS Act-compliant USD payment stablecoin issued by Anchorage Digital Bank, N.A. and distributed by Falcon Finance. Backed 1:1 by cash, short-dated U.S. Treasuries, and Treasury repos, with monthly Deloitte attestations.",
    mintRedeemDescription: "fUSD is minted and redeemed through Anchorage Digital Bank, N.A.",
    onCoinGecko: "true",
    gecko_id: "falcon-finance-usd",
    cmcId: "40048",
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    twitter: "https://x.com/falconfinance",
    module: "falcon-finance-usd",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x1676b80edd36b18a3c3432c11ed25d37fde9c92a"],
        },
        bsc: {
          issued: ["0x1676b80edd36b18a3c3432c11ed25d37fde9c92a"],
        },
      },
    },
  },
  {
    id: "396",
    name: "Deaderal Reserve Note",
    address: "ethereum:0x9Bc2C28DF6560C343d3fa9c152Bed80D4511DEAd",
    symbol: "USDeAD",
    url: "https://us.dead.box",
    description: "USDeAD is the stablecoin of Deaderal Reserve Protocol, minted by depositing ETH collateral.",
    mintRedeemDescription: "Users deposit WETH, wstETH, or rETH as collateral into DRP to mint USDeAD.",
    onCoinGecko: "false",
    gecko_id: "usdead",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://skynet.certik.com/projects/deaderal-reserve-protocol"],
    twitter: "https://x.com/USDeADBOX",
    wiki: null,
    module: "usdead",
    chainConfig: {
      decimals: 18,
      chains: {
        ethereum: {
          issued: ["0x9Bc2C28DF6560C343d3fa9c152Bed80D4511DEAd"],
        },
        base: {
          issued: ["0x9Bc2C28DF6560C343d3fa9c152Bed80D4511DEAd"],
        },
        optimism: {
          issued: ["0x9Bc2C28DF6560C343d3fa9c152Bed80D4511DEAd"],
        },
        arbitrum: {
          issued: ["0x9Bc2C28DF6560C343d3fa9c152Bed80D4511DEAd"],
        },
        bsc: {
          issued: ["0x9Bc2C28DF6560C343d3fa9c152Bed80D4511DEAd"],
        },
        scroll: {
          issued: ["0x9Bc2C28DF6560C343d3fa9c152Bed80D4511DEAd"],
        },
        megaeth: {
          issued: ["0x23A873d375a21Bb6649aa68FD664acBbDDBbdead"],
        },
        monad: {
          issued: ["0x41201e7083569de72dc057d960429cddb305dead"],
        },
        hyperliquid: {
          issued: ["0x7f71d0888defA07833E19f195D5c4A78e170F289"],
        },
        solana: {
          issued: ["CeALVyCeC6RdrRTAz21PVmMD6miUMdqGn8MevHGSC5sg"],
        },
        tron: {
          issued: ["TCReUYWrZCqxbBgJ2Ns7UKBA79gWeMVciJ"],
        },
      },
    },
  },
  {
    id: "397",
    name: "Hyperbeat USD",
    address: "hyperliquid:0x669abe85F96a9e3B34723F7Be9bC6F250aBC0Cc1",
    symbol: "beatUSD",
    url: "https://hyperbeat.org/",
    description:
      "Hyperbeat USD (beatUSD) is a treasury-backed stablecoin issued on HyperEVM through Hyperbeat's Liquid banking accounts.",
    mintRedeemDescription:
      "Every dollar deposited into a Hyperbeat Liquid banking account mints Hyperbeat USD, a treasury backed stablecoin.",
    onCoinGecko: "false",
    gecko_id: "beatusd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://x.com/hyperbeat",
    wiki: "https://docs.hyperbeat.org",
    module: "beatusd",
    doublecounted: true,
    chainConfig: {
      chains: {
        hyperliquid: {
          issued: ["0x669abe85F96a9e3B34723F7Be9bC6F250aBC0Cc1"],
        },
      },
    },
  },
  {
    id: "398",
    name: "Valtorum USD",
    address: "ripple:rfffsukWALJB1PXYk7H8xkR6UJUDT8nMJE",
    symbol: "USDV",
    url: "https://valtorum.com",
    description:
      "Valtorum USD (USDV) is a permissioned USD-pegged stablecoin issued by Valtorum across supported networks, including XRP Ledger, Stellar, TRON, Base, Polygon, and BNB Chain.",
    mintRedeemDescription:
      "Valtorum USD is issued and redeemed by Valtorum through supported issuer and contract accounts, subject to Valtorum's terms and compliance requirements.",
    onCoinGecko: "false",
    gecko_id: "valtorum-usdv",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: ["https://valtorum.com/por"],
    twitter: null,
    wiki: "https://valtorum.com/about/",
    module: "valtorum-usdv",
  },
  {
    id: "399",
    name: "Agant GBP",
    address: "0xbBe6aAB0Ed76e90AeA0d1cd978EC231c8AdCDF8b",
    symbol: "GBPA",
    url: "https://www.agant.io/gbpa",
    description:
      "Agant GBP (GBPA) is a pound sterling stablecoin issued by Agant Finance Limited, a UK-based issuer registered with the UK Financial Conduct Authority as a cryptoasset firm under the Money Laundering Regulations (FRN: 1037671). GBPA is designed to be fully backed and redeemable 1:1 for pound sterling, and used for GBP-denominated payments, settlement, treasury operations, and on-chain financial applications.",
    mintRedeemDescription:
      "Eligible clients can exchange GBP for GBPA and redeem GBPA for GBP through Agant Finance Limited, subject to Agant's terms, onboarding requirements, compliance checks, and applicable regulatory obligations.",
    onCoinGecko: "true",
    gecko_id: "agant-gbp",
    cmcId: null,
    pegType: "peggedGBP",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/AgantFinance",
    wiki: "https://docs.agant.io/XDREhsGKwMiuddKPr5Rt",
    module: "agant-gbp",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xbBe6aAB0Ed76e90AeA0d1cd978EC231c8AdCDF8b"],
        },
        base: {
          issued: ["0xbBe6aAB0Ed76e90AeA0d1cd978EC231c8AdCDF8b"],
        },
        solana: {
          issued: ["DYoCmA91VE8REbWNw3kM736PN7vv97qc2jr5wmUbuNtZ"],
        },
        tempo: {
          issued: ["0x20C0000000000000000000000a6Da882d075a4C3"],
        },
      },
    },
  },
  {
    id: "400",
    name: "Saturn Dollar",
    address: "0x23238f20b894f29041f48D88eE91131C395Aaa71",
    symbol: "USDAT",
    url: "https://saturn.credit/",
    description:
      "USDat is a stablecoin fully backed by Tokenized U.S. Treasuries and Stablecoins.",
    mintRedeemDescription:
      "To mint USDat, users must first complete Saturn's onboarding process. Only whitelisted addresses, both the depositor and the recipient, are permitted to interact with the protocol.",
    onCoinGecko: "true",
    gecko_id: "saturn-dollar",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://twitter.com/saturn_credit",
    wiki: "https://saturncredit.gitbook.io/saturn-docs/solution/usdat-overview",
    module: "saturn-dollar",
  },
  {
    id: "401",
    name: "Tori trUSD",
    address: "0xd0580192E98eA6CEB9c7b6191Ed2E27560911697",
    symbol: "trUSD",
    url: "https://tori.finance",
    description:
      "trUSD is a crypto-native synthetic dollar issued by Tori Finance that provides an embedded, performance-based yield and targets price stability through delta-neutral trading positions.",
    mintRedeemDescription:
      "Whitelisted users deposit eligible collateral with Tori Finance to mint trUSD, and redeem trUSD for collateral. Stability is targeted through delta-neutral hedging of the backing positions across trading venues.",
    onCoinGecko: true,
    gecko_id: "tori-trusd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: [
      "https://github.com/sherlock-protocol/sherlock-reports/blob/main/audits/2026.02.10%20-%20Final%20-%20Tori%20Finance%20Collaborative%20Audit%20Report%201770734349.pdf",
    ],
    twitter: "https://x.com/tori_finance",
    wiki: "https://docs.tori.finance",
    module: "tori-usd",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xd0580192E98eA6CEB9c7b6191Ed2E27560911697"],
        },
      },
    },
  },
  {
    id: "402",
    name: "Kerne USD",
    address: "base:0x5C2EfdF0D8D286959b42308966bc2B97f5680AA3",
    symbol: "kUSD",
    url: "https://kerne.fi",
    description:
      "Kerne USD (kUSD) is the synthetic dollar of Kerne Protocol on Base. kUSD is minted and redeemed 1:1 against USDC through an on-chain Peg Stability Module and is backed 1:1 by USDC reserves. Holders can stake kUSD into skUSD, a vault that accrues yield from a delta-neutral basis trade pairing Ethereum staking rewards with Hyperliquid perpetual funding, hedged so holders carry no directional ETH exposure. This is Kerne Protocol's kUSD on Base, independent of KernelDAO's KUSD and Kernel Protocol's kUSD.",
    mintRedeemDescription:
      "kUSD is minted by depositing USDC into the Kerne Peg Stability Module on Base on a 1:1 value basis, and redeemed 1:1 for USDC through the same module. Supply is uncapped and changes with mints and redemptions.",
    onCoinGecko: "false",
    gecko_id: "kerne-usd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://twitter.com/KerneProtocol",
    wiki: "https://kerne.fi/docs",
    doublecounted: true,
    chainConfig: {
      chains: {
        base: {
          issued: ["0x5C2EfdF0D8D286959b42308966bc2B97f5680AA3"],
          // Peg Stability Modules. Redemptions transfer kUSD into the PSM
          // without burning it, so PSM-held kUSD is protocol inventory, not circulating supply.
          unreleased: [
            "0xFf3025ec18e301855aB0f36Ec6ECa115a29A5Fbc",
            "0x07eBb486e11BD217e6085eb5ab663e4517595993",
            "0xaBDE1138aa1Ce88d1dF06422C0c3b05D70569803",
          ],
        },
      },
    },
  },
  {
    id: "403",
    name: "Money Protocol",
    address: "rsk:0x1fe2f558e2120c4bDf4217248D2940043a8E1208",
    symbol: "BPD",
    url: "https://www.moneyprotocol.co/",
    description:
      "Money Protocol is a decentralized system that allows anyone to monetize or borrow against their Bitcoin without paying an annual interest rate. When locking up BTC as collateral in Money Protocol and creating a Vault, the user can get instant liquidity by minting BPD. Bitcoin Protocol Dollar or BPD is a decentralized, collateral-backed stablecoin target pegged to the US Dollar.",
    mintRedeemDescription:
      "Each Vault is required to be collateralized at a minimum of 110%. Holders of BPD can redeem their stablecoin for the underlying BTC collateral at any time.",
    onCoinGecko: "false",
    gecko_id: "money-protocol", //fake
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: [],
    twitter: "https://x.com/money_protocol",
    wiki: "https://docs.moneyprotocol.co/docs/intro",
    module: "money-protocol",
    chainConfig: {
      chains: {
        rsk: {
          issued: ["0x1fe2f558e2120c4bDf4217248D2940043a8E1208"],
        },
      },
    },
  },
  {
    id: "404",
    name: "Monetrix USDM",
    address: "hyperliquid:0xE2d2959f89B6389DeB624bF076Fe7D9E5401f377",
    symbol: "USDM",
    url: "https://www.monetrix.xyz/",
    description:
      "USDM is a delta-neutral, yield-bearing synthetic dollar on HyperEVM. It is backed by USDC collateral deployed into delta-neutral basis-trading positions (funding payments, HLP and borrow-lend yield) on Hyperliquid Core, and mints/redeems 1:1 against USDC.",
    mintRedeemDescription:
      "Users mint USDM 1:1 by depositing USDC, which the protocol deploys into delta-neutral positions on Hyperliquid Core. USDM can be staked for sUSDM to earn the strategy yield, and is redeemed back to USDC 1:1.",
    onCoinGecko: "true",
    gecko_id: "monetrix-usd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://code4rena.com/reports/2026-04-monetrix"],
    twitter: "https://x.com/monetrix_xyz",
    wiki: "https://doc.monetrix.xyz/guide/mint",
    module: "monetrix-usdm",
    doublecounted: true,
    chainConfig: {
      decimals: 6,
      chains: {
        hyperliquid: {
          issued: ["0xE2d2959f89B6389DeB624bF076Fe7D9E5401f377"],
        },
      },
    },
  },
  {
    id: "405",
    name: "AP USDA",
    address: "bsc:0x17eafd08994305d8ace37efb82f1523177ec70ee",
    symbol: "USDA",
    url: "https://alphapartner.vip/",
    description:
      "USDA is a compliant, cross-chain stablecoin issued by the AP Web3 ecosystem, anchored 1:1 to the US Dollar and designed as secure digital payment and asset settlement infrastructure for global users.",
    mintRedeemDescription:
      "USDA is minted when users deposit USD with the issuer, and it can be redeemed 1:1 for the USD held in its reserves.",
    onCoinGecko: "true",
    gecko_id: "usda-3",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "coingecko",
    auditLinks: null,
    twitter: "https://x.com/APalphalabs",
    wiki: null,
    module: "usda-3",
    chainConfig: {
      chains: {
        bsc: {
          issued: ["0x17eafd08994305d8ace37efb82f1523177ec70ee"],
        },
      },
    },
  },
  {
    id: "406",
    name: "Polymarket USD",
    address: "polygon:0xc011a7e12a19f7b1f670d46f03b03f3342e82dfb",
    symbol: "pUSD",
    url: "https://polymarket.com/",
    description:
      "pUSD is Polymarket's USD-pegged settlement coin on Polygon, backed 1:1 by USDC. It is used as the collateral and settlement currency for Polymarket prediction markets.",
    mintRedeemDescription:
      "pUSD is minted 1:1 by depositing USDC into Polymarket and is redeemed 1:1 back to USDC when funds are withdrawn.",
    onCoinGecko: "true",
    gecko_id: "polymarket-usd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://x.com/Polymarket",
    wiki: null,
    module: "polymarket-usd",
    doublecounted: true,
    chainConfig: {
      decimals: 6,
      chains: {
        polygon: {
          issued: ["0xc011a7e12a19f7b1f670d46f03b03f3342e82dfb"],
        },
      },
    },
  },
  {
    id: "407",
    name: "Unity USD",
    address: "bsc:0x61a10e8556bed032ea176330e7f17d6a12a10000",
    symbol: "UUSD",
    url: "https://uusd.ai/",
    description:
      "UUSD is a USD-pegged stablecoin built by Anything Labs, designed as a settlement currency and stablecoin issuance network for the AI agent economy.",
    mintRedeemDescription:
      "UUSD is backed by a reserve of stablecoins including USDT and USDC, and is redeemable 1:1 for fiat-equivalent value at any time.",
    onCoinGecko: "true",
    gecko_id: "unity-usd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "coingecko",
    auditLinks: null,
    twitter: "https://x.com/UUSDai",
    wiki: null,
    module: "unity-usd",
    doublecounted: true,
    chainConfig: {
      chains: {
        bsc: {
          issued: ["0x61a10e8556bed032ea176330e7f17d6a12a10000"],
        },
      },
    },
  },
  {
    id: "408",
    name: "Ondo U.S. Dollar Token",
    address: "0xace8e719899f6e91831b18ae746c9a965c2119f1",
    symbol: "USDon",
    url: "https://app.ondo.finance/",
    description:
      "USDon is a USD-pegged stablecoin issued by Ondo Finance that serves as the settlement currency for tokenized stocks and ETFs on Ondo Global Markets.",
    mintRedeemDescription:
      "USDon is backed 1:1 by US dollars held in Ondo Global Markets' brokerage accounts. It is minted by converting USDC 1:1 when buying tokenized assets and redeemed 1:1 back to USDC.",
    onCoinGecko: "true",
    gecko_id: "ondo-u-s-dollar-token",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "coingecko",
    auditLinks: null,
    twitter: "https://x.com/OndoFinance",
    wiki: "https://docs.ondo.finance/ondo-global-markets/investing-and-redeeming",
    module: "ondo-u-s-dollar-token",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xace8e719899f6e91831b18ae746c9a965c2119f1"],
        },
        bsc: {
          issued: ["0x1f8955e640cbd9abc3c3bb408c9e2e1f5f20dfe6"],
        },
      },
    },
  },
  {
    id: "409",
    name: "USDKG",
    address: "0xe820c06321e60d36257c666643fa5436643445e3",
    symbol: "USDKG",
    url: "https://www.usdkg.com/",
    description:
      "USDKG is a 1:1 USD-pegged stablecoin fully collateralized by physical gold reserves held in a custodian bank within Kyrgyzstan, backed by the Ministry of Finance of the Kyrgyz Republic.",
    mintRedeemDescription:
      "USDKG is minted and redeemed directly by institutional clients subject to KYC/AML verification, against U.S. dollars or supported cryptocurrencies, with gold redemption handled on a case-by-case basis. Retail users trade USDKG on supported exchanges.",
    onCoinGecko: "true",
    gecko_id: "usdkg",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "coingecko",
    auditLinks: null,
    twitter: "https://x.com/USDKG_Official",
    wiki: null,
    module: "usdkg",
    chainConfig: {
      chains: {
        tron: {
          issued: ["TXZo12qvnEVKvU2zbfuQeMXKusWyxonwEG"],
        },
        ethereum: {
          issued: ["0xe820c06321e60d36257c666643fa5436643445e3"],
        },
      },
    },
  },
  {
    id: "410",
    name: "Universal USD",
    address: "0xe4ca6596d2c28014c6f89964f57838e0be9f369b",
    symbol: "USDU",
    url: "https://www.universal.ae/",
    description:
      "Universal USD (USDU) is a fiat-referenced token pegged 1:1 to the US Dollar, issued by Universal Digital Intl Limited, a financial entity based in Abu Dhabi Global Market. It is designed to provide a compliant, institutional-grade USD-denominated settlement layer for digital assets and virtual asset derivatives within regulated financial frameworks.",
    mintRedeemDescription:
      "USDU is minted when professional and institutional clients deposit US dollars with the issuer, and it can be redeemed 1:1 against liquid USD reserves held in safeguarded accounts with regulated commercial banks, with monthly independent reserve attestations.",
    onCoinGecko: "true",
    gecko_id: "universal-usd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "coingecko",
    auditLinks: null,
    twitter: "https://x.com/Universal_USDU",
    wiki: null,
    module: "universal-usd",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xe4ca6596d2c28014c6f89964f57838e0be9f369b"],
        },
      },
    },
  },
  {
    id: "411",
    name: "Stable Mint USD",
    address: "0x399B29975CBE313C56269cD5097F5AE097Fa2741",
    symbol: "USDSM",
    url: "https://stablemint.io/stablecoins/",
    description:
      "Stable Mint USD (USDSM) is a USD-denominated Electronic Money Token (EMT) issued under the EU's MiCA framework by Stable Mint Limited, a Malta-based Electronic Money Institution authorised by the Malta Financial Services Authority (MFSA). It provides a regulated digital representation of the US dollar for on-chain payments, settlement, treasury management and digital asset markets.",
    mintRedeemDescription:
      "USDSM is issued 1:1 against received US dollar fiat deposits, and is redeemable for fiat on demand through Stable Mint's onboarding and compliance framework. Reserves are held in dollar-denominated cash deposits and high-quality liquid assets.",
    onCoinGecko: "true",
    gecko_id: "stable-mint-usd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://x.com/StableMintLtd",
    wiki: null,
    module: "stable-mint-usd",
    chainConfig: {
      chains: {
        etlk: {
          issued: ["0x6bDE51212203aE5d592Cc5180DA2ABBd41c922dE"],
        },
        ethereum: {
          issued: ["0x399B29975CBE313C56269cD5097F5AE097Fa2741"],
        },
        base: {
          issued: ["0x26C358F7c5fEdB20a6ddEf108cD91Efb6B8Da0Cb"],
        },
        arbitrum: {
          issued: ["0x26C358F7c5fEdB20a6ddEf108cD91Efb6B8Da0Cb"],
        },
      },
    },
  },
  {
    id: "412",
    name: "MYR Stablecoin",
    address: "0x3Fc98a885E99420d0ce43Bcb81bF21A4e3F45E5f",
    symbol: "MYRT",
    url: "https://myrt.money/",
    description:
      "MYRT is an ERC-20 stablecoin for Malaysian ringgit-denominated value. MYRT is pegged 1:1 to the Malaysian ringgit and backed by ringgit reserves.",
    mintRedeemDescription:
      "MYRT is issued 1:1 against Malaysian ringgit reserves. All issued MYRT is treated as circulating supply, with no treasury, team, reserve, unreleased, or project-owned token balances to subtract.",
    onCoinGecko: "false",
    gecko_id: "myr-stablecoin",
    cmcId: null,
    pegType: "peggedMYR",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: ["https://github.com/myrt-money/myrt-smart-contract/blob/main/docs/AUDIT_NOTICE.md"],
    twitter: "https://x.com/MYRT_money",
    wiki: "https://github.com/myrt-money/myrt-smart-contract",
    module: "myr-stablecoin",
    chainConfig: {
      decimals: 6,
      chains: {
        ethereum: {
          issued: ["0x3Fc98a885E99420d0ce43Bcb81bF21A4e3F45E5f"],
        },
      },
    },
  },
  {
    id: "413",
    name: "SoulPeg USD",
    address: "0x40ff3dea2eec93a7b71879874dc4407918da77a6",
    symbol: "SPUSD",
    url: "https://www.soulpeg.io/",
    description:
      "SoulPeg USD (SPUSD) is a BEP-20 stablecoin wrapper for the non-transferable sUSDC deposit token, whose reserves are deployed in transparent lending strategies (currently Venus). Its $1 target is maintained on-chain by a market-making bot trading the SPUSD/USDC PancakeSwap v2 pool.",
    mintRedeemDescription:
      "SPUSD is minted by wrapping sUSDC and can always be unwrapped back to sUSDC, with SPUSD burned on redeem. The peg is supported by reserves deployed in on-chain lending strategies and an automated market-making bot on the SPUSD/USDC PancakeSwap pool.",
    onCoinGecko: "true",
    gecko_id: "soulpeg-usd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://x.com/soulpeglabs",
    wiki: null,
    module: "soulpeg-usd",
    doublecounted: true,
    chainConfig: {
      chains: {
        bsc: {
          issued: ["0x40ff3dea2eec93a7b71879874dc4407918da77a6"],
        },
      },
    },
  },
  {
    id: "414",
    name: "Royal Euro",
    address: "0x3ed0b3c4c0168a560d34e361b8130dcca4677736",
    symbol: "REUR",
    url: "https://www.rcoins.digital/",
    description:
      "Royal Euro Token (REUR) is a EUR-referenced stable-value token (crypto-asset) designed to target a 1:1 value with the Euro (EUR), subject to reserve sufficiency, redemption terms, and market conditions. REUR is issued by The RIB Digital Holdings Limited, Hong Kong, and is engineered for fast, transparent settlement across multiple public blockchains, providing a bank-grade settlement instrument for payments, treasury operations, OTC trading, and exchange liquidity.",
    mintRedeemDescription:
      "REUR is issued by RIB Digital against reserves held to target a 1:1 value with the Euro, and is redeemable subject to reserve sufficiency and the issuer's redemption terms.",
    onCoinGecko: "true",
    gecko_id: "royal-euro",
    cmcId: null,
    pegType: "peggedEUR",
    pegMechanism: "fiat-backed",
    priceSource: "coingecko",
    auditLinks: null,
    twitter: "https://x.com/rcoins_official",
    wiki: null,
    module: "royal-euro",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x3ed0b3c4c0168a560d34e361b8130dcca4677736"],
          reserves: ["0xc50ebe57ae937a8ac0bcaab8945777c3be54a511"],
        },
        bsc: {
          issued: ["0x3ed0b3c4c0168a560d34e361b8130dcca4677736"],
          reserves: ["0xc50ebe57ae937a8ac0bcaab8945777c3be54a511"],
        },
        tron: {
          issued: ["TXUi9vL8Ltz4dVpC6RM8CdtKSTHxFZuFbz"],
          reserves: ["TQ1jtDoSd3m7AP8HHYBLxWJE8ucL8SXyGX"],
        },
      },
    },
  },
  {
    id: "415",
    name: "Royal Dollar",
    address: "0x44bb433d29fe966992a9c812da7f252c9c53f285",
    symbol: "RUSD",
    url: "https://www.rcoins.digital/",
    description:
      "Royal Dollar (RUSD) is the flagship token of the RCOINS digital asset family developed under the RIB Digital brand. It is a USD-referenced stable-value digital asset issued by The RIB Digital Holdings Limited, Hong Kong, designed for payments, treasury operations, OTC trading, exchange liquidity, and selected on-chain financial applications, aiming to deliver a transparent digital dollar experience.",
    mintRedeemDescription:
      "RUSD is issued by RIB Digital against reserves held to target a 1:1 value with the US Dollar, and is redeemable subject to reserve sufficiency and the issuer's redemption terms.",
    onCoinGecko: "true",
    gecko_id: "royal-dollar",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://x.com/rcoins_official",
    wiki: null,
    module: "royal-dollar",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x44bb433d29fe966992a9c812da7f252c9c53f285"],
          reserves: ["0xc50ebe57ae937a8ac0bcaab8945777c3be54a511"],
        },
        bsc: {
          issued: ["0x44bb433d29fe966992a9c812da7f252c9c53f285"],
          reserves: ["0xc50ebe57ae937a8ac0bcaab8945777c3be54a511"],
        },
        tron: {
          issued: ["TUvns399UpycBBpVsCVJLCjXFBjzHrNUR1"],
          reserves: ["TQ1jtDoSd3m7AP8HHYBLxWJE8ucL8SXyGX", "TV2VoR52hEsAPEwkVXFWckfWNb2oRQo8oz"],
        },
      },
    },
  },
  {
    id: "416",
    name: "Telcoin eUSD",
    address: "0x14913815bcfde78baead2111f463d038ac9c2949",
    symbol: "eUSD",
    url: "https://www.telcoin.org/",
    description:
      "eUSD is a fiat-backed stablecoin issued by Telcoin Bank, the first US bank-issued stablecoin, pegged 1:1 to the US Dollar and fully backed by cash and cash-equivalent reserves.",
    mintRedeemDescription:
      "eUSD is minted when users deposit USD with Telcoin Bank and can be redeemed 1:1 for the USD held in its reserves.",
    onCoinGecko: "true",
    gecko_id: "eusd-2",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://x.com/telcoin",
    wiki: null,
    module: "eusd-2",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x14913815bcfde78baead2111f463d038ac9c2949"],
        },
        polygon: {
          issued: ["0x14913815bcfde78baead2111f463d038ac9c2949"],
        },
        base: {
          issued: ["0x14913815bcfde78baead2111f463d038ac9c2949"],
        },
        solana: {
          issued: ["HQMYCZTDq9g3oZejDRUeQsFtLKgyfvBpD3yHaTnain3L"],
        },
      },
    },
  },
  {
    id: "417",
    name: "Defi.money",
    address: "optimism:0x69420f9e38a4e60a62224c489be4bf7a94402496",
    symbol: "MONEY",
    url: "https://defi.money/",
    description:
      "$MONEY is a USD-denominated decentralized stablecoin from defi.money, a crvUSD-based protocol on Optimism and Arbitrum, pegged to the US Dollar and minted against crypto collateral.",
    mintRedeemDescription:
      "Users deposit crypto collateral to borrow MONEY, and repay MONEY to unlock their collateral.",
    onCoinGecko: "true",
    gecko_id: "defi-money",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://x.com/defidotmoney",
    wiki: null,
    module: "defi-money",
    chainConfig: {
      chains: {
        optimism: {
          issued: ["0x69420f9e38a4e60a62224c489be4bf7a94402496"],
        },
        arbitrum: {
          issued: ["0x69420f9e38a4e60a62224c489be4bf7a94402496"],
        },
        base: {
          issued: ["0x69420f9e38a4e60a62224c489be4bf7a94402496"],
        },
      },
    },
  },
  {
    id: "418",
    name: "Cod3x USD",
    address: "base:0xc0d3700000987c99b3c9009069e4f8413fd22330",
    symbol: "cdxUSD",
    url: "https://cod3x.org/",
    description:
      "cdxUSD is an overcollateralized CDP stablecoin native to the Cod3x ecosystem, pegged to the US Dollar and minted against crypto collateral in the Cod3x lending markets.",
    mintRedeemDescription:
      "Users deposit crypto collateral to mint cdxUSD and repay cdxUSD to redeem their collateral.",
    onCoinGecko: "true",
    gecko_id: "cod3x-usd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://x.com/Cod3xOrg",
    wiki: null,
    module: "cod3x-usd",
    chainConfig: {
      chains: {
        base: {
          issued: ["0xc0d3700000987c99b3c9009069e4f8413fd22330"],
        },
      },
    },
  },
  {
    id: "419",
    name: "Elara USD",
    address: "0x65Fb0f9b196d524De0C4F3BAF572F0a79eb21194",
    symbol: "elUSD",
    url: "https://elara.fi/",
    description:
      "Elara Finance is a treasury management product from the Brila ecosystem that helps treasuries, allocators, institutions, and individuals earn dollar-denominated yield on stablecoins without manually coordinating strategies across DeFi venues.",
    mintRedeemDescription:
      "Users mint elUSD by depositing supported stablecoin collateral into Elara and redeem elUSD for supported collateral through the Elara Vault.",
    onCoinGecko: "false",
    gecko_id: "elara-usd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: ["https://sherlock-files.ams3.digitaloceanspaces.com/reports/2026.06.14%20-%20Final%20-%20Elara%20Finance%20Collaborative%20Audit%20Report%201781450009.pdf"],
    twitter: "https://x.com/Elara_HQ",
    wiki: "https://docs.elara.fi/",
    module: "elara-usd",
    doublecounted: true,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x65Fb0f9b196d524De0C4F3BAF572F0a79eb21194"],
        },
      },
    },
  },
  {
    id: "420",
    name: "Startale USD",
    address: "soneium:0x3f99231dd03a9f0e7e3421c92b7b90fbe012985a",
    symbol: "USDSC",
    url: "https://www.startale.com/",
    description:
      "Startale USD (USDSC) is a fully backed U.S. dollar stablecoin issued by Startale Group and built on M0's universal stablecoin platform. This digital dollar is backed by short-term U.S. Treasuries and issued through structures designed to keep user assets secure.",
    mintRedeemDescription:
      "USDSC can be minted with USDC.e or ETH via the Startale App on Soneium, is fully backed 1:1 by short-term U.S. Treasuries held in bankruptcy-remote structures, and can be redeemed at any time with no lock-ups.",
    onCoinGecko: "true",
    gecko_id: "startale-usd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://x.com/StartaleGroup",
    wiki: null,
    module: "startale-usd",
    chainConfig: {
      chains: {
        soneium: {
          issued: ["0x3f99231dd03a9f0e7e3421c92b7b90fbe012985a"],
        },
      },
    },
  },
  {
    id: "421",
    name: "Flying Tulip USD",
    address: "0xf7d85ec4e7710f71992752eac2111312e73e9c9c",
    symbol: "ftUSD",
    url: "https://flyingtulip.com/",
    description:
      "ftUSD is Flying Tulip's dollar-pegged token designed for stability first, usable as a composable on-chain dollar with optional yield when staked as sftUSD.",
    mintRedeemDescription:
      "ftUSD is minted by depositing a stablecoin such as USDC or USDT, and redeemed by converting ftUSD back to the input asset at the prevailing rate; holders can stake ftUSD as sftUSD to earn yield.",
    onCoinGecko: "true",
    gecko_id: "flying-tulip-usd",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://x.com/flyingtulip_",
    wiki: null,
    module: "flying-tulip-usd",
    doublecounted: true,
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xf7d85ec4e7710f71992752eac2111312e73e9c9c"],
        },
      },
    },
  },
  {
    id: "422",
    name: "Forte AUD",
    address: "0xd2a530170d71a9cfe1651fb468e2b98f7ed7456b",
    symbol: "AUDF",
    url: "https://www.forteaud.com/",
    description:
      "AUDF is a digital Australian Dollar stablecoin issued by Forte Securities Australia, pegged 1:1 to the Australian Dollar and fully backed by AUD reserves.",
    mintRedeemDescription:
      "Users deposit AUD to mint AUDF 1:1 and can redeem AUDF back to AUD in their bank account, with issuance and redemption available 24/7.",
    onCoinGecko: "true",
    gecko_id: "forte-aud",
    cmcId: null,
    pegType: "peggedAUD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://x.com/ForteAUD",
    wiki: null,
    module: "forte-aud",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xd2a530170d71a9cfe1651fb468e2b98f7ed7456b"],
        },
        base: {
          issued: ["0xd2a530170d71a9cfe1651fb468e2b98f7ed7456b"],
        },
        polygon: {
          issued: ["0xd2a530170d71a9cfe1651fb468e2b98f7ed7456b"],
        },
        avax: {
          issued: ["0xd2a530170d71a9cfe1651fb468e2b98f7ed7456b"],
        },
      },
    },
  },
  {
    id: "423",
    name: "Decentralized Euro",
    address: "0xba3f535bbcccca2a154b573ca6c5a49baae0a3ea",
    symbol: "dEURO",
    url: "https://deuro.com/",
    description:
      "dEURO is a collateralized, oracle-free stablecoin that tracks the value of the Euro, backed by overcollateralized crypto positions.",
    mintRedeemDescription:
      "dEURO is minted when users deposit supported crypto collateral (e.g., BTC or ETH) into the protocol's smart contracts and generate new tokens against it based on required overcollateralization ratios, with automated liquidations keeping the system solvent if collateral values fall; it is redeemed by repaying the position to reclaim the underlying collateral.",
    onCoinGecko: "true",
    gecko_id: "decentralized-euro",
    cmcId: null,
    pegType: "peggedEUR",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://x.com/deuro_com",
    wiki: null,
    module: "decentralized-euro",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0xba3f535bbcccca2a154b573ca6c5a49baae0a3ea"],
        },
        base: {
          bridgedFromETH: ["0x1b5f7fa46ed0f487f049c42f374ca4827d65a264"],
        },
        polygon: {
          bridgedFromETH: ["0xc2ff25dd99e467d2589b2c26edd270f220f14e47"],
        },
        optimism: {
          bridgedFromETH: ["0x1b5f7fa46ed0f487f049c42f374ca4827d65a264"],
        },
        arbitrum: {
          bridgedFromETH: ["0x5e85faf503621830ca857a5f38b982e0cc57d537"],
        },
      },
    },
  },
  {
    id: "424",
    name: "Stablecorp QCAD",
    address: "0x3fa142dd3f384414e05e71ad0939274edc82ec0a",
    symbol: "QCAD",
    url: "https://stablecorp.ca/",
    description:
      "QCAD is Canada's first compliant CAD stablecoin, issued by Stablecorp and fully 1:1 fiat-backed by Canadian dollar reserves held with regulated Canadian financial institutions under a dedicated, third-party-audited trust.",
    mintRedeemDescription:
      "QCAD is minted 1:1 when users deposit Canadian dollars with the issuer and is redeemable 1:1 for CAD, with reserves held in a regulated Canadian trust and monthly attestation reports published.",
    onCoinGecko: "true",
    gecko_id: "stablecorp-qcad",
    cmcId: null,
    pegType: "peggedCAD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://x.com/stablecorp",
    wiki: null,
    module: "stablecorp-qcad",
    chainConfig: {
      chains: {
        ethereum: {
          issued: ["0x3fa142dd3f384414e05e71ad0939274edc82ec0a"],
        },
        base: {
          issued: ["0xa15705e6fc8b3e08e7253f3758de1a754baa0761"],
        },
        solana: {
          issued: ["EeBX9JLdvsp4HnBbMgC1HnAjBkBQxgxtWxspcCLtT6ci"],
        },
      },
    },
  },
  {
    id: "425",
    name: "The Fedz FUSD",
    address: "arbitrum:0x894341be568eae3697408c420f1d0acfce6e55f9",
    symbol: "FUSD",
    url: "https://thefedz.xyz/",
    description:
      "FUSD is an under-collateralized stablecoin issued by The Fedz on Arbitrum, using a fractional-reserve model with private liquidity pools to maintain a US Dollar peg while improving capital efficiency.",
    mintRedeemDescription:
      "FUSD is minted against collateral in The Fedz protocol under a fractional-reserve model, with private liquidity pools (accessible to Fedz NFT holders) supporting its peg and redemptions.",
    onCoinGecko: "true",
    gecko_id: "fusd-by-the-fedz",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "crypto-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://x.com/thefedznft",
    wiki: null,
    module: "fusd-by-the-fedz",
    chainConfig: {
      chains: {
        arbitrum: {
          issued: ["0x894341be568eae3697408c420f1d0acfce6e55f9"],
        },
      },
    },
  },
  {
    id: "426",
    name: "Streamflow USD+",
    address: "solana:usdsfJbX78ktZUnoRC7dwvvQz7xH3WdkpGne76gdUia",
    symbol: "USD+",
    url: "https://usd-plus.com/",
    description:
      "USD+ is a U.S. Treasury bill-backed stablecoin on Solana, powered by the M0 universal stablecoin platform, that streams yield from underlying T-Bills directly to holders' wallets daily while maintaining a $1 peg.",
    mintRedeemDescription:
      "USD+ is minted 1:1 against U.S. Treasury bill reserves via the M0 platform and is redeemable 1:1 for its underlying reserves, with yield from the T-Bills streamed daily to holders and no staking or lockups required.",
    onCoinGecko: "true",
    gecko_id: "usd-2",
    cmcId: null,
    pegType: "peggedUSD",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://x.com/streamflow_fi",
    wiki: null,
    module: "usd-2",
    chainConfig: {
      chains: {
        solana: {
          issued: ["usdsfJbX78ktZUnoRC7dwvvQz7xH3WdkpGne76gdUia"],
        },
      },
    },
  },
  {
    id: "427",
    name: "JPYSC",
    address: "0x6781d5631bfe47432b089e64e3eab3b6edd26177",
    symbol: "JPYSC",
    url: "https://www.shinseitrust.com/stablecoin/jpysc.html",
    description:
      "JPYSC is a trust-type Japanese yen stablecoin issued by SBI Shinsei Trust & Banking under Japan's Electronic Payment Instruments framework, in partnership with Startale Group. Each JPYSC is fully backed 1:1 by Japanese yen held in trust.",
    mintRedeemDescription:
      "JPYSC is minted by SBI Shinsei Trust & Banking when Japanese yen is entrusted to the issuing trust, and redeemed 1:1 for yen through the trust; issuance and redemption are centrally controlled by the licensed trust bank.",
    onCoinGecko: "true",
    gecko_id: "jpysc",
    cmcId: null,
    pegType: "peggedJPY",
    pegMechanism: "fiat-backed",
    priceSource: "defillama",
    auditLinks: null,
    twitter: "https://x.com/JPYStableCoin",
    wiki: "https://jpysc-info.com/jpysc",
    module: "jpysc",
  },
  {
    id: "428",
    name: "KRWQ",
    address: "0xc00db6b41473d065027f5ed6fada20fde75f142e",
    symbol: "KRWQ",
    url: "https://www.krwq.cash/",
    description:
      "KRWQ is a fully reserved Korean won-denominated stablecoin developed by IQ in partnership with Frax. It is designed to track one Korean won and is backed by disclosed reserve assets including Korean Treasury Bonds and approved stablecoins.",
    mintRedeemDescription:
      "Eligible KYC-approved counterparties can mint KRWQ after the issuer receives fiat or approved collateral and redeem it through partner services; redeemed KRWQ is burned.",
    onCoinGecko: "true",
    gecko_id: "krwt",
    cmcId: "38807",
    pegType: "peggedKRW",
    pegMechanism: "fiat-backed",
    priceSource: "coingecko",
    auditLinks: null,
    twitter: "https://x.com/krwqcash",
    wiki: "https://www.krwq.cash/whitepaper.pdf",
    module: "krwt",
  },
] as PeggedAsset[];
