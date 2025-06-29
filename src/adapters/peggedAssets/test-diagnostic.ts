process.env.SKIP_RPC_CHECK = 'true'

require("dotenv").config();
const path = require("path");
import { PeggedAssetIssuance, PeggedTokenBalance } from "../../types";
import { PeggedIssuanceAdapter } from "./peggedAsset.type";
const {
  humanizeNumber,
} = require("@defillama/sdk/build/computeTVL/humanizeNumber");
import * as sdk from "@defillama/sdk";
const chainList = require("./helper/chains.json");
const errorString = "------ ERROR ------";

type ChainBlocks = {
  [chain: string]: number;
};

type BridgeMapping = {
  [chain: string]: PeggedTokenBalance[];
};

type ChainDiagnostic = {
  chain: string;
  issuanceType: string;
  status: 'success' | 'timeout' | 'error' | 'no_bridge_data';
  duration: number;
  error?: string;
  result?: any;
};

const pegTypes = ["peggedUSD", "peggedEUR", "peggedVAR"];

async function testChainWithDiagnostic(
  _unixTimestamp: number,
  ethBlock: number,
  chainBlocks: ChainBlocks,
  chain: string,
  issuanceType: string,
  issuanceFunction: any,
  pegType: string
): Promise<ChainDiagnostic> {
  const startTime = Date.now();
  const maxRetries = 3;
  let lastError: string = '';
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 45e3); // 45 second timeout
      });

      const chainApi = new sdk.ChainApi({ chain });
      const resultPromise = issuanceFunction(chainApi, ethBlock, chainBlocks);
      
      const balance = await Promise.race([resultPromise, timeoutPromise]) as PeggedTokenBalance;
      const duration = Date.now() - startTime;

      if (!balance || Object.keys(balance).length === 0) {
        return {
          chain,
          issuanceType,
          status: 'success',
          duration,
          result: { [pegType]: 0 }
        };
      }

      if (typeof balance[pegType] !== "number" || Number.isNaN(balance[pegType])) {
        return {
          chain,
          issuanceType,
          status: 'error',
          duration,
          error: `Invalid balance type: ${typeof balance[pegType]}, value: ${balance[pegType]}`
        };
      }

      if (!balance.bridges) {
        return {
          chain,
          issuanceType,
          status: 'no_bridge_data',
          duration,
          result: balance
        };
      }

      return {
        chain,
        issuanceType,
        status: 'success',
        duration,
        result: balance
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      lastError = errorMessage;
      
      // Check if it's a retryable RPC error
      const isRetryableError = errorMessage.includes('invalid BytesLike value') || 
                              errorMessage.includes('call reverted') ||
                              errorMessage.includes('null') ||
                              errorMessage.includes('INVALID_ARGUMENT');
      
      if (isRetryableError && attempt < maxRetries) {
        console.log(`  🔄 ${issuanceType.padEnd(15)} Attempt ${attempt}/${maxRetries} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
        continue;
      }
      
      const duration = Date.now() - startTime;
      
      if (errorMessage === 'Timeout') {
        return {
          chain,
          issuanceType,
          status: 'timeout',
          duration,
          error: 'Function exceeded 45 second timeout'
        };
      }

      return {
        chain,
        issuanceType,
        status: 'error',
        duration,
        error: errorMessage
      };
    }
  }
  
  // This should never be reached, but just in case
  const duration = Date.now() - startTime;
  return {
    chain,
    issuanceType,
    status: 'error',
    duration,
    error: lastError
  };
}

if (process.argv.length < 3) {
  console.error(`Missing argument, you need to provide the filename of the adapter to test.
      Eg: npx ts-node test-diagnostic.ts usd-coin/index.ts [pegType]
      Eg: npx ts-node test-diagnostic.ts usd-coin/index.ts peggedUSD
      Eg: npx ts-node test-diagnostic.ts euro-coin/index.ts peggedEUR`);
  process.exit(1);
}

const passedFile = path.resolve(process.cwd(), process.argv[2]);
const pegType = process.argv[3] || "peggedUSD"; // Default to peggedUSD if not specified
const dummyFn = () => ({});

(async () => {
  let adapter = {} as PeggedIssuanceAdapter;
  try {
    adapter = require(passedFile);
  } catch (e) {
    console.log(e);
  }
  const module = adapter.default;
  const chains = Object.keys(module).filter(
    (chain) => !["minted", "unreleased"].includes(chain)
  );

  console.log(`🔍 Running diagnostic test on ${chains.length} chains...`);
  console.log(`📊 Testing all issuance types for each chain`);
  console.log(`💰 Peg type: ${pegType}\n`);

  const unixTimestamp = Math.round(Date.now() / 1000) - 60;
  const chainBlocks = {} as ChainBlocks;
  const ethBlock = chainBlocks.ethereum;
  
  const diagnostics: ChainDiagnostic[] = [];
  const results: { [chain: string]: any } = {};

  // Test each chain
  for (const chain of chains) {
    const issuances = module[chain];
    if (typeof issuances !== "object" || issuances === null) {
      continue;
    }

    const issuanceTypes = Object.keys(issuances || {});
    
    if (!(issuances as any).minted)
      (issuances as any).minted = dummyFn;
    if (!(issuances as any).unreleased)
      (issuances as any).unreleased = dummyFn;

    console.log(`\n🔗 Testing ${chain}...`);
    
    for (const [issuanceType, issuanceFunctionPromise] of Object.entries(issuances)) {
      try {
        const issuanceFunction = await issuanceFunctionPromise;
        if (typeof issuanceFunction !== "function") {
          continue;
        }

        const diagnostic = await testChainWithDiagnostic(
          unixTimestamp,
          ethBlock,
          chainBlocks,
          chain,
          issuanceType,
          issuanceFunction,
          pegType
        );

        diagnostics.push(diagnostic);

        // Display status with emoji
        const statusEmoji = {
          'success': '✅',
          'timeout': '⏰',
          'error': '❌',
          'no_bridge_data': '⚠️'
        }[diagnostic.status];

        console.log(`  ${statusEmoji} ${issuanceType.padEnd(15)} ${diagnostic.duration}ms`);

        if (diagnostic.status === 'success' && diagnostic.result) {
          results[chain] = results[chain] || {};
          results[chain][issuanceType] = diagnostic.result;
        }

      } catch (e) {
        console.log(`  ❌ ${issuanceType.padEnd(15)} Failed to execute`);
        diagnostics.push({
          chain,
          issuanceType,
          status: 'error',
          duration: 0,
          error: e instanceof Error ? e.message : String(e)
        });
      }
    }
  }

  // Generate summary report
  console.log(`\n📋 DIAGNOSTIC SUMMARY`);
  console.log(`====================`);

  const summary = {
    total: diagnostics.length,
    success: diagnostics.filter(d => d.status === 'success').length,
    timeout: diagnostics.filter(d => d.status === 'timeout').length,
    error: diagnostics.filter(d => d.status === 'error').length,
    no_bridge_data: diagnostics.filter(d => d.status === 'no_bridge_data').length
  };

  console.log(`Total tests: ${summary.total}`);
  console.log(`✅ Success: ${summary.success}`);
  console.log(`⏰ Timeout: ${summary.timeout}`);
  console.log(`❌ Error: ${summary.error}`);
  console.log(`⚠️  No bridge data: ${summary.no_bridge_data}`);

  // Show problematic chains
  const problematicChains = diagnostics.filter(d => d.status === 'timeout' || d.status === 'error');
  if (problematicChains.length > 0) {
    console.log(`\n🚨 PROBLEMATIC CHAINS:`);
    console.log(`====================`);
    
    const chainGroups = problematicChains.reduce((acc, d) => {
      if (!acc[d.chain]) acc[d.chain] = [];
      acc[d.chain].push(d);
      return acc;
    }, {} as { [chain: string]: ChainDiagnostic[] });

    Object.entries(chainGroups).forEach(([chain, issues]) => {
      console.log(`\n${chain}:`);
      issues.forEach(issue => {
        const emoji = issue.status === 'timeout' ? '⏰' : '❌';
        console.log(`  ${emoji} ${issue.issuanceType}: ${issue.error || 'Unknown error'}`);
      });
    });
  }

  // Show slow chains (over 10 seconds)
  const slowChains = diagnostics.filter(d => d.duration > 10000);
  if (slowChains.length > 0) {
    console.log(`\n🐌 SLOW CHAINS (>10s):`);
    console.log(`====================`);
    
    const slowChainGroups = slowChains.reduce((acc, d) => {
      if (!acc[d.chain]) acc[d.chain] = [];
      acc[d.chain].push(d);
      return acc;
    }, {} as { [chain: string]: ChainDiagnostic[] });

    Object.entries(slowChainGroups).forEach(([chain, issues]) => {
      console.log(`\n${chain}:`);
      issues.forEach(issue => {
        console.log(`  ⏱️  ${issue.issuanceType}: ${issue.duration}ms`);
      });
    });
  }

  process.exit(0);
})();

function handleError(error: string) {
  console.log("\n", errorString, "\n\n");
  console.error(error);
  process.exit(1);
}

process.on("unhandledRejection", handleError);
process.on("uncaughtException", handleError); 