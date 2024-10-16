const sdk = require("@defillama/sdk");;
import { sumSingleBalance } from "../helper/generalUtil";
import { ChainBlocks, PeggedIssuanceAdapter } from "../peggedAsset.type";

const BEAN_ERC20 = "0xbea0005b8599265d41256905a9b3073d397812e4";

async function arbitrumMinted(_timestamp: number, arbBlock: number, _chainBlocks: ChainBlocks) {

  const balances = {};

  const totalSupply = (
    await sdk.api.abi.call({
      abi: "erc20:totalSupply",
      target: BEAN_ERC20,
      block: arbBlock,
      chain: "arbitrum",
    })
  ).output;

  sumSingleBalance(balances, "peggedUSD", totalSupply / 10 ** 6, 'issued', false);

  return balances;
};

const adapter: PeggedIssuanceAdapter = {
  arbitrum: {
    minted: arbitrumMinted,
    unreleased: async () => ({})
  }
};

export default adapter;
