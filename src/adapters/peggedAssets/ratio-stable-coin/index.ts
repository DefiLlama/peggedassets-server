const sdk = require("@defillama/sdk");
import {
  PeggedIssuanceAdapter,
} from "../peggedAsset.type";
import { endpoint } from "../llama-helper/solana";
const { Connection, PublicKey } = require('@solana/web3.js')
const { Program, Provider, web3, utils } = require("@project-serum/anchor");
const { NodeWallet } = require("@project-serum/anchor/dist/cjs/provider");
const BigNumber = require("bignumber.js");
const IDL = require("./ratio-state.json");

const programId = new PublicKey("RFLeGTwFXiXXETdJkZuu9iKgXNkYbywLpTu1TioDsDQ");

const getProvider = async () => {
  /* create the provider and return it to the caller */
  /* network set to local network for now */
  const dummy_keypair = web3.Keypair.generate();
  const wallet = new NodeWallet(dummy_keypair);
  const network = `${endpoint}/`;
  const connection = new Connection(network, 'processed');
  const confirmOptions = {
    commitment: "processed",
    preflightCommitment: "processed",
  };

  const provider = new Provider(
    connection, wallet, confirmOptions
  );
  return provider;
}

const encodeSeedString = (seedString: string) => Buffer.from(utils.bytes.utf8.encode(seedString));

const constructProgram = async (provider: any) => {
  return new Program(IDL, programId, provider);
};

const findPDA = async (seeds: [Buffer]) => {
  return (await PublicKey.findProgramAddress(seeds, programId))[0];
};

const findGlobalStatePDA = async (globalStateSeed: string) => {
  const seed = encodeSeedString(globalStateSeed);
  return findPDA([seed]);
};

async function totalDebt() {
  return async function() {
    const provider = await getProvider();
    const program = await constructProgram(provider);
    const globalStateKey = await findGlobalStatePDA("GLOBAL_STATE_SEED");
  
    const globalStateAccInfo = await program.account.globalState.fetch(globalStateKey);
    const mintedUsd = new BigNumber(globalStateAccInfo.totalDebt.toString()).div(1e6).toString(10);
    return { peggedUSD: parseFloat(mintedUsd) }
  }
}

const adapter: PeggedIssuanceAdapter = {
  solana: {
    minted: totalDebt(),
    unreleased: async () => ({}),
  },
};

export default adapter;
