export type ChainContracts = {
    [chain: string]: {
      [contract: string]: string[];
    };
  };
  
  export const chainContracts: ChainContracts = {
    ethereum: {
        issued: ["0x6B175474E89094C44Da98b954EedeAC495271d0F"],
      },
      solana: {
        bridgedFromETH: [
          "EjmyN6qEC1Tf1JxiG1ae7UTJhUxSwk1TCWNWqxWV4J6o", // wormhole
          "9w6LpS7RU1DKftiwH3NgShtXbkMM1ke9iNU4g3MBXSUs", // allbridge
        ],
        bridgedFromPolygon: ["4Fo67MYQpVhZj9R7jQTd63FPAnWbPpaafAUxsMGX2geP"], // wormhole
        bridgedFromAvax: ["EgQ3yNtVhdHz7g1ZhjfGbxhFKMPPaFkz8QHXM5RBZBgi"], // allbridge
        bridgedFromFantom: ["HjUhUzi6fVkY1BndaSc4Dcg2mCzvnqzXjVJtXsj78ver"], // allbridge
      },
      polygon: {
        bridgedFromETH: [
          "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
          "0xddc9e2891fa11a4cc5c223145e8d14b44f3077c9", // axelar
        ],
      },
      bsc: {
        bridgedFromETH: [
          "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3", // 70M disparity, asked on forum about it: https://forum.makerdao.com/t/query-on-dai-bridged-from-ethereum-to-bsc/15121
          "0x3413a030EF81a3dD5a302F4B4D11d911e12ed337", // wormhole
        ],
      },
      optimism: {
        bridgedFromETH: ["0xda10009cbd5d07dd0cecc66161fc93d7c9000da1"],
      },
      harmony: {
        bridgedFromETH: ["0xef977d2f931c1978db5f6747666fa1eacb0d0339"],
      },
      avax: {
        bridgedFromETH: [
          "0xd586e7f844cea2f87f50152665bcbc2c279d8d70",
          "0xbA7dEebBFC5fA1100Fb055a87773e1E99Cd3507a", // avalanche-ethereum bridge (old)
          "0xc5fa5669e326da8b2c35540257cd48811f40a36b", // axelar
        ],
      },
      arbitrum: {
        bridgedFromETH: ["0xda10009cbd5d07dd0cecc66161fc93d7c9000da1"], // same address as optimism
      },
      moonriver: {
        bridgedFromETH: ["0x80a16016cc4a2e6a2caca8a4a498b1699ff0f844"], // multichain
      },
      aurora: {
        bridgedFromNear: ["0xe3520349f477a5f6eb06107066048508498a291b"], // claimed by both celer and rainbow
      },
      fantom: {
        bridgedFromETH: [
          "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e", // multichain
          "0xd5d5350f42cb484036a1c1af5f2df77eafadcaff", // axelar
        ],
      },
      moonbeam: {
        bridgedFromETH: [
          "0x765277eebeca2e31912c9946eae1021199b39c61", // multichain
          // "0xc234A67a4F840E61adE794be47de455361b52413", // nomad, hacked
          "0x14df360966a1c4582d2b18edbdae432ea0a27575", // axelar
        ],
      },
      syscoin: {
        bridgedFromETH: ["0xefaeee334f0fd1712f9a8cc375f427d9cdd40d73"], // multichain
      },
      milkomeda: {
        bridgedFromETH: [
          //"0x639a647fbe20b6c8ac19e48e2de44ea792c62c5c", // multichain
          "0x6De33698e9e9b787e09d3Bd7771ef63557E148bb", // celer
          //"0x41eAFC40CD5Cb904157A10158F73fF2824dC1339", // nomad, hacked
        ],
      },
      astar: {
        bridgedFromETH: ["0x6De33698e9e9b787e09d3Bd7771ef63557E148bb"], // celer
      },
      oasis: {
        bridgedFromETH: ["0x5a4Ba16C2AeB295822A95280A7c7149E87769E6A"], // celer
      },
      evmos: {
        bridgedFromETH: [
          "0x940dAAbA3F713abFabD79CdD991466fe698CBe54", // celer
          //"0x63743ACF2c7cfee65A5E356A4C4A005b586fC7AA", // nomad, hacked, trading at $0.16
        ],
      },
      xdai: {
        bridgedFromETH: ["0x4aa42145Aa6Ebf72e164C9bBC74fbD3788045016"],
        bridgedFromBSC: ["0xFc8B2690F66B46fEC8B3ceeb95fF4Ac35a0054BC"], // address related to OmniBridge, I don't get what this token is though
      },
      terra: {
        bridgedFromETH: ["terra1zmclyfepfmqvfqflu8r3lv6f75trmg05z7xq95"], // wormhole
      },
      rsk: {
        bridgedFromETH: [
          "0x6b1a73d547f4009a26b8485b63d7015d248ad406",
          // "0x639a647fbe20b6c8ac19e48e2de44ea792c62c5c", //multichain
        ],
      },
      reinetwork: {
        bridgedFromETH: ["0x0ba85980B122353D77fBb494222a10a46E4FB1f6"], // celer
      },
      loopring: {
        bridgeOnETH: ["0x674bdf20A0F284D710BC40872100128e2d66Bd3f"],
      },
      zksync: {
        bridgeOnETH: ["0xaBEA9132b05A70803a4E85094fD0e1800777fBEF"],
      },
      aztec: {
        bridgeOnETH: [
          "0x737901bea3eeb88459df9ef1BE8fF3Ae1B42A2ba",
          "0xFF1F2B4ADb9dF6FC8eAFecDcbF96A2B351680455",
        ],
      },
      velas: {
        bridgedFromETH: ["0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D"], // multichain
      },
      kcc: {
        bridgedFromETH: ["0xc9baa8cfdde8e328787e29b4b078abf2dadc2055"], // multichain
      },
      shiden: {
        bridgedFromETH: ["0xefaeee334f0fd1712f9a8cc375f427d9cdd40d73"], // multichain
      },
      fusion: {
        bridgedFromETH: [
          "0x1f858232892f9968d05bb5a69d1a02b14ea6fa57d97549481345838a13339889",
        ], // multichain?
      },
      boba: {
        bridgedFromETH: ["0xf74195Bb8a5cf652411867c5C2C5b8C2a402be35"],
      },
      conflux: {
        bridgedFromETH: [
          "0x87929dda85a959f52cab6083a2fba1b9973f15e0", // don't know
          "0x74eaE367d018A5F29be559752e4B67d01cc6b151", // celer
        ],
      },
      starknet: {
        bridgeOnETH: ["0x0437465dfb5b79726e35f08559b0cbea55bb585c"],
      },
      ontology: {
        bridgedFromETH: ["7b956c0c11fcffb9c9227ca1925ba4c3486b36f1"], // poly network
        unreleased: ["AVaijxNJvAXYdNMVSYAfT8wVTh8tNHcTBM"],
      },
      sx: {
        bridgedFromETH: ["0x53813CD4aCD7145A716B4686b195511FA93e4Cb7"], // celer
      },
      /*
      ethereumclassic: {
        bridgedFromETH: ["0x2C78f1b70Ccf63CDEe49F9233e9fAa99D43AA07e"], // multichain
      },
      */
      near: {
        bridgedFromETH: [
          "6b175474e89094c44da98b954eedeac495271d0f.factory.bridge.near",
        ], // rainbow
      },
      klaytn: {
        bridgedFromETH: ["0x5c74070fdea071359b86082bd9f9b3deaafbe32b"], // orbit (bridge has some in farms, check DL adapter)
      },
      everscale: {
        bridgeOnETH: ["0x032D06B4cC8A914b85615AcD0131C3e0a7330968"], // octus(?), does not match amount that is minted on the chain
      },
      /*
      dogechain: {
        //bridgedFromETH: ["0x639A647fbe20b6c8ac19E48E2de44ea792c62c5C"], // multichain
      },
      */
      thundercore: {
        bridgedFromETH: ["0x461d52769884ca6235b685ef2040f47d30c94eb5"], // multichain
      },
      metis: {
        bridgedFromETH: ["0x4c078361FC9BbB78DF910800A991C7c3DD2F6ce0"],
      },
      arbitrum_nova: {
        bridgedFromETH: ["0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1"],
      },
      kava: {
        bridgedFromETH: ["0x765277EebeCA2e31912C9946eAe1021199B39C61"], // multichain
      },
      mixin: {
        ethAssetIds: ["8549b4ad-917c-3461-a646-481adc5d7f7f"],
      },
      osmosis: {
        bridgedFromETH: [
          "ibc/0CD3A0285E1341859B5E86B6AB7682F023D03E97607CCC1DC95706411D866DF7",
        ], // axelar
      },
      era: {
        bridgeOnETH: ["0x32400084C286CF3E17e7B677ea9583e60a000324"],
        bridgedFromETH: ["0x4B9eb6c0b6ea15176BBF62841C6B2A8a398cb656"],
      },
      pulse: {
        bridgedFromETH: ["0xefD766cCb38EaF1dfd701853BFCe31359239F305"], // PulseRamp
      },
  };
  