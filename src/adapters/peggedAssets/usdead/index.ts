import { addChainExports } from "../helper/getSupply";

const chainContracts = {
  ethereum: { issued: ["0x9Bc2C28DF6560C343d3fa9c152Bed80D4511DEAd"] },
  base: { issued: ["0x9Bc2C28DF6560C343d3fa9c152Bed80D4511DEAd"] },
  optimism: { issued: ["0x9Bc2C28DF6560C343d3fa9c152Bed80D4511DEAd"] },
  arbitrum: { issued: ["0x9Bc2C28DF6560C343d3fa9c152Bed80D4511DEAd"] },
  bsc: { issued: ["0x9Bc2C28DF6560C343d3fa9c152Bed80D4511DEAd"] },
  scroll: { issued: ["0x9Bc2C28DF6560C343d3fa9c152Bed80D4511DEAd"] },
  megaeth: { issued: ["0x23A873d375a21Bb6649aa68FD664acBbDDBbdead"] },
  monad: { issued: ["0x41201e7083569de72dc057d960429cddb305dead"] },
  hyperliquid: { issued: ["0x7f71d0888defA07833E19f195D5c4A78e170F289"] },
  solana: { issued: ["CeALVyCeC6RdrRTAz21PVmMD6miUMdqGn8MevHGSC5sg"] },
  tron: { issued: ["TCReUYWrZCqxbBgJ2Ns7UKBA79gWeMVciJ"] },
};

const adapter = addChainExports(chainContracts, undefined, { decimals: 18 });
export default adapter;
