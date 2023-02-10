import type { BridgeInfo } from "./types";

type BridgeMapping = {
  [address: string]: {
    bridge: BridgeID;
    sourceChain?: string;
  };
};

export type BridgeID = keyof typeof bridgeInfo;

const formattedSourceChains = {
  eth: "Ethereum",
  bsc: "BSC",
  terra: "Terra",
  heco: "Heco",
  polygon: "Polygon",
  avax: "Avalanche",
  sol: "Solana",
  ftm: "Fantom",
  celo: "Celo",
  tron: "Tron",
  bttc: "Bittorrent",
  waves: "Waves",
  rsk: "RSK",
  fantom: "Fantom",
  near: "Near",
};

export default {
  "0x1c20e891bab6b1727d14da358fae2984ed9b59eb": { bridge: "issued" },
  Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: { bridge: "issued" },
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: { bridge: "issued" },
  "0xc1be9a4d5d45beeacae296a7bd5fadbfc14602c4": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0x461d52769884ca6235b685ef2040f47d30c94eb5": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0xf27Ee99622C3C9b264583dACB2cCE056e194494f": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0x639A647fbe20b6c8ac19E48E2de44ea792c62c5C": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0x765277EebeCA2e31912C9946eAe1021199B39C61": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0x332730a4F6E03D9C55829435f10360E13cfA41Ff": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0xb12c13e66AdE1F72f71834f2FC5082Db8C091358": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0xC1Be9a4D5D45BeeACAE296a7BD5fADBfc14602C4": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0xc9BAA8cfdDe8E328787E29b4B078abf2DaDc2055": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0x2130d2a1e51112D349cCF78D2a1EE65843ba36e0": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0xb2c22A9fb4FC02eb9D1d337655Ce079a04a526C7": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0xB67FA6deFCe4042070Eb1ae1511Dcd6dcc6a532E": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0x9879abdea01a879644185341f7af7d8343556b7a": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0xb44a9b6905af7c801311e8f4e76932ee959c663c": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0xeFAeeE334F0Fd1712f9a8cc375f427D9Cdd40d73": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0xB44a9B6905aF7c801311e8F4E76932ee959c663C": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0x3Ca3fEFA944753b43c751336A5dF531bDD6598B6": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0xfa9343c3897324496a05fc75abed6bac29f8a40f": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0xfA9343C3897324496A05fC75abeD6bAC29f8A40f": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.bsc,
  },
  "0x818ec0a7fe18ff94269904fced6ae3dae6d6dc0b": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0xe2d27f06f63d98b8e11b38b5b08a75d0c8dd62b9": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.terra,
  },
  "0x44Dd7C98885cD3086E723B8554a90c9cC4089C4C": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0x218c3c3D49d0E7B37aff0D8bB079de36Ae61A4c0": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.bsc,
  },
  "0x0cae51e1032e8461f4806e26332c030e34de3adb": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  FR87nWEUxVgerFGhZM8Y4AggKGLnaXswr1Pd8wZ4kZcp: {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0x45c32fA6DF82ead1e2EF74d17b76547EDdFaFF89": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0x3129662808bEC728a27Ab6a6b9AFd3cBacA8A43c": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0x2f29bc0ffaf9bff337b31cbe6cb5fb3bf12e5840": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0x2E3D870790dC77A83DD1d18184Acc7439A53f475": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0x1A93B23281CC1CDE4C4741353F3064709A16197d": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0x322E86852e492a7Ee17f28a78c663da38FB33bfb": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0xFa7191D292d5633f702B0bd7E3E3BcCC0e633200": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0xE03494D0033687543a80c9B1ca7D6237F2EA8BD8": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0xdc301622e621166BD8E82f2cA0A26c13Ad0BE355": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0x7562F525106F5d54E891e005867Bf489B5988CD9": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0xE4B9e004389d91e4134a28F19BD833cBA1d994B6": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0xD24C2Ad096400B6FBcd2ad8B24E7acBc21A1da64": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0x90c97f71e18723b0cf0dfa30ee176ab653e89f40": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0x1f858232892f9968d05bb5a69d1a02b14ea6fa57d97549481345838a13339889": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0xc9baa8cfdde8e328787e29b4b078abf2dadc2055": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0x639a647fbe20b6c8ac19e48e2de44ea792c62c5c": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0x765277eebeca2e31912c9946eae1021199b39c61": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0x80a16016cc4a2e6a2caca8a4a498b1699ff0f844": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0x2bf9b864cdc97b08b6d79ad4663e71b8ab65c45c": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.bsc,
  },
  "0x2C78f1b70Ccf63CDEe49F9233e9fAa99D43AA07e": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0xC931f61B1534EB21D8c11B24f3f5Ab2471d4aB50": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.bsc,
  },
  "0x2bF9b864cdc97b08B6D79ad4663e71B8aB65c45c": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.bsc,
  },
  "0x461d52769884ca6235B685EF2040F47d30C94EB5": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.bsc,
  },
  "0x375488F097176507e39B9653b88FDc52cDE736Bf": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.bsc,
  },
  "0x65e66a61d0a8f1e686c2d6083ad611a10d84d97a": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.bsc,
  },
  "0x5D9ab5522c64E1F6ef5e3627ECCc093f56167818": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.bsc,
  },
  "0x218c3c3d49d0e7b37aff0d8bb079de36ae61a4c0": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0xa649325aa7c5093d12d6f98eb4378deae68ce23f": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.bsc,
  },
  "0x9fb83c0635de2e815fd1c21b3a292277540c2e8d": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.bsc,
  },
  "0x332730a4f6e03d9c55829435f10360e13cfa41ff": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.bsc,
  },
  "0x049d68029688eAbF473097a2fC38ef61633A3C7A": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0xefaeee334f0fd1712f9a8cc375f427d9cdd40d73": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0x3c751Feb00364CA9e2d0105c40F0b423abf1DEE3": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0x80A16016cC4A2E6a2CACA8a4a498b1699fF0f844": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0xCB8FA9a76b8e203D8C3797bF438d8FB81Ea3326A": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0x922d641a426dcffaef11680e5358f34d97d112e1": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0x0e1694483ebb3b74d3054e383840c6cf011e518e": {
    bridge: "multichain",
    sourceChain: formattedSourceChains.eth,
  },
  "0x37f750B7cC259A2f741AF45294f6a16572CF5cAd": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.eth,
  },
  "0x1F3a10587A20114EA25Ba1b388EE2dD4A337ce27": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.eth,
  },
  CbNYA9n3927uXUukee2Hf4tm3xxkffJPPZvGazc2EAH1: {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.eth,
  },
  "43m2ewFV5nDepieFjT9EmAQnc1HRtAF247RBpLGFem5F": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.eth,
  },
  "0xDe60aDfDdAAbaAAC3dAFa57B26AcC91Cb63728c4": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.bsc,
  },
  "7VQo3HFLNH5QqGtM8eC3XQbPkJUu7nS9LeGWjerRh5Sw": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.eth,
  },
  BybpSTBoZHsmKnfxYG47GDhVPKrnEKX31CScShbrzUhX: {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.eth,
  },
  "0xb8398DA4FB3BC4306B9D9d9d13d9573e7d0E299f": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.sol,
  },
  "0x2Ec752329c3EB419136ca5e4432Aa2CDb1eA23e6": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.eth,
  },
  "0x05CbE6319Dcc937BdbDf0931466F4fFd0d392B47": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.avax,
  },
  "0x3E62a9c3aF8b810dE79645C4579acC8f0d06a241": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.polygon,
  },
  "0x4cA2A3De42eabC8fd8b0AC46127E64DB08b9150e": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.bsc,
  },
  "0xE8A638b3B7565Ee7c5eb9755E58552aFc87b94DD": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.eth,
  },
  "0x1d1149a53deB36F2836Ae7877c9176413aDfA4A8": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.sol,
  },
  Terra1pvel56a2hs93yd429pzv9zp5aptcjg5ulhkz7w: {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.avax,
  },
  terra1pvel56a2hs93yd429pzv9zp5aptcjg5ulhkz7w: {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.avax,
  },
  Terra1kkyyh7vganlpkj0gkc2rfmhy858ma4rtwywe3x: {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.polygon,
  },
  terra1kkyyh7vganlpkj0gkc2rfmhy858ma4rtwywe3x: {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.polygon,
  },
  Terra1yljlrxvkar0c6ujpvf8g57m5rpcwl7r032zyvu: {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.bsc,
  },
  terra1yljlrxvkar0c6ujpvf8g57m5rpcwl7r032zyvu: {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.bsc,
  },
  Terra1pepwcav40nvj3kh60qqgrk8k07ydmc00xyat06: {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.eth,
  },
  terra1pepwcav40nvj3kh60qqgrk8k07ydmc00xyat06: {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.eth,
  },
  Terra1e6mq63y64zcxz8xyu5van4tgkhemj3r86yvgu4: {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.sol,
  },
  terra1e6mq63y64zcxz8xyu5van4tgkhemj3r86yvgu4: {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.sol,
  },
  AGqKX7F4mqJ8x2mUQVangJb5pWQJApaKoUfe5gXM53CV: {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.avax,
  },
  E2VmbootbVCBkMNNxKQgCLMS1X3NoGMaYAsufaAsf7M: {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.polygon,
  },
  FCqfQSujuPxy6V42UvafBhsysWtEq1vhjfMN1PUbgaxA: {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.bsc,
  },
  A9mUU4qviSctJVPJdBJWkb28deg915LYJKrzQ19ji3FM: {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.eth,
  },
  FVsXUnbhifqJ4LiXQEbpUtXVdB8T5ADLKqSs5t1oc54F: {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.eth,
  },
  "0x543672E9CBEC728CBBa9C3Ccd99ed80aC3607FA8": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.polygon,
  },
  "0x6145E8a910aE937913426BF32De2b26039728ACF": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.bsc,
  },
  "0x0950Fc1AD509358dAeaD5eB8020a3c7d8b43b9DA": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.sol,
  },
  "0xB24CA28D4e2742907115fECda335b40dbda07a4C": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.eth,
  },
  "0xc1F47175d96Fe7c4cD5370552e5954f384E3C791": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.avax,
  },
  "0x672147dD47674757C457eB155BAA382cc10705Dd": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.polygon,
  },
  "0xB04906e95AB5D797aDA81508115611fee694c2b3": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.eth,
  },
  "0x91Ca579B0D47E5cfD5D0862c21D5659d39C8eCf0": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.sol,
  },
  "0x576cf361711cd940cd9c397bb98c4c896cbd38de": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.sol,
  },
  "0x4318cb63a2b8edf2de971e2f17f77097e499459d": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.eth,
  },
  "0x566957eF80F9fd5526CD2BEF8BE67035C0b81130": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.polygon,
  },
  "0x7cd167B101D2808Cfd2C45d17b2E7EA9F46b74B6": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.bsc,
  },
  "0x41f7B8b9b897276b7AAE926a9016935280b44E97": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.sol,
  },
  "0xa1E73c01E0cF7930F5e91CB291031739FE5Ad6C2": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.terra,
  },
  "0xb599c3590F42f8F995ECfa0f85D2980B76862fc1": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.terra,
  },
  "0x846e4D51d7E2043C1a87E0Ab7490B93FB940357b": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.terra,
  },
  CXLBjMMcwkc17GfJtBos6rQCo1ypeH6eDbB82Kby4MRm: {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.terra,
  },
  "9vMJfxuKxXBoEa7rM12mYLMwTacLMLDJqHozw96WQL8i": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.terra,
  },
  "0xE6469Ba6D2fD6130788E0eA9C0a0515900563b59": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.terra,
  },
  "0x3d4350cD54aeF9f9b2C29435e0fa809957B3F30a": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.terra,
  },
  "0xa693B19d2931d498c5B318dF961919BB4aee87a5": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.terra,
  },
  Terra15a9dr3a2a2lj5fclrw35xxg9yuxg0d908wpf2y: {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.eth,
  },
  HRQke5DKdDo3jV7wnomyiM8AA3EzkVnxMDdo2FQ5XUe1: {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.eth,
  },
  "0x362233F1eF554Ca08555Ca191b4887c2C3132834": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.eth,
  },
  Terra1zmclyfepfmqvfqflu8r3lv6f75trmg05z7xq95: {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.eth,
  },
  terra1zmclyfepfmqvfqflu8r3lv6f75trmg05z7xq95: {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.eth,
  },
  "0x3413a030EF81a3dD5a302F4B4D11d911e12ed337": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.eth,
  },
  "4Fo67MYQpVhZj9R7jQTd63FPAnWbPpaafAUxsMGX2geP": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.polygon,
  },
  EjmyN6qEC1Tf1JxiG1ae7UTJhUxSwk1TCWNWqxWV4J6o: {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.eth,
  },
  "0xf6568FD76f9fcD1f60f73b730F142853c5eF627E": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.bsc,
  },
  Terra1skjr69exm6v8zellgjpaa2emhwutrk5a6dz7dd: {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.bsc,
  },
  terra1skjr69exm6v8zellgjpaa2emhwutrk5a6dz7dd: {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.bsc,
  },
  "0xA8D394fE7380b8cE6145d5f85E6aC22d4E91ACDe": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.bsc,
  },
  "5RpUwQ8wtdPCZHhu6MERp2RGrpobsbZ6MH5dDHkUjs2": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.bsc,
  },
  AJ1W9A9N9dEMdVyoDiam2rV44gnBm2csrPDP7xqcapgX: {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.eth,
  },
  "33fsBLA8djQm82RpHmE3SuVrPGtZBWNYExsEUeKX1HXX": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.eth,
  },
  "0xA41a6c7E25DdD361343e8Cb8cFa579bbE5eEdb7a": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.bsc,
  },
  "0x035de3679E692C471072d1A09bEb9298fBB2BD31": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.eth,
  },
  "0x7B4B0B9b024109D182dCF3831222fbdA81369423": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.bsc,
  },
  "0xA40AF6E9c7f86D378F817ec839B0217c29A4730f": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.eth,
  },
  Terra1eqvq3thjhye7anv6f6mhxpjhyvww8zjvqcdgjx: {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.avax,
  },
  terra1eqvq3thjhye7anv6f6mhxpjhyvww8zjvqcdgjx: {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.avax,
  },
  Terra1vlqeghv5mt5udh96kt5zxlh2wkh8q4kewkr0dd: {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.bsc,
  },
  terra1vlqeghv5mt5udh96kt5zxlh2wkh8q4kewkr0dd: {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.bsc,
  },
  Terra1ce06wkrdm4vl6t0hvc0g86rsy27pu8yadg3dva: {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.eth,
  },
  terra1ce06wkrdm4vl6t0hvc0g86rsy27pu8yadg3dva: {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.eth,
  },
  Terra1hd9n65snaluvf7en0p4hqzse9eqecejz2k8rl5: {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.sol,
  },
  terra1hd9n65snaluvf7en0p4hqzse9eqecejz2k8rl5: {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.sol,
  },
  "0x05832a0905E516f29344ADBa1c2052a788B10129": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.avax,
  },
  "0xFffD69E757d8220CEA60dc80B9Fe1a30b58c94F3": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.polygon,
  },
  "0x366EF31C8dc715cbeff5fA54Ad106dC9c25C6153": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.bsc,
  },
  "0x24285C5232ce3858F00bacb950Cae1f59d1b2704": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.sol,
  },
  "0xdC19A122e268128B5eE20366299fc7b5b199C8e3": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.eth,
  },
  B2wfeYz5VtBnQVrX4M8F6FeDrprVrzKPws5qg1in8bzR: {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.avax,
  },
  "8qJSyQprMC57TWKaYEmetUR3UUiTP2M3hXdcvFhkZdmv": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.bsc,
  },
  "5goWRao6a3yNC4d6UjMdQxonkCMvKBwdpubU3qhfcdf1": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.polygon,
  },
  Dn4noZ5jgGfkntzcQSUZ8czkreiZ1ForXYoV2H8Dm7S1: {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.eth,
  },
  "0xA67BCC0D06d7d13A13A2AE30bF30f1B434f5a28B": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.bsc,
  },
  "0xF0FF231e3F1A50F83136717f287ADAB862f89431": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.sol,
  },
  "0x49d5cC521F75e13fa8eb4E89E9D381352C897c96": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.sol,
  },
  "0x524bC91Dc82d6b90EF29F76A3ECAaBAffFD490Bc": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.eth,
  },
  "0x2B90E061a517dB2BbD7E39Ef7F733Fd234B494CA": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.avax,
  },
  "0x3553f861dEc0257baDA9F8Ed268bf0D74e45E89C": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.sol,
  },
  "0x9417669fBF23357D2774e9D421307bd5eA1006d2": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.eth,
  },
  "0x1CDD2EaB61112697626F7b4bB0e23Da4FeBF7B7C": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.sol,
  },
  "0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.eth,
  },
  "0xa2eda21a58856fda86451436513b867c97eecb4ba099da5775520e0f7492e852": {
    bridge: "wormhole",
    sourceChain: formattedSourceChains.eth,
  },
  "0x53813CD4aCD7145A716B4686b195511FA93e4Cb7": {
    bridge: "celer",
    sourceChain: formattedSourceChains.eth,
  },
  "0xe2aa35C2039Bd0Ff196A6Ef99523CC0D3972ae3e": {
    bridge: "celer",
    sourceChain: formattedSourceChains.eth,
  },
  "0x03Cc0D20B5eA163Aa3c0851235f4653F6Fe61017": {
    bridge: "celer",
    sourceChain: formattedSourceChains.eth,
  },
  "0x08f7e8a161652d9f2fbfe200b18709540de5ced1": {
    bridge: "celer",
    sourceChain: formattedSourceChains.eth,
  },
  "0xd85e30c5d372942810c86c4ac9d7b3bb24cc1965": {
    bridge: "celer",
    sourceChain: formattedSourceChains.eth,
  },
  "0x181002D60d504d30a39601Ae13Af3191cb102580": {
    bridge: "celer",
    sourceChain: formattedSourceChains.eth,
  },
  "0xDA0019E7e50Ee4990440b1aa5dFFCAC6E27Ee27B": {
    bridge: "celer",
    sourceChain: formattedSourceChains.eth,
  },
  "0x16365b45EB269B5B5dACB34B4a15399Ec79b95eB": {
    bridge: "celer",
    sourceChain: formattedSourceChains.eth,
  },
  "0xfB1af1baFE108906C0f1f3B36D15919B95ee95BD": {
    bridge: "celer",
    sourceChain: formattedSourceChains.eth,
  },
  "0x23367BEA9B6931690960d8c59f6e708630f24E58": {
    bridge: "celer",
    sourceChain: formattedSourceChains.eth,
  },
  "0x81ECac0D6Be0550A00FF064a4f9dd2400585FE9c": {
    bridge: "celer",
    sourceChain: formattedSourceChains.eth,
  },
  "0x6a2d262D56735DbA19Dd70682B39F6bE9a931D98": {
    bridge: "celer",
    sourceChain: formattedSourceChains.eth,
  },
  "0x8d5E1225981359E2E09A3AB8F599A51486f53314": {
    bridge: "celer",
    sourceChain: formattedSourceChains.eth,
  },
  "0xe46910336479F254723710D57e7b683F3315b22B": {
    bridge: "celer",
    sourceChain: formattedSourceChains.eth,
  },
  "0x74eaE367d018A5F29be559752e4B67d01cc6b151": {
    bridge: "celer",
    sourceChain: formattedSourceChains.eth,
  },
  "0x0ba85980B122353D77fBb494222a10a46E4FB1f6": {
    bridge: "celer",
    sourceChain: formattedSourceChains.eth,
  },
  "0x940dAAbA3F713abFabD79CdD991466fe698CBe54": {
    bridge: "celer",
    sourceChain: formattedSourceChains.eth,
  },
  "0x5a4Ba16C2AeB295822A95280A7c7149E87769E6A": {
    bridge: "celer",
    sourceChain: formattedSourceChains.eth,
  },
  "0x6De33698e9e9b787e09d3Bd7771ef63557E148bb": {
    bridge: "celer",
    sourceChain: formattedSourceChains.eth,
  },
  "0x4Bf769b05E832FCdc9053fFFBC78Ca889aCb5E1E": {
    bridge: "celer",
    sourceChain: formattedSourceChains.bsc,
  },
  "0x3b40D173b5802733108E047CF538Be178646b2e4": {
    bridge: "celer",
    sourceChain: formattedSourceChains.bsc,
  },
  "0x516e6D96896Aea92cE5e78B0348FD997F13802ad": {
    bridge: "celer",
    sourceChain: formattedSourceChains.bsc,
  },
  "0x988a631Caf24E14Bb77EE0f5cA881e8B5dcfceC7": {
    bridge: "celer",
    sourceChain: formattedSourceChains.eth,
  },
  "0x3795C36e7D12A8c252A20C5a7B455f7c57b60283": {
    bridge: "celer",
    sourceChain: formattedSourceChains.eth,
  },
  "0xb72A7567847abA28A2819B855D7fE679D4f59846": {
    bridge: "celer",
    sourceChain: formattedSourceChains.eth,
  },
  "7g166TuBmnoHKvS2PEkZx6kREZtbfjUxCHGWjCqoDXZv": {
    bridge: "allbridge",
    sourceChain: formattedSourceChains.celo,
  },
  EwxNF8g9UfmsJVcZFTpL9Hx5MCkoQFoJi6XNWzKf1j8e: {
    bridge: "allbridge",
    sourceChain: formattedSourceChains.celo,
  },
  "0xCD7D7Ff64746C1909E44Db8e95331F9316478817": {
    bridge: "allbridge",
    sourceChain: formattedSourceChains.sol,
  },
  "0xb70e0a782b058BFdb0d109a3599BEc1f19328E36": {
    bridge: "allbridge",
    sourceChain: formattedSourceChains.avax,
  },
  Bn113WT6rbdgwrm12UJtnmNqGqZjY4it2WoUQuQopFVn: {
    bridge: "allbridge",
    sourceChain: formattedSourceChains.eth,
  },
  DNhZkUaxHXYvpxZ7LNnHtss8sQgdAfd1ZYS1fB7LKWUZ: {
    bridge: "allbridge",
    sourceChain: formattedSourceChains.polygon,
  },
  E77cpQ4VncGmcAXX16LHFFzNBEBb2U7Ar7LBmZNfCgwL: {
    bridge: "allbridge",
    sourceChain: formattedSourceChains.bsc,
  },
  GfzU1fLASNV3r4NtEyrnwTyTakJkYzoivnaL3Snh45oj: {
    bridge: "allbridge",
    sourceChain: formattedSourceChains.heco,
  },
  FwEHs3kJEdMa2qZHv7SgzCiFXUQPEycEXksfBkwmS8gj: {
    bridge: "allbridge",
    sourceChain: formattedSourceChains.avax,
  },
  "6nuaX3ogrr2CaoAPjtaKHAoBNWok32BMcRozuf32s2QF": {
    bridge: "allbridge",
    sourceChain: formattedSourceChains.eth,
  },
  "0x5C92A4A7f59A9484AFD79DbE251AD2380E589783": {
    bridge: "allbridge",
    sourceChain: formattedSourceChains.bsc,
  },
  "9w6LpS7RU1DKftiwH3NgShtXbkMM1ke9iNU4g3MBXSUs": {
    bridge: "allbridge",
    sourceChain: formattedSourceChains.eth,
  },
  EgQ3yNtVhdHz7g1ZhjfGbxhFKMPPaFkz8QHXM5RBZBgi: {
    bridge: "allbridge",
    sourceChain: formattedSourceChains.avax,
  },
  HjUhUzi6fVkY1BndaSc4Dcg2mCzvnqzXjVJtXsj78ver: {
    bridge: "allbridge",
    sourceChain: formattedSourceChains.ftm,
  },
  CYEFQXzQM6E5P8ZrXgS7XMSwU3CiqHMMyACX4zuaA2Z4: {
    bridge: "allbridge",
    sourceChain: formattedSourceChains.eth,
  },
  A96PoNcxa9LMxcF9HhKAfA1p3M1dGbubPMWf19gHAkgJ: {
    bridge: "allbridge",
    sourceChain: formattedSourceChains.terra,
  },
  "0x5ce9f0b6afb36135b5ddbf11705ceb65e634a9dc": {
    bridge: "allbridge",
    sourceChain: formattedSourceChains.terra,
  },
  "0xEd193C4E69F591E42398eF54DEa65aa1bb02835c": {
    bridge: "allbridge",
    sourceChain: formattedSourceChains.terra,
  },
  "0x0D58a44be3dCA0aB449965dcc2c46932547Fea2f": {
    bridge: "allbridge",
    sourceChain: formattedSourceChains.terra,
  },
  DdFPRnccQqLD4zCHrBqdY95D6hvw6PLWp9DEXj1fLCL9: {
    bridge: "allbridge",
    sourceChain: formattedSourceChains.eth,
  },
  "8XSsNvaKU9FDhYWAv7Yc7qSNwuJSzVrXBNEk7AFiWF69": {
    bridge: "allbridge",
    sourceChain: formattedSourceChains.bsc,
  },
  eqKJTf1Do4MDPyKisMYqVaUFpkEFAs3riGF3ceDH2Ca: {
    bridge: "allbridge",
    sourceChain: formattedSourceChains.polygon,
  },
  "8Yv9Jz4z7BUHP68dz8E8m3tMe6NKgpMUKn8KVqrPA6Fr": {
    bridge: "allbridge",
    sourceChain: formattedSourceChains.avax,
  },
  DHpoYejUDqzByb6HAdaLWF7KZvwUv2vWYDY9cTENNZui: {
    bridge: "allbridge",
    sourceChain: formattedSourceChains.celo,
  },
  Grk6b4UMRWkgyq4Y6S1BnNRF4hRgtnMFp7Sorkv6Ez4u: {
    bridge: "allbridge",
    sourceChain: formattedSourceChains.ftm,
  },
  "0xceed2671d8634e3ee65000edbbee66139b132fbf": {
    bridge: "axelar",
    sourceChain: formattedSourceChains.eth,
  },
  "0xf976ba91b6bb3468c91e4f02e68b37bc64a57e66": {
    bridge: "axelar",
    sourceChain: formattedSourceChains.eth,
  },
  "0x1b6382dbdea11d97f24495c9a90b7c88469134a4": {
    bridge: "axelar",
    sourceChain: formattedSourceChains.eth,
  },
  "0xca01a1d0993565291051daff390892518acfad3a": {
    bridge: "axelar",
    sourceChain: formattedSourceChains.eth,
  },
  "0xfab550568c688d5d8a52c7d794cb93edc26ec0ec": {
    bridge: "axelar",
    sourceChain: formattedSourceChains.eth,
  },
  "0x750e4c4984a9e0f12978ea6742bc1c5d248f40ed": {
    bridge: "axelar",
    sourceChain: formattedSourceChains.eth,
  },
  "0x085416975fe14C2A731a97eC38B9bF8135231F62": {
    bridge: "axelar",
    sourceChain: formattedSourceChains.terra,
  },
  "0x260Bbf5698121EB85e7a74f2E45E16Ce762EbE11": {
    bridge: "axelar",
    sourceChain: formattedSourceChains.terra,
  },
  "0x2b9d3f168905067d88d93f094c938bacee02b0cb": {
    bridge: "axelar",
    sourceChain: formattedSourceChains.terra,
  },
  "0xeddc6ede8f3af9b4971e1fa9639314905458be87": {
    bridge: "axelar",
    sourceChain: formattedSourceChains.terra,
  },
  "0x14df360966a1c4582d2b18edbdae432ea0a27575": {
    bridge: "axelar",
    sourceChain: formattedSourceChains.eth,
  },
  "0xd5d5350f42cb484036a1c1af5f2df77eafadcaff": {
    bridge: "axelar",
    sourceChain: formattedSourceChains.eth,
  },
  "0xc5fa5669e326da8b2c35540257cd48811f40a36b": {
    bridge: "axelar",
    sourceChain: formattedSourceChains.eth,
  },
  "0xddc9e2891fa11a4cc5c223145e8d14b44f3077c9": {
    bridge: "axelar",
    sourceChain: formattedSourceChains.eth,
  },
  "0xd226392c23fb3476274ed6759d4a478db3197d82": {
    bridge: "axelar",
    sourceChain: formattedSourceChains.eth,
  },
  "0xdfd74af792bc6d45d1803f425ce62dd16f8ae038": {
    bridge: "axelar",
    sourceChain: formattedSourceChains.eth,
  },
  "0x8e70cD5B4Ff3f62659049e74b6649c6603A0E594": {
    bridge: "nomad",
    sourceChain: formattedSourceChains.eth,
  },
  "0x51e44FfaD5C2B122C8b635671FCC8139dc636E82": {
    bridge: "nomad",
    sourceChain: formattedSourceChains.eth,
  },
  "0x5a955FDdF055F2dE3281d99718f5f1531744B102": {
    bridge: "nomad",
    sourceChain: formattedSourceChains.eth,
  },
  "0x8f552a71EFE5eeFc207Bf75485b356A0b3f01eC9": {
    bridge: "nomad",
    sourceChain: formattedSourceChains.eth,
  },
  "0x63743ACF2c7cfee65A5E356A4C4A005b586fC7AA": {
    bridge: "nomad",
    sourceChain: formattedSourceChains.eth,
  },
  "0x41eAFC40CD5Cb904157A10158F73fF2824dC1339": {
    bridge: "nomad",
    sourceChain: formattedSourceChains.eth,
  },
  "0xc234A67a4F840E61adE794be47de455361b52413": {
    bridge: "nomad",
    sourceChain: formattedSourceChains.eth,
  },
  "0x7FF4a56B32ee13D7D4D405887E0eA37d61Ed919e": {
    bridge: "nomad",
    sourceChain: formattedSourceChains.eth,
  },
  "0xab58DA63DFDd6B97EAaB3C94165Ef6f43d951fb2": {
    bridge: "nomad",
    sourceChain: formattedSourceChains.eth,
  },
  "0xd86e243fc0007e6226b07c9a50c9d70d78299eb5": {
    bridge: "passport",
    sourceChain: formattedSourceChains.eth,
  },
  "0x24aa189dfaa76c671c279262f94434770f557c35": {
    bridge: "passport",
    sourceChain: formattedSourceChains.bsc,
  },
  "0xaBD347F625194D8e56F8e8b5E8562F34B6Df3469": {
    bridge: "passport",
    sourceChain: formattedSourceChains.bsc,
  },
  "0x5fa41671c48e3c951afc30816947126ccc8c162e": {
    bridge: "passport",
    sourceChain: formattedSourceChains.eth,
  },
  "0x7B37d0787A3424A0810E02b24743a45eBd5530B2": {
    bridge: "passport",
    sourceChain: formattedSourceChains.bsc,
  }, // this is a BUSD multichain address on Theta but a BUSD meter.passport address on Moonbeam
  "0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503": {
    bridge: "bsc",
    sourceChain: formattedSourceChains.eth,
  },
  "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56": {
    bridge: "bsc",
    sourceChain: formattedSourceChains.eth,
  },
  "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3": {
    bridge: "bsc",
    sourceChain: formattedSourceChains.eth,
  },
  "0xb3c11196A4f3b1da7c23d9FB0A3dDE9c6340934F": {
    bridge: "bsc",
    sourceChain: formattedSourceChains.eth,
  },
  "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d": {
    bridge: "bsc",
    sourceChain: formattedSourceChains.eth,
  },
  "0xa71EdC38d189767582C38A3145b5873052c3e47a": {
    bridge: "heco",
    sourceChain: formattedSourceChains.eth,
  },
  "0xbA7dEebBFC5fA1100Fb055a87773e1E99Cd3507a": {
    bridge: "avalanche-old",
    sourceChain: formattedSourceChains.eth,
  },
  "0x97cd1cfe2ed5712660bb6c14053c0ecb031bff7d": {
    bridge: "avalanche",
    sourceChain: formattedSourceChains.eth,
  },
  "0xc7198437980c041c805a1edcba50c1ce5db95118": {
    bridge: "avalanche",
    sourceChain: formattedSourceChains.eth,
  },
  "0x19860ccb0a68fd4213ab9d8266f7bbf05a8dde98": {
    bridge: "avalanche",
    sourceChain: formattedSourceChains.eth,
  },
  "0xd586e7f844cea2f87f50152665bcbc2c279d8d70": {
    bridge: "avalanche",
    sourceChain: formattedSourceChains.eth,
  },
  "0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664": {
    bridge: "avalanche",
    sourceChain: formattedSourceChains.eth,
  },
  "0x382bb369d343125bfb2117af9c149795c6c65c50": {
    bridge: "okexchain",
    sourceChain: formattedSourceChains.eth,
  },
  "0xc946daf81b08146b1c7a8da2a851ddf2b3eaaf85": {
    bridge: "okexchain",
    sourceChain: formattedSourceChains.eth,
  },
  "0x7BDF330f423Ea880FF95fC41A280fD5eCFD3D09f": {
    bridge: "polygon",
    sourceChain: formattedSourceChains.eth,
  },
  "0x00e5646f60ac6fb446f621d146b6e1886f002905": {
    bridge: "polygon",
    sourceChain: formattedSourceChains.eth,
  },
  "0xD07A7FAc2857901E4bEC0D89bBDAe764723AAB86": {
    bridge: "polygon",
    sourceChain: formattedSourceChains.eth,
  },
  "0xc2132d05d31c914a87c6611c10748aeb04b58e8f": {
    bridge: "polygon",
    sourceChain: formattedSourceChains.eth,
  },
  "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063": {
    bridge: "polygon",
    sourceChain: formattedSourceChains.eth,
  },
  "0x23001f892c0C82b79303EDC9B9033cD190BB21c7": {
    bridge: "polygon",
    sourceChain: formattedSourceChains.eth,
  },
  "0x2791bca1f2de4661ed88a30c99a7a9449aa84174": {
    bridge: "polygon",
    sourceChain: formattedSourceChains.eth,
  },
  "0x52484E1ab2e2B22420a25c20FA49E173a26202Cd": {
    bridge: "arbitrum",
    sourceChain: formattedSourceChains.eth,
  },
  "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1": {
    bridge: "arbitrum",
    sourceChain: formattedSourceChains.eth,
  },
  "0x750ba8b76187092B0D1E87E28daaf484d1b5273b": {
    bridge: "arbitrum",
    sourceChain: formattedSourceChains.eth,
  },
  "0xaeF5bbcbFa438519a5ea80B4c7181B4E78d419f2": {
    bridge: "arbitrum",
    sourceChain: formattedSourceChains.eth,
  },
  "0x6Ba6f18a290Cd55cf1B00be2bEc5c954cb29fAc5": {
    bridge: "arbitrum",
    sourceChain: formattedSourceChains.eth,
  },
  "0xa970af1a584579b618be4d69ad6f73459d112f95": {
    bridge: "arbitrum",
    sourceChain: formattedSourceChains.eth,
  },
  "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9": {
    bridge: "arbitrum",
    sourceChain: formattedSourceChains.eth,
  },
  "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8": {
    bridge: "arbitrum",
    sourceChain: formattedSourceChains.eth,
  },
  "0x5454ba0a9e3552f7828616d80a9d2d869726e6f5": {
    bridge: "near",
    sourceChain: formattedSourceChains.near,
  },
  "0000000000085d4780b73119b644ae5ecd22b376.factory.bridge.near": {
    bridge: "near",
    sourceChain: formattedSourceChains.eth,
  },
  "6b175474e89094c44da98b954eedeac495271d0f.factory.bridge.near": {
    bridge: "near",
    sourceChain: formattedSourceChains.eth,
  },
  "4fabb145d64652a948d72533023f6e7a623c7c53.factory.bridge.near": {
    bridge: "near",
    sourceChain: formattedSourceChains.eth,
  },
  "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near": {
    bridge: "near",
    sourceChain: formattedSourceChains.eth,
  },
  "0xB12BFcA5A55806AaF64E99521918A4bf0fC40802": {
    bridge: "near",
    sourceChain: formattedSourceChains.near,
  },
  "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near": {
    bridge: "near",
    sourceChain: formattedSourceChains.eth,
  },
  "0x5183e1B1091804BC2602586919E6880ac1cf2896": {
    bridge: "near",
    sourceChain: formattedSourceChains.near,
  },
  "0x4988a896b1227218e4a686fde5eabdcabd91571f": {
    bridge: "near",
    sourceChain: formattedSourceChains.near,
  },
  "0xe3520349f477a5f6eb06107066048508498a291b": {
    bridge: "near",
    sourceChain: formattedSourceChains.near,
  },
  "0x3c2b8be99c50593081eaa2a724f0b8285f5aba8f": {
    bridge: "harmony",
    sourceChain: formattedSourceChains.eth,
  },
  "0xe176ebe47d621b984a73036b9da5d834411ef734": {
    bridge: "harmony",
    sourceChain: formattedSourceChains.eth,
  },
  "0xef977d2f931c1978db5f6747666fa1eacb0d0339": {
    bridge: "harmony",
    sourceChain: formattedSourceChains.eth,
  },
  "0x985458e523db3d53125813ed68c274899e9dfab4": {
    bridge: "harmony",
    sourceChain: formattedSourceChains.eth,
  },
  "0x4c078361FC9BbB78DF910800A991C7c3DD2F6ce0": {
    bridge: "metis",
    sourceChain: formattedSourceChains.eth,
  },
  "0xbB06DCA3AE6887fAbF931640f67cab3e3a16F4dC": {
    bridge: "metis",
    sourceChain: formattedSourceChains.eth,
  },
  "0xea32a96608495e54156ae48931a7c20f0dcc1a21": {
    bridge: "metis",
    sourceChain: formattedSourceChains.eth,
  },
  "0x0039f574ee5cc39bdd162e9a88e3eb1f111baf48": {
    bridge: "kcc",
    sourceChain: formattedSourceChains.eth,
  },
  "0x980a5afef3d17ad98635f6c5aebcbaeded3c3430": {
    bridge: "kcc",
    sourceChain: formattedSourceChains.eth,
  },
  "0x7fb688ccf682d58f86d7e38e03f9d22e7705448b": {
    bridge: "optimism",
    sourceChain: formattedSourceChains.eth,
  },
  "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58": {
    bridge: "optimism",
    sourceChain: formattedSourceChains.eth,
  },
  "0x8aE125E8653821E851F12A49F7765db9a9ce7384": {
    bridge: "optimism",
    sourceChain: formattedSourceChains.eth,
  },
  "0xc40F949F8a4e094D1b49a23ea9241D289B7b2819": {
    bridge: "optimism",
    sourceChain: formattedSourceChains.eth,
  },
  "0x7f5c764cbc14f9669b88837ca1490cca17c31607": {
    bridge: "optimism",
    sourceChain: formattedSourceChains.eth,
  },
  "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1": {
    bridge: "optimism",
    sourceChain: formattedSourceChains.eth,
  },
  "0x5DE1677344D3Cb0D7D465c10b72A8f60699C062d": {
    bridge: "boba",
    sourceChain: formattedSourceChains.eth,
  },
  "0xf74195Bb8a5cf652411867c5C2C5b8C2a402be35": {
    bridge: "boba",
    sourceChain: formattedSourceChains.eth,
  },
  "0x66a2a913e447d6b4bf33efbec43aaef87890fbbc": {
    bridge: "boba",
    sourceChain: formattedSourceChains.eth,
  },
  "0x6fbcdc1169b5130c59e72e51ed68a84841c98cd1": {
    bridge: "iotex",
    sourceChain: formattedSourceChains.eth,
  },
  "0x84abcb2832be606341a50128aeb1db43aa017449": {
    bridge: "iotex",
    sourceChain: formattedSourceChains.eth,
  },
  "0x551a5dcac57c66aa010940c2dcff5da9c53aa53b": {
    bridge: "kardia",
    sourceChain: formattedSourceChains.eth,
  },
  "0xfadbbf8ce7d5b7041be672561bba99f79c532e10": {
    bridge: "fuse",
    sourceChain: formattedSourceChains.eth,
  },
  "0x6a5f6a8121592becd6747a38d67451b310f7f156": {
    bridge: "fuse",
    sourceChain: formattedSourceChains.bsc,
  },
  "0x620fd5fa44be6af63715ef4e65ddfa0387ad13f5": {
    bridge: "fuse",
    sourceChain: formattedSourceChains.eth,
  },
  "0x381b31409e4d220919b2cff012ed94d70135a59e": {
    bridge: "tomochain",
    sourceChain: formattedSourceChains.eth,
  },
  "0xcca4e6302510d555b654b3eab9c0fcb223bcfdf0": {
    bridge: "tomochain",
    sourceChain: formattedSourceChains.eth,
  },
  "0x6Cb9750a92643382e020eA9a170AbB83Df05F30B": {
    bridge: "evodefi",
    sourceChain: formattedSourceChains.eth,
  },
  "0xE887512ab8BC60BcC9224e1c3b5Be68E26048B8B": {
    bridge: "bittorrent",
    sourceChain: formattedSourceChains.eth,
  },
  "0x9B5F27f6ea9bBD753ce3793a07CbA3C74644330d": {
    bridge: "bittorrent",
    sourceChain: formattedSourceChains.bsc,
  },
  "0xdB28719F7f938507dBfe4f0eAe55668903D34a15": {
    bridge: "bittorrent",
    sourceChain: formattedSourceChains.tron,
  },
  "0x17F235FD5974318E4E2a5e37919a209f7c37A6d1": {
    bridge: "bittorrent",
    sourceChain: formattedSourceChains.tron,
  },
  "0x0C10bF8FcB7Bf5412187A595ab97a3609160b5c6": {
    bridge: "bittorrent",
    sourceChain: formattedSourceChains.bttc,
  },
  "0xd17479997f34dd9156deef8f95a52d81d265be9c": {
    bridge: "bittorrent",
    sourceChain: formattedSourceChains.bttc,
  },
  "0xd7a28Aa9c470e7e9D8c676BCd5dd2f40c5683afa": {
    bridge: "gnosis",
    sourceChain: formattedSourceChains.eth,
  },
  "0xFe7ed09C4956f7cdb54eC4ffCB9818Db2D7025b8": {
    bridge: "gnosis",
    sourceChain: formattedSourceChains.eth,
  },
  "0xD9C31db155a48f3d7304De85EC7AB7B705659bE9": {
    bridge: "gnosis",
    sourceChain: formattedSourceChains.eth,
  },
  "0x7300AaFC0Ef0d47Daeb850f8b6a1931b40aCab33": {
    bridge: "gnosis",
    sourceChain: formattedSourceChains.eth,
  },
  "0x4ECaBa5870353805a9F068101A40E0f32ed605C6": {
    bridge: "gnosis",
    sourceChain: formattedSourceChains.eth,
  },
  "0xFc8B2690F66B46fEC8B3ceeb95fF4Ac35a0054BC": {
    bridge: "gnosis",
    sourceChain: formattedSourceChains.bsc,
  },
  "0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83": {
    bridge: "gnosis",
    sourceChain: formattedSourceChains.eth,
  },
  "0xef213441a85df4d7acbdae0cf78004e1e486bb96": {
    bridge: "rsk",
    sourceChain: formattedSourceChains.eth,
  },
  "0x6b1a73d547f4009a26b8485b63d7015d248ad406": {
    bridge: "rsk",
    sourceChain: formattedSourceChains.eth,
  },
  "0x1bda44fda023f2af8280a16fd1b01d1a493ba6c4": {
    bridge: "rsk",
    sourceChain: formattedSourceChains.eth,
  },
  "0x69f6d4d4813f8e2e618dae7572e04b6d5329e207": {
    bridge: "rsk",
    sourceChain: formattedSourceChains.rsk,
  },
  "0x674bdf20A0F284D710BC40872100128e2d66Bd3f": {
    bridge: "loopring",
    sourceChain: formattedSourceChains.eth,
  },
  "0xabea9132b05a70803a4e85094fd0e1800777fbef": {
    bridge: "zksync",
    sourceChain: formattedSourceChains.eth,
  },
  "0xaBEA9132b05A70803a4E85094fD0e1800777fBEF": {
    bridge: "zksync",
    sourceChain: formattedSourceChains.eth,
  },
  "0x0b7007c13325c48911f73a2dad5fa5dcbf808adc": {
    bridge: "ronin",
    sourceChain: formattedSourceChains.eth,
  },
  "0x9f1d0ed4e041c503bd487e5dc9fc935ab57f9a57": {
    bridge: "elastos",
    sourceChain: formattedSourceChains.bsc,
  },
  "0xF9Ca2eA3b1024c0DB31adB224B407441bECC18BB": {
    bridge: "elastos",
    sourceChain: formattedSourceChains.heco,
  },
  "0xa06be0f5950781ce28d965e5efc6996e88a8c141": {
    bridge: "elastos",
    sourceChain: formattedSourceChains.eth,
  },
  "0xa47c8bf37f92abed4a126bda807a7b7498661acd": {
    bridge: "terra",
    sourceChain: formattedSourceChains.terra,
  },
  "0x23396cF899Ca06c4472205fC903bDB4de249D6fC": {
    bridge: "terra",
    sourceChain: formattedSourceChains.terra,
  },
  "0x224e64ec1bdce3870a6a6c777edd450454068fec": {
    bridge: "terra",
    sourceChain: formattedSourceChains.terra,
  },
  "0x692597b009d13c4049a947cab2239b7d6517875f": {
    bridge: "terra",
    sourceChain: formattedSourceChains.terra,
  },
  "0x737901bea3eeb88459df9ef1BE8fF3Ae1B42A2ba": {
    bridge: "aztec",
    sourceChain: formattedSourceChains.eth,
  },
  "0x49a0400587A7F65072c87c4910449fDcC5c47242": {
    bridge: "abracadabra",
    sourceChain: formattedSourceChains.eth,
  },
  "0x130966628846BFd36ff31a822705796e8cb8C18D": {
    bridge: "abracadabra",
    sourceChain: formattedSourceChains.eth,
  },
  "0xfea7a6a0b346362bf88a9e4a88416b77a57d6c2a": {
    bridge: "abracadabra",
    sourceChain: formattedSourceChains.eth,
  },
  "0x82f0b8b456c1a451378467398982d4834b6829c1": {
    bridge: "abracadabra",
    sourceChain: formattedSourceChains.eth,
  },
  "0xfe19f0b51438fd612f6fd59c1dbb3ea319f433ba": {
    bridge: "abracadabra",
    sourceChain: formattedSourceChains.eth,
  },
  "0x674c6ad92fd080e4004b2312b45f796a192d27a0": {
    bridge: "waves",
    sourceChain: formattedSourceChains.waves,
  },
  "0x013f9c3fac3e2759d7e90aca4f9540f75194a0d7": {
    bridge: "waves",
    sourceChain: formattedSourceChains.waves,
  },
  "0x03ab98f5dc94996F8C33E15cD4468794d12d41f9": {
    bridge: "waves",
    sourceChain: formattedSourceChains.waves,
  },
  "0x14016e85a25aeb13065688cafb43044c2ef86784": {
    bridge: "trueusd",
    sourceChain: formattedSourceChains.eth,
  },
  "0x553a1151f3df3620fc2b5a75a6edda629e3da350": {
    bridge: "trueusd",
    sourceChain: formattedSourceChains.eth,
  },
  "0x2e1ad108ff1d8c782fcbbb89aad783ac49586756": {
    bridge: "trueusd",
    sourceChain: formattedSourceChains.eth,
  },
  "0x4d15a3a2286d883af0aa1b3f21367843fac63e07": {
    bridge: "trueusd",
    sourceChain: formattedSourceChains.eth,
  },
  "0x5eE41aB6edd38cDfB9f6B4e6Cf7F75c87E170d98": {
    bridge: "trueusd",
    sourceChain: formattedSourceChains.eth,
  },
  "0x2f0173dFE97a7Dc670D5A10b35C4263cfEcFa853": {
    bridge: "optics",
    sourceChain: formattedSourceChains.celo,
  },
  "0x977453366b8d205f5c9266b6ba271e850a814a50": {
    bridge: "optics",
    sourceChain: formattedSourceChains.celo,
  },
  "0xd8F3208c045DD69D27938346275165998359D8fF": {
    bridge: "optics",
    sourceChain: formattedSourceChains.celo,
  },
  "0x88eeC49252c8cbc039DCdB394c0c2BA2f1637EA0": {
    bridge: "optics",
    sourceChain: formattedSourceChains.eth,
  },
  "0xef4229c8c3250C675F21BCefa42f58EfbfF6002a": {
    bridge: "optics",
    sourceChain: formattedSourceChains.eth,
  },
  "0x1bfc26cE035c368503fAE319Cc2596716428ca44": {
    bridge: "optics",
    sourceChain: formattedSourceChains.polygon,
  },
  "0x9b9E2De4cB4ca479943F36DfFc72c7253bb1f66a": {
    bridge: "moss",
    sourceChain: formattedSourceChains.celo,
  },
  "0x93DB49bE12B864019dA9Cb147ba75cDC0506190e": {
    bridge: "moss",
    sourceChain: formattedSourceChains.eth,
  },
  "0xcfffe0c89a779c09df3df5624f54cdf7ef5fdd5d": {
    bridge: "moss",
    sourceChain: formattedSourceChains.eth,
  },
  "0x13780e6d5696dd91454f6d3bbc2616687fea43d0": {
    bridge: "synapse",
    sourceChain: formattedSourceChains.terra,
  },
  "0xfb21b70922b9f6e3c6274bcd6cb1aa8a0fe20b80": {
    bridge: "synapse",
    sourceChain: formattedSourceChains.terra,
  },
  "0x0b5740c6b4a97f90ef2f0220651cca420b868ffb": {
    bridge: "synapse",
    sourceChain: formattedSourceChains.terra,
  },
  "0x360d6dd540e3448371876662fbe7f1acaf08c5ab": {
    bridge: "synapse",
    sourceChain: formattedSourceChains.terra,
  },
  "0x07379565cD8B0CaE7c60Dc78e7f601b34AF2A21c": {
    bridge: "synapse",
    sourceChain: formattedSourceChains.eth,
  },
  "0xcfc37a6ab183dd4aed08c204d1c2773c0b1bdf46": {
    bridge: "synapse",
    sourceChain: formattedSourceChains.eth,
  },
  "0x2913e812cf0dcca30fb28e6cac3d2dcff4497688": {
    bridge: "synapse",
    sourceChain: formattedSourceChains.eth,
  },
  "0xed2a7edd7413021d440b09d654f3b87712abab66": {
    bridge: "synapse",
    sourceChain: formattedSourceChains.eth,
  },
  "0xb6c473756050de474286bed418b77aeac39b02af": {
    bridge: "synapse",
    sourceChain: formattedSourceChains.eth,
  },
  "0x6b4712ae9797c199edd44f897ca09bc57628a1cf": {
    bridge: "synapse",
    sourceChain: formattedSourceChains.eth,
  },
  "0x67c10c397dd0ba417329543c1a40eb48aaa7cd00": {
    bridge: "synapse",
    sourceChain: formattedSourceChains.eth,
  },
  "0x396c9c192dd323995346632581bef92a31ac623b": {
    bridge: "synapse",
    sourceChain: formattedSourceChains.eth,
  },
  "0x961318fc85475e125b99cc9215f62679ae5200ab": {
    bridge: "synapse",
    sourceChain: formattedSourceChains.eth,
  },
  "0x52285d426120ab91f378b3df4a15a036a62200ae": {
    bridge: "synapse",
    sourceChain: formattedSourceChains.eth,
  },
  "0x23b891e5c62e0955ae2bd185990103928ab817b3": {
    bridge: "synapse",
    sourceChain: formattedSourceChains.eth,
  },
  "0x3ad9dfe640e1a9cc1d9b0948620820d975c3803a": {
    bridge: "synapse",
    sourceChain: formattedSourceChains.eth,
  },
  "0xfCeAAaEB8D564a9D0e71Ef36f027b9D162bC334e": {
    bridge: "wan",
    sourceChain: formattedSourceChains.eth,
  },
  "0x52A9CEA01c4CBDd669883e41758B8eB8e8E2B34b": {
    bridge: "wan",
    sourceChain: formattedSourceChains.eth,
  },
  "0xcF422327dDaAa409C2976d01131d8a3457F03251": {
    bridge: "wan",
    sourceChain: formattedSourceChains.eth,
  },
  "0xad3E3Fc59dff318BecEaAb7D00EB4F68b1EcF195": {
    bridge: "wrapped",
    sourceChain: formattedSourceChains.celo,
  },
  "0x0437465dfb5b79726e35f08559b0cbea55bb585c": {
    bridge: "starkgate",
    sourceChain: formattedSourceChains.eth,
  },
  bnb1skl4n4vrzx3ty9ujaut8rmkhkmtl4t04ysllfm: {
    bridge: "kava",
    sourceChain: formattedSourceChains.bsc,
  },
  bnb10zq89008gmedc6rrwzdfukjk94swynd7dl97w8: {
    bridge: "kava",
    sourceChain: formattedSourceChains.bsc,
  },
  "0x641441c631e2f909700d2f41fd87f0aa6a6b4edb": {
    bridge: "arbitrum",
    sourceChain: formattedSourceChains.eth,
  },
  "0xbfD291DA8A403DAAF7e5E9DC1ec0aCEaCd4848B9": {
    bridge: "optimism",
    sourceChain: formattedSourceChains.eth,
  },
  "0xde12c7959e1a72bbe8a5f7a1dc8f8eef9ab011b3": {
    bridge: "deus",
    sourceChain: formattedSourceChains.fantom,
  },
  "0xDE12c7959E1a72bbe8a5f7A1dc8f8EeF9Ab011B3": {
    bridge: "deus",
    sourceChain: formattedSourceChains.fantom,
  },
  "0x08745bee17026ed2e0e39a98f81189b9e14ab1b3": {
    bridge: "orbit",
    sourceChain: formattedSourceChains.celo,
  },
  "0x210bc03f49052169d5588a52c317f71cf2078b85": {
    bridge: "orbit",
    sourceChain: formattedSourceChains.bsc,
  },
  "0x5c74070fdea071359b86082bd9f9b3deaafbe32b": {
    bridge: "orbit",
    sourceChain: formattedSourceChains.eth,
  },
  "0x754288077d0ff82af7a5317c7cb8c444d421d103": {
    bridge: "orbit",
    sourceChain: formattedSourceChains.eth,
  },
  "0xcee8faf64bb97a73bb51e115aa89c17ffa8dd167": {
    bridge: "orbit",
    sourceChain: formattedSourceChains.eth,
  },
  "0x5bEF2617eCCA9a39924c09017c5F1E25Efbb3bA8": {
    bridge: "orbit",
    sourceChain: formattedSourceChains.eth,
  },
  ac654837a90eee8fccabd87a2d4fc7637484f01a: {
    bridge: "polynetwork",
    sourceChain: formattedSourceChains.eth,
  },
  "061a07cd393aac289b8ecfda2c3784b637a2fb33": {
    bridge: "polynetwork",
    sourceChain: formattedSourceChains.eth,
  },
  "7b956c0c11fcffb9c9227ca1925ba4c3486b36f1": {
    bridge: "polynetwork",
    sourceChain: formattedSourceChains.eth,
  },
  "17a58a4a65959c2f567e5063c560f9d09fb81284": {
    bridge: "polynetwork",
    sourceChain: formattedSourceChains.eth,
  },
  "0x94fa70d079d76279e1815ce403e9b985bccc82ac": {
    bridge: "cake",
    sourceChain: formattedSourceChains.eth,
  },
  "0x80b5a32E4F032B2a058b4F29EC95EEfEEB87aDcd": {
    bridge: "canto",
    sourceChain: formattedSourceChains.eth,
  },
  "0xd567B3d7B8FE3C79a1AD8dA978812cfC4Fa05e75": {
    bridge: "canto",
    sourceChain: formattedSourceChains.eth,
  },
  "0xF8A0D53DDC6C92c3c59824f380C0f3d2a3cf521C": {
    bridge: "octus",
    sourceChain: formattedSourceChains.eth,
  },
  "0x81598d5362eAC63310e5719315497C5b8980C579": {
    bridge: "octus",
    sourceChain: formattedSourceChains.eth,
  },
  "0xF2403a61C7A97a1a1b94A225173F6dD03614B907": {
    bridge: "octus",
    sourceChain: formattedSourceChains.eth,
  },
  "0x6b9f9cadb11690b2df23c3cfce383a6706f9a5e6": {
    bridge: "octus",
    sourceChain: formattedSourceChains.eth,
  },
  "0x032D06B4cC8A914b85615AcD0131C3e0a7330968": {
    bridge: "octus",
    sourceChain: formattedSourceChains.eth,
  },
  "0x3765f3e827f4AB5393c1cb2D85bAcd37664cE8cA": {
    bridge: "lago",
    sourceChain: formattedSourceChains.eth,
  },
  "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa": {
    bridge: "stargate",
    sourceChain: formattedSourceChains.eth,
  },
} as BridgeMapping;

export const bridgeInfo = {
  issued: {
    name: "Natively Issued",
  },
  multichain: {
    name: "Multichain Bridge",
    link: "https://multichain.org/",
  },
  wormhole: {
    name: "Portal by Wormhole",
    link: "https://wormholenetwork.com/",
  },
  celer: {
    name: "Celer cBridge",
    link: "https://cbridge.celer.network/",
  },
  allbridge: {
    name: "Allbridge",
    link: "https://allbridge.io/",
  },
  axelar: {
    name: "Axelar",
    link: "https://axelar.network/",
  },
  nomad: {
    name: "Nomad",
    link: "https://www.nomad.xyz/",
  },
  passport: {
    name: "Meter Passport",
    link: "https://passport.meter.io/",
  },
  bsc: {
    name: "BSC Bridge",
    link: "https://www.binance.com/",
  },
  heco: {
    name: "HECO Chain Bridge",
    link: "https://www.hecochain.com/",
  },
  avalanche: {
    name: "Avalanche Bridge",
    link: "https://bridge.avax.network/",
  },
  "avalanche-old": {
    name: "Avalanche Bridge (Old)",
  },
  okexchain: {
    name: "OKX Bridge",
    link: "https://www.okx.com/okx-bridge",
  },
  polygon: {
    name: "Polygon PoS Bridge",
    link: "https://polygon.technology/",
  },
  arbitrum: {
    name: "Arbitrum L1 Custom Gateway",
    link: "https://arbitrum.io/",
  },
  near: {
    name: "NEAR Rainbow Bridge",
    link: "https://rainbowbridge.app/",
  },
  harmony: {
    name: "Horizon Bridge by Harmony",
    link: "https://bridge.harmony.one/",
  },
  metis: {
    name: "Metis Andromeda Bridge",
    link: "https://www.metis.io/",
  },
  kcc: {
    name: "Kucoin Bridge",
    link: "https://www.Kucoin.io/",
  },
  optimism: {
    name: "Optimism Bridge",
    link: "https://app.optimism.io/bridge",
  },
  boba: {
    name: "Boba Gateway",
    link: "https://gateway.boba.network/",
  },
  iotex: {
    name: "ioTube V5",
    link: "https://iotube.org/",
  },
  kardia: {
    name: "KAI Bridge",
    link: "https://bridge.kaidex.io/",
  },
  fuse: {
    name: "Fuse Bridge",
    link: "https://voltage.finance/",
  },
  tomochain: {
    name: "TomoBridge",
    link: "https://bridge.TomoChain.com/",
  },
  evodefi: {
    name: "EVODeFi",
    link: "https://bridge.evodefi.com/",
  },
  bittorrent: {
    name: "Bittorrent Bridge",
    link: "https://bttc.bittorrent.com/",
  },
  gnosis: {
    name: "Gnosis Chain OmniBridge",
    link: "https://omni.gnosischain.com/",
  },
  rsk: {
    name: "RSK Token Bridge",
    link: "https://tokenbridge.rsk.co/",
  },
  loopring: {
    name: "Loopring",
    link: "https://loopring.org/",
  },
  zksync: {
    name: "zkSync",
    link: "https://zksync.io/",
  },
  ronin: {
    name: "Ronin Bridge",
    link: "https://bridge.roninchain.com/",
  },
  elastos: {
    name: "ShadowTokens",
    link: "https://tokbridge.net/",
  },
  terra: {
    name: "Terra Shuttle Bridge",
    link: "https://bridge.terra.money/",
  },
  aztec: {
    name: "Aztec",
    link: "https://zk.money/",
  },
  abracadabra: {
    name: "Abracadabra Bridge",
    link: "https://abracadabra.money/",
  },
  waves: {
    name: "Waves Exchange",
    link: "https://waves.exchange/",
  },
  synapse: {
    name: "Synapse Bridge",
    link: "https://synapseprotocol.com/",
  },
  trueusd: {
    name: "TrueUSD",
    link: "https://trueusd.com/trueusd",
  },
  optics: {
    name: "Optics Bridge",
    link: "https://optics.app/",
  },
  moss: {
    name: "Moss",
    link: "https://bridge.moss.earth/",
  },
  wan: {
    name: "WanBridge",
    link: "https://bridge.wanchain.org/",
  },
  wrapped: {
    name: "Wrapped",
    link: "https://www.wrapped.com/",
  },
  starkgate: {
    name: "StarkGate",
    link: "https://starkgate.starknet.io/",
  },
  kava: {
    name: "Kava",
    link: "https://app.kava.io/",
  },
  deus: {
    name: "DEUS Bridge",
    link: "https://deus.finance/",
  },
  orbit: {
    name: "Orbit Bridge",
    link: "https://orbitchain.io/",
  },
  polynetwork: {
    name: "PolyNetwork",
    link: "https://poly.network/",
  },
  cake: {
    name: "Cake DeFi",
    link: "https://cakedefi.com/",
  },
  adastra: {
    name: "Ad Astra Portal",
    link: "https://ad-astra.elrond.com/",
  },
  canto: {
    name: "Canto",
    link: "https://bridge.canto.io/",
  },
  octus: {
    name: "Octus Bridge",
    link: "https://octusbridge.io/",
  },
  lago: {
    name: "Lago Finance",
    link: "https://www.lago.finance/",
  },
  stargate: {
    name: "Stargate",
    link: "https://stargate.finance/",
  },
} as BridgeInfo;
