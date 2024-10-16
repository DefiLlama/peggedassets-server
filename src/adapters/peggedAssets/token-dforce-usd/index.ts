const chainContracts = {
  ethereum: {
    issued: ["0x0a5E677a6A24b2F1A2Bf4F3bFfC443231d2fDEc8"],
    unreleased: [
      "0x9e8b68e17441413b26c2f18e741eaba69894767c", // MSD
      "0x40be37096ce3b8a2e9ec002468ab91071501c499", // L1 escrow
      "0x5427fefa711eff984124bfbb1ab6fbf5e3da1820", // cbridge
      //"0x1adc34af68e970a93062b67344269fd341979eb0", // iUSX
    ],
  },
  polygon: {
    issued: ["0xCf66EB3D546F0415b368d98A95EAF56DeD7aA752"],
    unreleased: [
      "0x88DCDC47D2f83a99CF0000FDF667A468bB958a78", // cbridge
      //"0xc171EBE1A2873F042F1dDdd9327D00527CA29882", // iUSX
    ],
  },
  bsc: {
    issued: ["0xb5102cee1528ce2c760893034a4603663495fd72"],
    unreleased: [
      "0xdd90e5e87a2081dcf0391920868ebc2ffb81a1af", // cbridge
      //"0x7b933e1c1f44be9fb111d87501baada7c8518abe", // iUSX
    ],
  },
  avax: {
    issued: ["0x853ea32391AaA14c112C645FD20BA389aB25C5e0"],
    unreleased: [
      "0xef3c714c9425a8F3697A9C969Dc1af30ba82e5d4", // cbridge
      "0x73C01B355F2147E5FF315680E068354D6344Eb0b", // iUSX, none is borrowed
    ],
  },
  kava: {
    issued: ["0xDb0E1e86B01c4ad25241b1843E407Efc4D615248"],
    unreleased: [
      "0xb51541df05DE07be38dcfc4a80c05389A54502BB", // cbridge
      "0x9787aF345E765a3fBf0F881c49f8A6830D94A514", // iUSX, none is borrowed
    ],
  },
  arbitrum: {
    issued: ["0x641441c631e2f909700d2f41fd87f0aa6a6b4edb"],
    unreleased: [
      "0x9e8b68e17441413b26c2f18e741eaba69894767c", // vault
      "0x1619de6b6b20ed217a58d00f37b9d47c7663feca", // cbridge
      //"0x0385f851060c09a552f1a28ea3f612660256cbaa", // iUSX
    ],
  },
  optimism: {
    issued: ["0xbfD291DA8A403DAAF7e5E9DC1ec0aCEaCd4848B9"],
    unreleased: [
      "0x40a33fb67b8dafe88a5b1930be03c82157f47c65", // don't know
      "0x9D39Fc627A6d9d9F8C831c16995b209548cc3401", // cbridge
      //"0x7e7e1d8757b241aa6791c089314604027544ce43", // iUSX
    ],
  },
  conflux: {
    issued: ["0x422a86f57b6b6F1e557d406331c25EEeD075E7aA"],
    unreleased: [
      "0x841ce48F9446C8E281D3F1444cB859b4A6D0738C", // cbridge
      "0x6f87b39a2e36F205706921d81a6861B655db6358", // iUSX
    ],
  },
  base: {
    issued: ["0xc142171B138DB17a1B7Cb999C44526094a4dae05"],
    unreleased: [
      "0x7d43AABC515C356145049227CeE54B608342c0ad", // cbridge
      // "0x82AFc965E4E18009DD8d5AF05cfAa99bF0E605df", // iUSX
    ],
  },
};


import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
