export type ChainContracts = {
    [chain: string]: {
      [contract: string]: string[];
    };
  };
  
  export const chainContracts: ChainContracts = {
    ethereum: {
        issued: ["0xdAC17F958D2ee523a2206206994597C13D831ec7"],
        bridgedFromBSC: ["0xDe60aDfDdAAbaAAC3dAFa57B26AcC91Cb63728c4"], // wormhole
        bridgedFromSol: ["0x1CDD2EaB61112697626F7b4bB0e23Da4FeBF7B7C"], // wormhole
        unreleased: ["0x5754284f345afc66a98fbb0a0afe71e0f007b949"], // api claims slightly less than this
      },
      polygon: {
        bridgeOnETH: ["0x40ec5B33f54e0E8A33A975908C5BA1c14e5BbbDf"],
        bridgedFromETH: [
          "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
          "0x9417669fBF23357D2774e9D421307bd5eA1006d2", // wormhole
          "0xceed2671d8634e3ee65000edbbee66139b132fbf", // axelar
        ],
        bridgedFromSol: ["0x3553f861dEc0257baDA9F8Ed268bf0D74e45E89C"], // wormhole
      },
      bsc: {
        bridgeOnETH: ["0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503"], // can get amount bridged from ETH from this
        bridgedFromETHAndTron: ["0x55d398326f99059fF775485246999027B3197955"], // bridged from both Ethereum and Tron
        bridgedFromAvax: ["0x2B90E061a517dB2BbD7E39Ef7F733Fd234B494CA"], // wormhole
        bridgedFromETH: ["0x524bC91Dc82d6b90EF29F76A3ECAaBAffFD490Bc"], // wormhole
        bridgedFromSol: ["0x49d5cC521F75e13fa8eb4E89E9D381352C897c96"], // wormhole but the info on this is typo'd???
      },
      avax: {
        bridgeOnETH: ["0xE78388b4CE79068e89Bf8aA7f218eF6b9AB0e9d0"],
        bridgedFromETH: [
          "0xc7198437980c041c805a1edcba50c1ce5db95118",
          "0xf976ba91b6bb3468c91e4f02e68b37bc64a57e66", // axelar
        ],
        bridgedFromSol: ["0xF0FF231e3F1A50F83136717f287ADAB862f89431"], // wormhole
        bridgedFromBSC: ["0xA67BCC0D06d7d13A13A2AE30bF30f1B434f5a28B"], // wormhole
        issued: ["0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7"],
        unreleased: ["0x5754284f345afc66a98fbb0a0afe71e0f007b949"],
      },
      solana: {
        issued: ["Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"],
        bridgedFromETH: [
          "Dn4noZ5jgGfkntzcQSUZ8czkreiZ1ForXYoV2H8Dm7S1", // wormhole
          "Bn113WT6rbdgwrm12UJtnmNqGqZjY4it2WoUQuQopFVn", // allbridge
        ],
        bridgedFromPolygon: [
          "5goWRao6a3yNC4d6UjMdQxonkCMvKBwdpubU3qhfcdf1", // wormhole
          "DNhZkUaxHXYvpxZ7LNnHtss8sQgdAfd1ZYS1fB7LKWUZ", // allbridge
        ],
        bridgedFromBSC: [
          "8qJSyQprMC57TWKaYEmetUR3UUiTP2M3hXdcvFhkZdmv", // wormhole
          "E77cpQ4VncGmcAXX16LHFFzNBEBb2U7Ar7LBmZNfCgwL", // allbridge
        ],
        bridgedFromHeco: ["GfzU1fLASNV3r4NtEyrnwTyTakJkYzoivnaL3Snh45oj"], // allbridge
        bridgedFromAvax: [
          "FwEHs3kJEdMa2qZHv7SgzCiFXUQPEycEXksfBkwmS8gj", // allbridge
          "B2wfeYz5VtBnQVrX4M8F6FeDrprVrzKPws5qg1in8bzR", // wormhole
        ],
        unreleased: ["Q6XprfkF8RQQKoQVG33xT88H7wi8Uk1B1CC7YAs69Gi"],
      },
      tron: {
        issued: ["TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"],
        unreleased: ["TKHuVq1oKVruCGLvqVexFs6dawKv6fQgFs"],
      },
      arbitrum: {
        bridgeOnETH: ["0xcee284f754e854890e311e3280b767f80797180d"],
        bridgedFromETH: ["0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9"],
      },
      optimism: {
        bridgeOnETH: ["0x99c9fc46f92e8a1c0dec1b1747d010903e884be1"],
        bridgedFromETH: ["0x94b008aA00579c1307B0EF2c499aD98a8ce58e58"],
      },
      boba: {
        bridgeOnETH: ["0xdc1664458d2f0b6090bea60a8793a4e66c2f1c00"],
        bridgedFromETH: ["0x5DE1677344D3Cb0D7D465c10b72A8f60699C062d"],
      },
      metis: {
        bridgeOnETH: ["0x3980c9ed79d2c191A89E02Fa3529C60eD6e9c04b"],
        bridgedFromETH: ["0xbB06DCA3AE6887fAbF931640f67cab3e3a16F4dC"],
      },
      era: {
        bridgeOnETH: ["0x32400084C286CF3E17e7B677ea9583e60a000324"],
        bridgedFromETH: ["0x493257fd37edb34451f62edf8d2a0c418852ba4c"],
      },
      moonbeam: {
        bridgeOnETH: ["0xEC4486a90371c9b66f499Ff3936F29f0D5AF8b7E"],
        bridgedFromETH: [
          "0x3c751Feb00364CA9e2d0105c40F0b423abf1DEE3", // passport.meter
          "0xeFAeeE334F0Fd1712f9a8cc375f427D9Cdd40d73", // multichain
          "0x81ECac0D6Be0550A00FF064a4f9dd2400585FE9c", // celer
          // "0x8e70cD5B4Ff3f62659049e74b6649c6603A0E594", // nomad, hacked
          "0xdfd74af792bc6d45d1803f425ce62dd16f8ae038", // axelar
        ],
      },
      kcc: {
        bridgeOnETH: ["0xD6216fC19DB775Df9774a6E33526131dA7D19a2c"],
        bridgedFromETH: ["0x0039f574ee5cc39bdd162e9a88e3eb1f111baf48"], //is this correct? huge disparity
      },
      moonriver: {
        bridgeOnETH: ["0x10c6b61dbf44a083aec3780acf769c77be747e23"],
        bridgedFromETH: ["0xB44a9B6905aF7c801311e8F4E76932ee959c663C"], // multichain
      },
      tomochain: {
        bridgedFromETH: ["0x381b31409e4d220919b2cff012ed94d70135a59e"],
      },
      harmony: {
        bridgeOnETH: ["0x2dccdb493827e15a5dc8f8b72147e6c4a5620857"],
        bridgedFromETH: ["0x3c2b8be99c50593081eaa2a724f0b8285f5aba8f"],
      },
      syscoin: {
        bridgeOnETH: ["0x8cC49FE67A4bD7a15674c4ffD4E969D94304BBbf"],
        bridgedFromETH: ["0x922d641a426dcffaef11680e5358f34d97d112e1"], // multichain
      },
      kardia: {
        bridgedFromETH: ["0x551a5dcac57c66aa010940c2dcff5da9c53aa53b"],
      },
      heco: {
        bridgeOnETH: ["0xA929022c9107643515F5c777cE9a910F0D1e490C"], //contain slightly less than native
        bridgedFromETH: ["0xa71EdC38d189767582C38A3145b5873052c3e47a"],
      },
      okexchain: {
        bridgeOnETH: ["0x5041ed759Dd4aFc3a72b8192C143F72f4724081A"],
        bridgedFromETH: ["0x382bb369d343125bfb2117af9c149795c6c65c50"],
      },
      fuse: {
        bridgedFromETH: ["0xfadbbf8ce7d5b7041be672561bba99f79c532e10"],
      },
      meter: {
        bridgedFromETH: ["0x5fa41671c48e3c951afc30816947126ccc8c162e"],
      },
      milkomeda: {
        bridgedFromETH: [
          "0x80A16016cC4A2E6a2CACA8a4a498b1699fF0f844", // where is this from? assuming multichain
          "0x3795C36e7D12A8c252A20C5a7B455f7c57b60283", // celer
          //"0xab58DA63DFDd6B97EAaB3C94165Ef6f43d951fb2", // nomad, hacked
        ],
      },
      iotex: {
        bridgeOnETH: ["0xC2e0f31d739cB3153bA5760a203B3bd7c27f0d7a"],
        bridgedFromETH: ["0x6fbcdc1169b5130c59e72e51ed68a84841c98cd1"],
      },
      aurora: {
        bridgeOnETH: ["0x23Ddd3e3692d1861Ed57EDE224608875809e127f"],
        bridgedFromNear: ["0x4988a896b1227218e4a686fde5eabdcabd91571f"], // rainbow bridge
        /*
        this is claimed by both rainbow bridge and celer. there does not appear to be enough in the
        rainbow bridge and celer bridge contracts on ethereum for both aurora and near to have
        USDT bridged independently, and near dev claims aurora's USDT may be a subset of near's
        */
      },
      telos: {
        bridgedFromETH: ["0xefaeee334f0fd1712f9a8cc375f427d9cdd40d73"], // assuming multichain
      },
      oasis: {
        bridgedFromETH: [
          //"0x6Cb9750a92643382e020eA9a170AbB83Df05F30B", // EvoDefi, this was rugged, trading at $0.10
          "0xdC19A122e268128B5eE20366299fc7b5b199C8e3", // wormhole #3
          "0x4Bf769b05E832FCdc9053fFFBC78Ca889aCb5E1E", // celer
        ],
        bridgedFromSol: ["0x24285C5232ce3858F00bacb950Cae1f59d1b2704"], // wormhole
        bridgedFromBSC: ["0x366EF31C8dc715cbeff5fA54Ad106dC9c25C6153"], // wormhole
        bridgedFromPolygon: ["0xFffD69E757d8220CEA60dc80B9Fe1a30b58c94F3"], // wormhole
        bridgedFromAvax: ["0x05832a0905E516f29344ADBa1c2052a788B10129"], // wormhole
      },
      bittorrent: {
        bridgedFromETH: ["0xE887512ab8BC60BcC9224e1c3b5Be68E26048B8B"],
        bridgedFromBSC: ["0x9B5F27f6ea9bBD753ce3793a07CbA3C74644330d"],
        bridgedFromTron: ["0xdB28719F7f938507dBfe4f0eAe55668903D34a15"],
      },
      crab: {
        bridgedFromETH: ["0x6a2d262D56735DbA19Dd70682B39F6bE9a931D98"], // celer
      },
      evmos: {
        bridgedFromETH: [
          "0xb72A7567847abA28A2819B855D7fE679D4f59846", // celer
          //"0x7FF4a56B32ee13D7D4D405887E0eA37d61Ed919e", // nomad (contract has 18 decimals, but supply is divided by 10**12), hacked, trading at $0.15
          "0xc1be9a4d5d45beeacae296a7bd5fadbfc14602c4", // multichain
        ],
      },
      terra: {
        bridgedFromSol: ["terra1hd9n65snaluvf7en0p4hqzse9eqecejz2k8rl5"], // wormhole
        bridgedFromETH: ["terra1ce06wkrdm4vl6t0hvc0g86rsy27pu8yadg3dva"], // wormhole
        bridgedFromBSC: ["terra1vlqeghv5mt5udh96kt5zxlh2wkh8q4kewkr0dd"], // wormhole
        bridgedFromAvax: ["terra1eqvq3thjhye7anv6f6mhxpjhyvww8zjvqcdgjx"], // wormhole
      },
      astar: {
        bridgedFromETH: [
          "0xefaeee334f0fd1712f9a8cc375f427d9cdd40d73", // multichain
          "0x3795C36e7D12A8c252A20C5a7B455f7c57b60283", // celer
        ],
      },
      xdai: {
        bridgedFromETH: ["0x4ECaBa5870353805a9F068101A40E0f32ed605C6"],
      },
      theta: {
        bridgedFromETH: ["0x3c751Feb00364CA9e2d0105c40F0b423abf1DEE3"], // multichain
      },
      rsk: {
        bridgedFromETH: ["0xef213441a85df4d7acbdae0cf78004e1e486bb96"],
      },
      reinetwork: {
        bridgedFromETH: ["0x988a631Caf24E14Bb77EE0f5cA881e8B5dcfceC7"], // celer
      },
      loopring: {
        bridgeOnETH: ["0x674bdf20A0F284D710BC40872100128e2d66Bd3f"],
      },
      zksync: {
        bridgeOnETH: ["0xaBEA9132b05A70803a4E85094fD0e1800777fBEF"],
      },
      shiden: {
        bridgedFromETH: ["0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b"], // multichain
      },
      fantom: {
        /*
         * Note that Fantom: 81M in ETH bridge, 171M minted.
         * Not clear where the rest is bridged from, their discord doesn't provide the answer.
         * Assuming it is bridged from Ethereum for now.
         */
        bridgedFromETH: [
          "0x049d68029688eAbF473097a2fC38ef61633A3C7A", // fUSDT
          "0xA40AF6E9c7f86D378F817ec839B0217c29A4730f", // wormhole (0 supply?)
          "0xd226392c23fb3476274ed6759d4a478db3197d82", // axelar (0 supply?)
        ],
      },
      celo: {
        bridgedFromETH6Decimals: [
          "0x88eeC49252c8cbc039DCdB394c0c2BA2f1637EA0", // optics
        ],
        bridgedFromETH18Decimals: [
          "0xcfffe0c89a779c09df3df5624f54cdf7ef5fdd5d", // moss
        ],
      },
      kava: {
        issued: ["0x919C1c267BC06a7039e03fcc2eF738525769109c"],
        bridgedFromETH: [
          "0xfB1af1baFE108906C0f1f3B36D15919B95ee95BD", // celer
          "0xB44a9B6905aF7c801311e8F4E76932ee959c663C", // multichain
          "0x7f5373AE26c3E8FfC4c77b7255DF7eC1A9aF52a6", // axelar
        ],
        unreleased: ["0x5754284f345afc66a98fbB0a0Afe71e0F007B949"], // https://tether.to/en/transparency/#usdt
      },
      conflux: {
        bridgedFromETH: [
          "0xfe97e85d13abd9c1c33384e796f10b73905637ce", // celer
          "0x8b8689c7f3014a4d86e4d1d0daaf74a47f5e0f27", // (converted address) shuttleflow
        ],
      },
      ontology: {
        bridgedFromETH: [
          "ac654837a90eee8fccabd87a2d4fc7637484f01a", // poly network
          "0xd85e30c5d372942810c86c4ac9d7b3bb24cc1965", // celer
        ],
        unreleased: ["AVaijxNJvAXYdNMVSYAfT8wVTh8tNHcTBM"], // poly network reserve
      },
      sx: {
        bridgedFromETH: ["0x03Cc0D20B5eA163Aa3c0851235f4653F6Fe61017"], // celer
      },
      ethereumclassic: {
        bridgedFromETH: ["0xc9BAA8cfdDe8E328787E29b4B078abf2DaDc2055"], // multichain
      },
      near: {
        issued: ["usdt.tether-token.near"],
        bridgedFromETH: [
          "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near",
        ], // rainbow bridge
      },
      wan: {
        bridgeOnETH: ["0xfCeAAaEB8D564a9D0e71Ef36f027b9D162bC334e"], // amount minted on wan does not match amount in bridge contract, using bridge contract amount for now
      },
      defichain: {
        bridgeOnETH: ["0x94fa70d079d76279e1815ce403e9b985bccc82ac"], // seems there is no direct bridge from ETH. but users can withdraw to defichain using cake defi?
      },
      klaytn: {
        bridgedFromETH: ["0xcee8faf64bb97a73bb51e115aa89c17ffa8dd167"], // orbit
      },
      canto: {
        bridgedFromETH: ["0xd567B3d7B8FE3C79a1AD8dA978812cfC4Fa05e75"], // canto/gravity
      },
      everscale: {
        bridgeOnETH: ["0x81598d5362eAC63310e5719315497C5b8980C579"], // octus(?)
      },
      dogechain: {
        bridgedFromETH: ["0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D"], // multichain
      },
      arbitrum_nova: {
        bridgedFromETH: ["0x52484E1ab2e2B22420a25c20FA49E173a26202Cd"],
      },
      ethpow: {
        bridgedFromETH: ["0x2ad7868ca212135c6119fd7ad1ce51cfc5702892"], // chainge
      },
      aptos: {
        bridgedFromETH: [
          "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa", // stargate
          "0xa2eda21a58856fda86451436513b867c97eecb4ba099da5775520e0f7492e852", // wormhole
        ],
      },
      mixin: {
        ethAssetIds: ["4d8c508b-91c5-375b-92b0-ee702ed2dac5"],
        tronAssetIds: ["b91e18ff-a9ae-3dc7-8679-e935d9a4b34b"],
        polygonAssetIds: ["218bc6f4-7927-3f8e-8568-3a3725b74361"],
        BSCAssetIds: ["94213408-4ee7-3150-a9c4-9c5cce421c78"],
        EOSAssetIds: ["5dac5e28-ad13-31ea-869f-41770dfcee09"],
      },
      thundercore: {
        bridgeFromETH: [
          "0x0dcb0cb0120d355cde1ce56040be57add0185baa", // multichain
          "0x4f3C8E20942461e2c3Bdd8311AC57B0c222f2b82",
        ],
      },
      osmosis: {
        bridgedFromETH: [
          "ibc/8242AD24008032E457D2E12D46588FD39FB54FB29680C6C7663D296B383C37C4",
        ], // axelar
        bridgedFromKava: [
          "ibc/4ABBEF4C8926DDDB320AE5188CFD63267ABBCEFC0583E4AE05D6E5AA2401DDAB",
        ],
      },
      waves: {
        bridgeOnETH: ["0x0de7b091A21BD439bdB2DfbB63146D9cEa21Ea83"], // PepeTeam Bridge
      },
      starknet: {
        bridgeOnETH: ["0xbb3400F107804DFB482565FF1Ec8D8aE66747605"], // starknet Bridge
      },
      mode: {
        bridgedFromETH: ["0xf0f161fda2712db8b566946122a5af183995e2ed"], 
      },
      manta: {
        bridgedFromETH: ["0xf417f5a458ec102b90352f697d6e2ac3a3d2851f"],
      },
  };
  