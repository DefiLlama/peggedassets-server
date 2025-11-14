#!/usr/bin/env node

/**
 * DefiLlama Pegged Asset Adapter Generator
 * 
 * Interactive CLI tool to scaffold new pegged asset adapters
 * 
 * Usage:
 *   npm run create-adapter
 *   npm run create-adapter -- --name "My Stablecoin" --id "my-stablecoin"
 */

import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

interface AdapterConfig {
  name: string;
  geckoId: string;
  pegType: string;
  decimals: number;
  chains: ChainConfig[];
  hasReserves: boolean;
  reserveAddresses: string[];
}

interface ChainConfig {
  chain: string;
  type: "minted" | "bridged";
  address: string;
  bridgedFrom?: string;
}

// Utility functions
function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message: string) {
  log(`❌ ${message}`, "red");
}

function success(message: string) {
  log(`✅ ${message}`, "green");
}

function info(message: string) {
  log(`ℹ️  ${message}`, "cyan");
}

function warning(message: string) {
  log(`⚠️  ${message}`, "yellow");
}

// Readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(`${colors.cyan}${prompt}${colors.reset} `, resolve);
  });
}

function questionWithDefault(prompt: string, defaultValue: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(
      `${colors.cyan}${prompt}${colors.reset} ${colors.yellow}(${defaultValue})${colors.reset} `,
      (answer) => {
        resolve(answer.trim() || defaultValue);
      }
    );
  });
}

function isValidGeckoId(id: string): boolean {
  return /^[a-z0-9-]+$/.test(id);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Main prompts
async function promptBasicInfo(): Promise<Partial<AdapterConfig>> {
  log("\n🚀 DefiLlama Pegged Asset Adapter Generator\n", "bright");
  
  const name = await question("📝 What is the stablecoin name?");
  if (!name.trim()) {
    error("Name cannot be empty");
    process.exit(1);
  }

  const suggestedId = slugify(name);
  const geckoId = await questionWithDefault(
    "🔗 CoinGecko ID (lowercase, hyphenated):",
    suggestedId
  );

  if (!isValidGeckoId(geckoId)) {
    error("Invalid CoinGecko ID. Use only lowercase letters, numbers, and hyphens.");
    process.exit(1);
  }

  // Check if adapter already exists
  const adapterPath = path.join(
    __dirname,
    "../adapters/peggedAssets",
    geckoId
  );
  if (fs.existsSync(adapterPath)) {
    error(`Adapter for "${geckoId}" already exists at ${adapterPath}`);
    process.exit(1);
  }

  return { name, geckoId };
}

async function promptPegType(): Promise<string> {
  log("\n💵 Select peg type:", "bright");
  log("  1. peggedUSD (US Dollar)");
  log("  2. peggedEUR (Euro)");
  log("  3. peggedGBP (British Pound)");
  log("  4. peggedJPY (Japanese Yen)");
  log("  5. peggedCHF (Swiss Franc)");
  log("  6. peggedCAD (Canadian Dollar)");
  log("  7. peggedAUD (Australian Dollar)");
  log("  8. peggedSGD (Singapore Dollar)");
  log("  9. peggedCNY (Chinese Yuan)");
  log("  10. peggedRUB (Russian Ruble)");
  log("  11. peggedREAL (Brazilian Real)");
  log("  12. peggedPHP (Philippine Peso)");
  log("  13. peggedMXN (Mexican Peso)");
  log("  14. peggedUAH (Ukrainian Hryvnia)");
  log("  15. peggedARS (Argentine Peso)");
  log("  16. peggedTRY (Turkish Lira)");
  log("  17. peggedCOP (Colombian Peso)");
  log("  18. peggedGOLD (Gold)");
  log("  19. peggedVAR (Variable)");

  const choice = await questionWithDefault("Enter number:", "1");
  
  const pegTypes: { [key: string]: string } = {
    "1": "peggedUSD",
    "2": "peggedEUR",
    "3": "peggedGBP",
    "4": "peggedJPY",
    "5": "peggedCHF",
    "6": "peggedCAD",
    "7": "peggedAUD",
    "8": "peggedSGD",
    "9": "peggedCNY",
    "10": "peggedRUB",
    "11": "peggedREAL",
    "12": "peggedPHP",
    "13": "peggedMXN",
    "14": "peggedUAH",
    "15": "peggedARS",
    "16": "peggedTRY",
    "17": "peggedCOP",
    "18": "peggedGOLD",
    "19": "peggedVAR",
  };

  return pegTypes[choice] || "peggedUSD";
}

async function promptDecimals(): Promise<number> {
  const decimalsStr = await questionWithDefault("🔢 Token decimals:", "18");
  const decimals = parseInt(decimalsStr);
  
  if (isNaN(decimals) || decimals < 0 || decimals > 30) {
    error("Invalid decimals. Using default: 18");
    return 18;
  }
  
  return decimals;
}

async function promptChains(): Promise<ChainConfig[]> {
  const availableChains = [
    "abstract", "acala", "agoric", "algorand", "apechain", "aptos", "arbitrum", "arbitrum_nova",
    "archway", "astar", "aurora", "avax", "aztec", "base", "berachain", "bevm", "bfc", "binance",
    "bitcoin", "bittorent", "bittorrent", "blast", "bob", "boba", "borrowed", "bsc", "bsquared",
    "btr", "callisto", "canto", "cardano", "celo", "clover", "comdex", "concordium", "conflux",
    "core", "corn", "cosmos", "crab", "cronos", "csc", "curio", "defichain", "dfk", "dogechain",
    "occ", "elastos", "elrond", "emoney", "energyweb", "eos", "era", "ergo", "ethpow", "ethereum",
    "ethereumclassic", "everscale", "evmos", "fantom", "filecoin", "findora", "flare", "flow",
    "fraxtal", "fusion", "fuse", "galxe", "glue", "goat", "gochain", "godwoken", "harmony",
    "havah", "heco", "hedera", "hemi", "hoo", "hpb", "hsk", "hydra", "hyperliquid", "icp",
    "icon", "ink", "imx", "injective", "iotex", "kadena", "kardia", "karura", "katana", "kava",
    "kcc", "klaytn", "kujira", "kroma", "kusama", "kusuma", "liquid", "liquidchain", "linea",
    "lisk", "loopring", "mantle", "manta", "mantra", "metis", "meter", "mezo", "milkomeda",
    "mixin", "mode", "morph", "moonbeam", "moonriver", "move", "nahmii", "near", "neo", "nero",
    "nibiru", "noble", "oasis", "okexchain", "omni", "ontology", "optimism", "osmosis", "palm",
    "penumbra", "perennial", "plasma", "plume_mainnet", "polis", "polkadot", "polygon",
    "polygon_zkevm", "pool2", "proton", "provenance", "pulse", "q", "real", "rei", "reinetwork",
    "ripple", "ronin", "rsk", "saga", "scroll", "secret", "sei", "shape", "shiden", "slp",
    "smartBCH", "smartbch", "solana", "soneium", "sonic", "songbird", "sophon", "stacks",
    "staking", "starknet", "statemine", "stellar", "story", "sui", "superposition", "swellchain",
    "sx", "syscoin", "taiko", "telos", "terra", "tezos", "theta", "thorchain", "thundercore",
    "ThunderCore", "tomochain", "ton", "tron", "ubiq", "ultra", "unichain", "vechain", "velas",
    "vitruveo", "vite", "vive", "wan", "waves", "wax", "wemix", "wc", "xai", "xlayer", "xdc",
    "xdai", "zilliqa", "zkfair", "zksync", "zyx", "zircuit", "hydradx"
  ];

  log("\n⛓️  Enter chain names (comma-separated):", "bright");
  log(`   Available: ${availableChains.slice(0, 20).join(", ")}, ...and ${availableChains.length - 20} more`);
  log(`   Popular: ethereum, bsc, polygon, arbitrum, optimism, base, avax, fantom`);
  log(`   Type chain names directly (e.g., "ethereum,bsc,polygon")`);
  log(`   Or type "list" to see all available chains\n`);

  const selection = await questionWithDefault("Enter chain names:", "ethereum");
  
  // Handle "list" command
  if (selection.toLowerCase() === "list") {
    log("\n📋 All Available Chains:", "bright");
    const columns = 4;
    for (let i = 0; i < availableChains.length; i += columns) {
      const row = availableChains.slice(i, i + columns);
      log(`   ${row.join(", ")}`);
    }
    log("");
    return promptChains(); // Ask again after showing list
  }

  const chainNames = selection.split(",").map((s) => s.trim().toLowerCase());
  const chains: ChainConfig[] = [];

  for (const chainName of chainNames) {
    if (!chainName) continue;
    
    // Validate chain exists
    if (!availableChains.includes(chainName)) {
      warning(`  Chain "${chainName}" not found in available chains. Skipping.`);
      continue;
    }

    log(`\n📍 Configuring ${chainName}...`, "blue");

    const typeChoice = await questionWithDefault(
      `  Is it minted or bridged on ${chainName}? (m/b):`,
      chainName === "ethereum" ? "m" : "b"
    );
    const type = typeChoice.toLowerCase().startsWith("m") ? "minted" : "bridged";

    const address = await question(`  Contract address on ${chainName}:`);

    const chainConfig: ChainConfig = { chain: chainName, type, address };

    if (type === "bridged" && chainName !== "ethereum") {
      const bridgedFrom = await questionWithDefault(
        `  Bridged from which chain?`,
        "ethereum"
      );
      chainConfig.bridgedFrom = bridgedFrom;
    }

    chains.push(chainConfig);
  }

  return chains;
}

async function promptReserves(): Promise<{ hasReserves: boolean; addresses: string[] }> {
  const hasReservesStr = await questionWithDefault(
    "\n🏦 Does it have reserve/unreleased tokens? (y/n):",
    "n"
  );
  const hasReserves = hasReservesStr.toLowerCase().startsWith("y");

  const addresses: string[] = [];
  if (hasReserves) {
    log("  Enter reserve wallet addresses (one per line, empty line to finish):");
    
    while (true) {
      const address = await question("  Address:");
      if (!address.trim()) break;
        addresses.push(address);
    }
  }

  return { hasReserves, addresses };
}

// Code generation functions
function generateChainContracts(config: AdapterConfig): any {
  const chainContracts: any = {};
  let unreleasedAdded = false;

  for (const chain of config.chains) {
    if (chain.type === "minted") {
      chainContracts[chain.chain] = {
        issued: [chain.address],
      };
      
      if (config.hasReserves && !unreleasedAdded && config.reserveAddresses.length > 0) {
        chainContracts[chain.chain].unreleased = config.reserveAddresses;
        unreleasedAdded = true;
      }
    } else {
      const bridgeFrom = chain.bridgedFrom || "ethereum";
      const bridgeKey = `bridgedFrom${bridgeFrom === "ethereum" ? "ETH" : bridgeFrom.charAt(0).toUpperCase() + bridgeFrom.slice(1)}`;
      
      chainContracts[chain.chain] = {
        [bridgeKey]: [chain.address],
      };
    }
  }

  return chainContracts;
}

// Format object as JavaScript code
function formatAsJavaScript(obj: any, indent: number = 2): string {
  const spaces = " ".repeat(indent);
  
  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]";
    const items = obj.map(item => {
      if (typeof item === "string") return `"${item}"`;
      return formatAsJavaScript(item, indent);
    });
    return `[\n${spaces}  ${items.join(`,\n${spaces}  `)}\n${spaces}]`;
  }
  
  if (typeof obj === "object" && obj !== null) {
    const entries = Object.entries(obj);
    if (entries.length === 0) return "{}";
    
    const lines = entries.map(([key, value]) => {
      const formattedValue = 
        typeof value === "string" ? `"${value}"` :
        Array.isArray(value) ? formatAsJavaScript(value, indent + 2) :
        typeof value === "object" ? formatAsJavaScript(value, indent + 2) :
        value;
      
      return `${spaces}${key}: ${formattedValue}`;
    });
    
    return `{\n${lines.join(",\n")}\n${spaces.slice(2)}}`;
  }
  
  return String(obj);
}

function generateIndexFile(config: AdapterConfig): string {
  const chainContracts = generateChainContracts(config);
  const hasComplexLogic = config.chains.some(c => ["solana", "sui", "aptos", "ton"].includes(c.chain));

  let imports = `import { addChainExports } from "../helper/getSupply";`;

  if (hasComplexLogic) {
    imports += `\nimport { Balances } from "../peggedAsset.type";`;
    
    if (config.chains.some(c => c.chain === "solana")) {
      imports += `\nimport { solanaMintedOrBridged } from "../helper/getSupply";`;
    }
    if (config.chains.some(c => c.chain === "sui")) {
      imports += `\nimport * as sui from "../helper/sui";`;
    }
    if (config.chains.some(c => c.chain === "aptos")) {
      imports += `\nimport { getTotalSupply as aptosGetTotalSupply } from "../helper/aptos";`;
    }
  }

  const content = `${imports}

const chainContracts = ${formatAsJavaScript(chainContracts)};

const adapter = addChainExports(chainContracts, undefined, {
  pegType: "${config.pegType}",
  decimals: ${config.decimals},
});

export default adapter;
`;

  return content;
}

function generateReadme(config: AdapterConfig): string {
  return `# ${config.name}

**CoinGecko ID:** ${config.geckoId}
**Peg Type:** ${config.pegType}
**Decimals:** ${config.decimals}

## Contract Addresses

${config.chains
  .map((c) => {
    const bridgeInfo = c.bridgedFrom ? ` (bridged from ${c.bridgedFrom})` : "";
    return `### ${c.chain.charAt(0).toUpperCase() + c.chain.slice(1)}
- **Type:** ${c.type}${bridgeInfo}
- **Address:** \`${c.address}\``;
  })
  .join("\n\n")}

${
  config.hasReserves && config.reserveAddresses.length > 0
    ? `\n## Reserve Addresses

${config.reserveAddresses.map((addr) => `- \`${addr}\``).join("\n")}`
    : ""
}

## Testing

\`\`\`bash
# Test the adapter
cd src/adapters/peggedAssets
npx ts-node --transpile-only test.ts ${config.geckoId} ${config.pegType.replace("pegged", "")}
\`\`\`

## Submission

After testing, submit a PR with:
1. This adapter code
2. Logo (high resolution, rounded borders)
3. Metadata in DefiLlama Discord

See \`pull_request_template.md\` in the root directory for required information.
`;
}

function generateConfigFile(config: AdapterConfig): string | null {
  // Only generate config file for complex adapters with many chains
  if (config.chains.length < 5) return null;

  const chainContracts = generateChainContracts(config);
  
  return `export const chainContracts = ${formatAsJavaScript(chainContracts)};
`;
}

// File writing functions
async function createAdapterFiles(config: AdapterConfig) {
  const adapterDir = path.join(
    __dirname,
    "../adapters/peggedAssets",
    config.geckoId
  );

  try {
    // Create directory
    if (!fs.existsSync(adapterDir)) {
      fs.mkdirSync(adapterDir, { recursive: true });
    }

    // Write index.ts
    const indexContent = generateIndexFile(config);
    fs.writeFileSync(path.join(adapterDir, "index.ts"), indexContent);
    success(`Created index.ts`);

    // Write README.md
    const readmeContent = generateReadme(config);
    fs.writeFileSync(path.join(adapterDir, "README.md"), readmeContent);
    success(`Created README.md`);

    // Write config.ts (optional, for complex adapters)
    const configContent = generateConfigFile(config);
    if (configContent) {
      fs.writeFileSync(path.join(adapterDir, "config.ts"), configContent);
      success(`Created config.ts`);
    }

    return adapterDir;
  } catch (err) {
    error(`Failed to create adapter files: ${err}`);
    throw err;
  }
}

function printNextSteps(config: AdapterConfig, adapterDir: string) {
  log("\n" + "=".repeat(60), "green");
  success("Adapter successfully created!");
  log("=".repeat(60) + "\n", "green");

  info(`Location: ${adapterDir}\n`);

  log("📋 Next Steps:\n", "bright");
  log(`1. Review the generated files in:`);
  log(`   ${adapterDir}\n`);

  log(`2. Test your adapter:`);
  log(`   ${colors.yellow}cd src/adapters/peggedAssets${colors.reset}`);
  log(`   ${colors.yellow}npx ts-node --transpile-only test.ts ${config.geckoId} ${config.pegType.replace("pegged", "")}${colors.reset}\n`);

  log(`3. If needed, customize the adapter logic in:`);
  log(`   ${adapterDir}/index.ts\n`);

  log(`4. Gather required information for PR:`);
  log(`   - High-resolution logo`);
  log(`   - Website link`);
  log(`   - Twitter link`);
  log(`   - Audit links (if any)`);
  log(`   - Short description`);
  log(`   - Mint/redeem mechanism description\n`);

  log(`5. Submit a Pull Request with:`);
  log(`   - This adapter code`);
  log(`   - Fill out pull_request_template.md`);
  log(`   - Post metadata in DefiLlama Discord\n`);

  info(`💡 Tip: Check similar adapters for reference patterns:`);
  log(`   - USDC: src/adapters/peggedAssets/usd-coin/`);
  log(`   - DAI: src/adapters/peggedAssets/dai/`);
  log(`   - USDT: src/adapters/peggedAssets/tether/\n`);
}

// Parse command-line flags
function parseFlags(args: string[]): Partial<AdapterConfig> | null {
  const flags: any = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];
    
    if (arg.startsWith("--") && nextArg && !nextArg.startsWith("--")) {
      const key = arg.slice(2);
      flags[key] = nextArg;
      i++; // Skip next arg since we used it
    }
  }
  
  // If no flags provided, return null to use interactive mode
  if (Object.keys(flags).length === 0) return null;
  
  // Validate required flags
  const required = ["name", "id", "chains", "addresses", "types"];
  const missing = required.filter(key => !flags[key]);
  if (missing.length > 0) {
    error(`Missing required flags: ${missing.map(m => `--${m}`).join(", ")}`);
    log("\nRequired flags:");
    log("  --name        Stablecoin name");
    log("  --id          CoinGecko ID");
    log("  --chains      Comma-separated chain names");
    log("  --addresses   Comma-separated contract addresses (same order as chains)");
    log("  --types       Comma-separated types: m=minted, b=bridged (same order as chains)");
    log("\nOptional flags:");
    log("  --pegType     Peg type (default: peggedUSD)");
    log("  --decimals    Token decimals (default: 18)");
    log("  --reserves    Comma-separated reserve addresses");
    log("  --bridgedFrom Comma-separated source chains for bridged tokens");
    process.exit(1);
  }
  
  // Parse chains
  const chainNames = flags.chains.split(",").map((s: string) => s.trim());
  const addresses = flags.addresses.split(",").map((s: string) => s.trim());
  const types = flags.types.split(",").map((s: string) => s.trim());
  const bridgedFromList = flags.bridgedFrom ? flags.bridgedFrom.split(",").map((s: string) => s.trim()) : [];
  
  if (chainNames.length !== addresses.length || chainNames.length !== types.length) {
    error("Mismatch: chains, addresses, and types must have the same number of items");
    process.exit(1);
  }
  
  const chains: ChainConfig[] = [];
  let bridgedIndex = 0; // Track bridged chains separately
  
  for (let i = 0; i < chainNames.length; i++) {
    const chain = chainNames[i];
    const type = types[i] === "m" ? "minted" : "bridged";
    const address = addresses[i];
    
    let bridgedFrom: string | undefined;
    if (type === "bridged") {
      // Use bridgedFromList for bridged chains only
      bridgedFrom = bridgedFromList[bridgedIndex] || "ethereum";
      bridgedIndex++;
    }
    
    chains.push({ chain, type, address, bridgedFrom });
  }
  
  const reserveAddresses = flags.reserves ? flags.reserves.split(",").map((s: string) => s.trim()) : [];
  
  return {
    name: flags.name,
    geckoId: flags.id,
    pegType: flags.pegType || "peggedUSD",
    decimals: parseInt(flags.decimals || "18"),
    chains,
    hasReserves: reserveAddresses.length > 0,
    reserveAddresses,
  };
}

// Main CLI function
async function main() {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    
    if (args.includes("--help") || args.includes("-h")) {
      log("\nDefiLlama Pegged Asset Adapter Generator\n", "bright");
      log("Usage:");
      log("  npm run create-adapter                    # Interactive mode");
      log("  npm run create-adapter -- --help          # Show this help");
      log("  npm run create-adapter -- [flags]         # Non-interactive mode\n");
      log("Non-Interactive Mode Flags:");
      log("  --name <name>           Stablecoin name (required)");
      log("  --id <id>               CoinGecko ID (required)");
      log("  --chains <chains>       Comma-separated chain names (required)");
      log("  --addresses <addrs>     Comma-separated contract addresses (required)");
      log("  --types <types>         Comma-separated: m=minted, b=bridged (required)");
      log("  --pegType <type>        Peg type (optional, default: peggedUSD)");
      log("  --decimals <num>        Token decimals (optional, default: 18)");
      log("  --reserves <addrs>      Comma-separated reserve addresses (optional)");
      log("  --bridgedFrom <chains>  Source chains for bridged tokens (optional)\n");
      log("Example:");
      log('  npm run create-adapter -- \\');
      log('    --name "My Stablecoin" \\');
      log('    --id "my-stablecoin" \\');
      log('    --chains "ethereum,bsc,tron" \\');
      log('    --addresses "0x...,0x...,T..." \\');
      log('    --types "m,m,m" \\');
      log('    --pegType "peggedUSD" \\');
      log('    --decimals 18\n');
      process.exit(0);
    }

    // Try non-interactive mode
    const flagConfig = parseFlags(args);
    
    let config: AdapterConfig;
    
    if (flagConfig && flagConfig.name && flagConfig.geckoId) {
      // Non-interactive mode
      log("\n🚀 Creating adapter in non-interactive mode...\n", "bright");
      config = flagConfig as AdapterConfig;
    } else {
      // Interactive mode
      const basicInfo = await promptBasicInfo();
      const pegType = await promptPegType();
      const decimals = await promptDecimals();
      const chains = await promptChains();
      const { hasReserves, addresses: reserveAddresses } = await promptReserves();
      
      config = {
        name: basicInfo.name!,
        geckoId: basicInfo.geckoId!,
        pegType,
        decimals,
        chains,
        hasReserves,
        reserveAddresses,
      };
    }

    // Summary
    log("\n" + "=".repeat(60), "cyan");
    log("📋 Configuration Summary", "bright");
    log("=".repeat(60), "cyan");
    log(`Name:     ${config.name}`);
    log(`ID:       ${config.geckoId}`);
    log(`Peg Type: ${config.pegType}`);
    log(`Decimals: ${config.decimals}`);
    log(`Chains:   ${config.chains.map(c => c.chain).join(", ")}`);
    log(`Reserves: ${config.hasReserves ? "Yes" : "No"}`);
    log("=".repeat(60) + "\n", "cyan");

    const confirm = await questionWithDefault("Proceed with creation? (y/n):", "y");
    if (!confirm.toLowerCase().startsWith("y")) {
      warning("Cancelled by user");
      process.exit(0);
    }

    log("\n⚙️  Generating adapter files...\n");
    const adapterDir = await createAdapterFiles(config);

    printNextSteps(config, adapterDir);

  } catch (err) {
    error(`An error occurred: ${err}`);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the CLI
if (require.main === module) {
  main().catch((err) => {
    error(`Fatal error: ${err}`);
    process.exit(1);
  });
}

export { main, AdapterConfig, ChainConfig };

