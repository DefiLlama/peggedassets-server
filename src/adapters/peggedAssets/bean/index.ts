const sdk = require("@defillama/sdk");;
import { sumSingleBalance } from "../helper/generalUtil";
import { ChainBlocks, PeggedIssuanceAdapter } from "../peggedAsset.type";

const BEAN_ERC20_V1 = "0xdc59ac4fefa32293a95889dc396682858d52e5db";
const BEAN_ERC20_V2 = "0xbea0000029ad1c77d3d5d23ba2d8893db9d1efab";

// After the flashloan governance exploit,
// Beanstalk was offline for 3.5 months before launching with a new token.
const START_BLOCK = 12974077;
const EXPLOIT_BLOCK = 14602790;
const REPLANT_BLOCK = 15278082;

async function ethereumMinted(_timestamp: number, ethBlock: number, _chainBlocks: ChainBlocks) {

  const balances = {};

  if (ethBlock < START_BLOCK || (ethBlock > EXPLOIT_BLOCK && ethBlock < REPLANT_BLOCK)) {
    // There was no canonical bean token during this period
    sumSingleBalance(balances, "peggedUSD", 0, 'issued', false);
  } else {

    const beanToken = ethBlock <= EXPLOIT_BLOCK ? BEAN_ERC20_V1 : BEAN_ERC20_V2;
    const totalSupply = (
      await sdk.api.abi.call({
        abi: "erc20:totalSupply",
        target: beanToken,
        block: ethBlock,
        chain: "ethereum",
      })
    ).output;

    sumSingleBalance(balances, "peggedUSD", totalSupply / 10 ** 6, 'issued', false);
  }
  return balances;
};

const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: ethereumMinted,
    unreleased: async () => ({})
  }
};

export default adapter;
