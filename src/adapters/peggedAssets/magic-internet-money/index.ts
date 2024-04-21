const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import {
  Balances,
  ChainBlocks,
  PeggedIssuanceAdapter,
} from "../peggedAsset.type";
import { BENTOBOX_ABI } from "./abis/bentobox";
import { CAULDRON_V1_ABI } from "./abis/cauldron-v1";

type Address = `0x${string}`;
type ChainContract = {
  address: Address;
  cauldrons?: Address[];
  reserves?: Address[];
  bentoboxes?: Address[];
};
type ChainContracts = {
  [chain: string]: ChainContract;
};

const ethereumChainContract: ChainContract = {
  address: "0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3",
  cauldrons: [
    "0x7ce7d9ed62b9a6c5ace1c6ec9aeb115fa3064757",
    "0x7b7473a76d6ae86ce19f7352a1e89f6c9dc39020",
    "0xf179fe36a36b32a4644587b8cdee7a23af98ed37",
    "0x05500e2ee779329698df35760bedcaac046e7c27",
    "0x003d5a75d284824af736df51933be522de9eed0f",
    "0x98a84eff6e008c5ed0289655ccdca899bcb6b99f",
    "0xce450a23378859fb5157f4c4cccaf48faa30865b",
    "0x0bca8ebcb26502b013493bf8fe53aa2b1ed401c1",
    "0xed510639e1b07c9145cd570f8dd0ca885f760e09",
    "0x46f54d434063e5f1a2b2cc6d9aaa657b1b9ff82c",
    "0x252dcf1b621cc53bc22c256255d2be5c8c32eae4",
    "0x35a0dd182e4bca59d5931eae13d0a2332fa30321",
    "0xc1879bf24917ebe531fbaa20b0d05da027b592ce",
    "0x9617b633ef905860d919b88e1d9d9a6191795341",
    "0xcfc571f3203756319c231d3bc643cee807e74636",
    "0xc6d3b82f9774db8f92095b5e4352a8bb8b0dc20d",
    "0x289424add4a1a503870eb475fd8bf1d586b134ed",
    "0x390db10e65b5ab920c19149c919d970ad9d18a41",
    "0x5ec47ee69bede0b6c2a2fc0d9d094df16c192498",
    "0xd31e19a0574dbf09310c3b06f3416661b4dc7324",
    "0xc6b2b3fe7c3d7a6f823d9106e22e66660709001e",
    "0x53375add9d2dfe19398ed65baaeffe622760a9a6",
    "0x8227965a7f42956549afaec319f4e444aa438df5",
    "0x207763511da879a900973a5e092382117c3c1588",
    "0x85f60d3ea4e86af43c9d4e9cc9095281fc25c405",
    "0x7259e152103756e1616a77ae982353c3751a6a90",
    "0x692887e8877c6dd31593cda44c382db5b289b684",
    "0x7d8df3e4d06b0e19960c19ee673c0823beb90815",
    "0x1062eb452f8c7a94276437ec1f4aaca9b1495b72",
    "0x59e9082e068ddb27fc5ef1690f9a9f22b32e573f",
    "0x6bcd99d6009ac1666b58cb68fb4a50385945cda2",
    "0x40d95c4b34127cf43438a963e7c066156c5b87a3",
    "0x6ff9061bb8f97d948942cef376d98b51fa38b91f",
    "0xbb02a884621fb8f5bfd263a67f58b65df5b090f3",
    "0xc319eea1e792577c319723b5e60a15da3857e7da",
    "0xffbf4892822e0d552cff317f65e1ee7b5d3d9ae6",
    "0x289424add4a1a503870eb475fd8bf1d586b134ed",
    "0x6371efe5cd6e3d2d7c477935b7669401143b7985",
    "0xbc36fde44a7fd8f545d459452ef9539d7a14dd63",
  ],
  reserves: [
    "0x30b9de623c209a42ba8d5ca76384ead740be9529", // CauldronOwner
  ],
  bentoboxes: [
    "0xf5bce5077908a1b7370b9ae04adc565ebd643966", // BentoBox
    "0xd96f48665a1410c0cd669a88898eca36b9fc2cce", // DegenBox
  ],
};

const bridgedChainContracts: ChainContracts = {
  optimism: {
    address: "0xb153fb3d196a8eb25522705560ac152eeec57901",
    cauldrons: ["0x68f498c230015254aff0e1eb6f85da558dff2362"],
    bentoboxes: [
      "0xa93c81f564579381116ee3e007c9fcfd2eba1723", // DegenBox
    ],
  },
  blast: {
    address: "0x76da31d7c9cbeae102aff34d3398bc450c8374c1",
    cauldrons: ["0x79e8cad80e2aa49a246b789584c45aab1cfe402e"],
    bentoboxes: ["0xc8f5eb8a632f9600d1c7bc91e97dad5f8b1e3748"],
  },
  bsc: {
    address: "0xfe19f0b51438fd612f6fd59c1dbb3ea319f433ba",
    cauldrons: [
      "0xf8049467f3a9d50176f4816b20cddd9bb8a93319",
      "0x692cf15f80415d83e8c0e139cabcda67fcc12c90",
    ],
    bentoboxes: [
      "0x090185f2135308bad17527004364ebcc2d37e5f6", // DegenBox
    ],
  },
  polygon: {
    address: "0x49a0400587a7f65072c87c4910449fdcc5c47242",
  },
  fantom: {
    address: "0x82f0b8b456c1a451378467398982d4834b6829c1",
    cauldrons: [
      "0x7208d9f9398d7b02c5c22c334c2a7a3a98c0a45d",
      "0x4fdffa59bf8dda3f4d5b38f260eab8bfac6d7bc1",
      "0x8e45af6743422e488afacdad842ce75a09eaed34",
      "0xd4357d43545f793101b592bacab89943dc89d11b",
      "0xed745b045f9495b8bfc7b58eea8e0d0597884e12",
      "0xa3fc1b4b7f06c2391f7ad7d4795c1cd28a59917e",
    ],
    bentoboxes: [
      "0xf5bce5077908a1b7370b9ae04adc565ebd643966", // BentoBox
      "0x74a0bca2eeedf8883cb91e37e9ff49430f20a616", // DegenBox
    ],
  },
  moonriver: {
    address: "0x0cae51e1032e8461f4806e26332c030e34de3adb",
    reserves: [
      "0x8e534c5d52c921dbd6debc56503cf0e2dce6d534", // CauldronOwner
    ],
  },
  arbitrum: {
    address: "0xfea7a6a0b346362bf88a9e4a88416b77a57d6c2a",
    cauldrons: [
      "0xc89958b03a55b5de2221acb25b58b89a000215e6",
      "0x5698135ca439f21a57bddbe8b582c62f090406d5",
      "0x726413d7402ff180609d0ebc79506df8633701b1",
      "0x7962acfcfc2ccebc810045391d60040f635404fb",
      "0x2b02bbeab8ecab792d3f4dda7a76f63aa21934fa",
      "0xd7659d913430945600dfe875434b6d80646d552a",
      "0x4f9737e994da9811b8830775fd73e2f1c8e40741",
      "0x66805f6e719d7e67d46e8b2501c1237980996c6a",
      "0x49De724D7125641F56312EBBcbf48Ef107c8FA57",
      "0x780db9770dDc236fd659A39430A8a7cC07D0C320",
    ],
    reserves: [
      "0x27807dd7adf218e1f4d885d54ed51c70efb9de50", // ODM
    ],
    bentoboxes: [
      "0x74c764d41b77dbbb4fe771dab1939b00b146894a", // BentoBox
      "0x7c8fef8ea9b1fe46a7689bfb8149341c90431d38", // DegenBox
    ],
  },
  avax: {
    address: "0x130966628846bfd36ff31a822705796e8cb8c18d",
    cauldrons: [
      "0x3cfed0439ab822530b1ffbd19536d897ef30d2a2",
      "0x56984f04d2d04b2f63403f0ebedd3487716ba49d",
      "0x3b63f81ad1fc724e44330b4cf5b5b6e355ad964b",
      "0x95cce62c3ecd9a33090bbf8a9eac50b699b54210",
      "0x35fa7a723b3b39f15623ff1eb26d8701e7d6bb21",
      "0x0a1e6a80e93e62bd0d3d3bfcf4c362c40fb1cf3d",
      "0x2450bf8e625e98e14884355205af6f97e3e68d07",
      "0xacc6821d0f368b02d223158f8ada4824da9f28e3",
      "0x3cf232f346934b949b99797d225bb72734731990", // Limone AVAX/USDC
    ],
    bentoboxes: [
      "0xf4f46382c2be1603dc817551ff9a7b333ed1d18f", // BentoBox
      "0x1fc83f75499b7620d53757f0b01e2ae626aae530", // DegenBox
      "0xd825d06061fdc0585e4373f0a3f01a8c02b0e6a4", // Limone
    ],
  },
  kava: {
    address: "0x471ee749ba270eb4c1165b5ad95e614947f6fceb",
    cauldrons: [
      "0x3cff6f628ebc88e167640966e67314cf6466e6a8",
      "0x895731a0c3836a5534561268f15eba377218651d",
    ],
    bentoboxes: [
      "0x630fc1758de85c566bdec1d75a894794e1819d7e", // DegenBox
    ],
    reserves: [
      "0x844fed6dd9eb143e6302e937c795c3f0ec47a7c7", // CauldronOwner
    ],
  },
  base: {
    address: "0x4a3a6dd60a34bb2aba60d73b4c88315e9ceb6a3d",
  },
  linea: {
    address: "0xdd3b8084af79b9bae3d1b668c0de08ccc2c9429a",
  },
};

async function chainReleased(
  chain: string,
  address: Address,
  decimals: number,
  bridged: boolean
) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    const balances: Balances = {};

    const totalSupply = (
      await sdk.api.abi.call({
        abi: "erc20:totalSupply",
        target: address,
        block: _chainBlocks?.[chain],
        chain: chain,
      })
    ).output;

    sumSingleBalance(
      balances,
      "peggedUSD",
      totalSupply / 10 ** decimals,
      bridged ? address : "issued",
      bridged,
      bridged ? undefined : "issued"
    );

    return balances;
  };
}

async function chainUnreleased(
  chain: string,
  { address, cauldrons, reserves, bentoboxes }: ChainContract,
  decimals: number,
  bridged: boolean
) {
  const balancesFunction = async (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) => {
    const ownerPromise = ownerOf(address, chain, _chainBlocks);
    const [
      ownerBalance,
      ownerBentoboxBalances,
      cauldronBalances,
      reserveBalances,
    ] = await Promise.all([
      ownerPromise.then(
        async (owner) =>
          (
            await sdk.api.erc20.balanceOf({
              target: address,
              owner,
              block: _chainBlocks?.[chain],
              chain: chain,
            })
          ).output
      ),
      ownerPromise.then((owner) =>
        Promise.all(
          (bentoboxes ?? []).map((bentobox) =>
            bentoboxBalanceAmountOf(
              bentobox,
              address,
              owner,
              true,
              chain,
              _chainBlocks
            )
          )
        )
      ),
      Promise.all(
        (cauldrons ?? []).map((cauldron) =>
          balanceOfCauldron(chain, cauldron, address, _chainBlocks)
        )
      ),
      Promise.all(
        (reserves ?? []).map(
          async (reserve) =>
            (
              await sdk.api.erc20.balanceOf({
                target: address,
                owner: reserve,
                block: _chainBlocks?.[chain],
                chain: chain,
              })
            ).output
        )
      ),
    ]);

    let balances: Balances = {};

    [
      ownerBalance,
      ...ownerBentoboxBalances,
      ...cauldronBalances,
      ...reserveBalances,
    ].forEach((balance) => {
      sumSingleBalance(
        balances,
        "peggedUSD",
        balance / 10 ** decimals,
        bridged ? address : "issued",
        bridged,
        bridged ? undefined : "issued"
      );
    });

    return balances;
  };

  return balancesFunction;
}

async function ownerOf(
  target: Address,
  chain: string,
  chainBlocks?: ChainBlocks
): Promise<Address> {
  const owner = (
    await sdk.api.abi.call({
      abi: {
        inputs: [],
        name: "owner",
        outputs: [
          {
            internalType: "address",
            name: "",
            type: "address",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      target: target,
      block: chainBlocks?.[chain],
      chain: chain,
    })
  ).output;

  return owner;
}

async function bentoboxBalanceAmountOf(
  bentoboxAddress: Address,
  token: Address,
  accountAddress: Address,
  roundUp: boolean,
  chain: string,
  chainBlocks?: ChainBlocks
): Promise<number> {
  const shares = (
    await sdk.api.abi.call({
      abi: BENTOBOX_ABI.find(
        (abi) => abi.type === "function" && abi.name === "balanceOf"
      ),
      target: bentoboxAddress,
      params: [token, accountAddress],
      block: chainBlocks?.[chain],
      chain: chain,
    })
  ).output;

  const amount = (
    await sdk.api.abi.call({
      abi: BENTOBOX_ABI.find(
        (abi) => abi.type === "function" && abi.name === "toAmount"
      ),
      target: bentoboxAddress,
      params: [token, shares, roundUp],
      block: chainBlocks?.[chain],
      chain: chain,
    })
  ).output;

  return amount;
}

async function balanceOfCauldron(
  chain: string,
  cauldronAddress: Address,
  token: Address,
  chainBlocks?: ChainBlocks
): Promise<number> {
  const bentoboxAddress = (
    await sdk.api.abi.call({
      abi: CAULDRON_V1_ABI.find(
        (abi) => abi.type === "function" && abi.name === "bentoBox"
      ),
      target: cauldronAddress,
      block: chainBlocks?.[chain],
      chain: chain,
    })
  ).output;

  return bentoboxBalanceAmountOf(
    bentoboxAddress,
    token,
    cauldronAddress,
    true,
    chain
  );
}

const bridgedAdapter: PeggedIssuanceAdapter = Object.fromEntries(
  Object.entries(bridgedChainContracts).map(([chain, chainContract]) => [
    chain,
    {
      minted: async () => ({}),
      ethereum: chainReleased(chain, chainContract.address, 18, true),
      unreleased: chainUnreleased(chain, chainContract, 18, true),
    },
  ])
);

const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: chainReleased("ethereum", ethereumChainContract.address, 18, false),
    unreleased: chainUnreleased("ethereum", ethereumChainContract, 18, false),
  },
  ...bridgedAdapter,
};

export default adapter;
