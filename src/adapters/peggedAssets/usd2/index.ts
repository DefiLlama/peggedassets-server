const Pact = require("pact-lang-api");
const creationTime = () => Math.round(new Date().getTime() / 1000) - 10;
import { sumSingleBalance } from "../helper/generalUtil";
import { PeggedIssuanceAdapter, Balances } from "../peggedAsset.type";

let net = `https://api.chainweb.com/chainweb/0.0/mainnet01/chain/1/pact`;

async function supplyMinted() {
  return async function () {
    let balances = {} as Balances;

    let usd2supply: any;
    let totalSupply: any;

    let data = await Pact.fetch.local(
      {
        pactCode: `(lago.USD2-wrapper.return-supply "lago.USD2") `,
        meta: Pact.lang.mkMeta("", "1", 0.01, 100000000, 28800, creationTime()),
      },
      net
    );
    if (data.result.status === "success") {
      usd2supply = parseFloat(data.result.data);
    }

    totalSupply = usd2supply;

    sumSingleBalance(balances, "peggedUSD", totalSupply, "issued", false);
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  kadena: {
    minted: supplyMinted(),
    unreleased: async () => ({}),
  },
};

export default adapter;
