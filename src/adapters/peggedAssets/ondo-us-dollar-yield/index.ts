import { addChainExports, solanaMintedOrBridged } from "../helper/getSupply";
import { getTotalSupply } from "../helper/sui";
import { Balances, ChainBlocks } from "../peggedAsset.type";
import { getTotalSupply as aptosGetTotalSupply } from "../helper/aptos";
const evmContracts = {
  ethereum: {
    issued: [
      "0x96F6eF951840721AdBF46Ac996b59E0235CB985C",
      "0xe86845788d6e3E5C2393ADe1a051AE617D974C09",
    ],
  },
  mantle: {
    issued: "0x5bE26527e817998A7206475496fDE1E68957c5A6",
    unreleased: ["0x94FEC56BBEcEaCC71c9e61623ACE9F8e1B1cf473"],
  },
};

const evmAdapter = addChainExports(evmContracts);

async function suiMinted() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ): Promise<Balances> {
    const suiTotalSupply = await getTotalSupply(
      "0x960b531667636f39e85867775f52f6b1f220a058c4de786905bdf761e06a56bb::usdy::USDY"
    );

    return { peggedUSD: suiTotalSupply / 10 ** 6 };
  };
}

async function aptosMinted() {
  return async function () {
    const contractStargate =
      "0xcfea864b32833f157f042618bd845145256b1bf4c0da34a7013b76e42daa53cc";
    const typeStargate =
      "0x1::coin::CoinInfo<0xcfea864b32833f157f042618bd845145256b1bf4c0da34a7013b76e42daa53cc::usdy::USDY>";
    const totalSupplyStargate = await aptosGetTotalSupply(
      contractStargate,
      typeStargate
    );
    console.log("totalSupplyStargate", totalSupplyStargate);
    return { peggedUSD: totalSupplyStargate };
  };
}

const adapter = {
  ...evmAdapter,
  sui: {
<<<<<<< Updated upstream
    issued: [
      "0x960b531667636f39e85867775f52f6b1f220a058c4de786905bdf761e06a56bb::usdy::USDY",
    ],
=======
    issued: suiMinted(),
>>>>>>> Stashed changes
  },
  solana: {
    issued: solanaMintedOrBridged([
      "A1KLoBrKBde8Ty9qtNQUtq3C2ortoC3u7twggz7sEto6",
    ]),
  },
  aptos: {
    issued: aptosMinted(),
  },
};

export default adapter;
