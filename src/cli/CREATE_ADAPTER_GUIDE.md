# Quick Start: Creating a New Adapter

## 🚀 Two Ways to Create Adapters

### **Option 1: Non-Interactive Mode** (One Command)
```bash
npm run create-adapter -- \
  --name "My Stablecoin" \
  --id "my-stablecoin" \
  --chains "ethereum,bsc" \
  --addresses "0x...,0x..." \
  --types "m,b"
```
Perfect for automation and when you know all the details!

### **Option 2: Interactive Mode**
```bash
npm run create-adapter
```
The CLI will ask you questions step-by-step.

## ⚡ Non-Interactive Mode Guide

Use flags for quick one-line adapter creation!

### **Basic Example**

```bash
npm run create-adapter -- \
  --name "PUSD" \
  --id "pusd" \
  --chains "ethereum,binance,tron" \
  --addresses "0xFAF0cEe6B20e2Aaa4B80748a6AF4CD89609a3d78,0xFAF0cEe6B20e2Aaa4B80748a6AF4CD89609a3d78,TF39FD5YwW63mtB1zr9gpVdyFUx1icac2y" \
  --types "m,m,m" \
  --pegType "peggedUSD" \
  --decimals 18
```

### **Required Flags**

| Flag | Description | Example |
|------|-------------|---------|
| `--name` | Stablecoin name | `"My Stablecoin"` |
| `--id` | CoinGecko ID | `"my-stablecoin"` |
| `--chains` | Comma-separated chain names | `"ethereum,bsc,polygon"` |
| `--addresses` | Comma-separated contract addresses | `"0x...,0x...,0x..."` |
| `--types` | `m`=minted, `b`=bridged | `"m,b,b"` |

### **Optional Flags**

| Flag | Description | Default |
|------|-------------|---------|
| `--pegType` | Peg type (USD, EUR, etc.) | `peggedUSD` |
| `--decimals` | Token decimals | `18` |
| `--reserves` | Reserve wallet addresses | (none) |
| `--bridgedFrom` | Source chains for bridged tokens | `ethereum` |

### **Example 1**

All tokens bridged from Ethereum:

```bash
npm run create-adapter -- \
  --name "Simple Stable" \
  --id "simple-stable" \
  --chains "ethereum,arbitrum,optimism,base" \
  --addresses "0x111...,0x222...,0x333...,0x444..." \
  --types "m,b,b,b"
```

**Result:**
- Ethereum: minted
- Arbitrum: bridged from ethereum (default)
- Optimism: bridged from ethereum (default)
- Base: bridged from ethereum (default)

### **Example 2**

Specify custom bridge sources:

```bash
npm run create-adapter -- \
  --name "Cross Chain Token" \
  --id "cross-chain-token" \
  --chains "ethereum,bsc,polygon,arbitrum" \
  --addresses "0x111...,0x222...,0x333...,0x444..." \
  --types "m,b,m,b" \
  --bridgedFrom "ethereum,polygon"
```

**Result:**
- Ethereum: minted
- BSC: bridged from ethereum (1st bridged)
- Polygon: minted
- Arbitrum: bridged from polygon (2nd bridged)

### **Example 3**

```bash
npm run create-adapter -- \
  --name "Euro Coin" \
  --id "euro-coin" \
  --chains "ethereum,polygon" \
  --addresses "0xAAA...,0xBBB..." \
  --types "m,b" \
  --pegType "peggedEUR" \
  --decimals 6
```

### **Example 4: With Reserve Wallets**

```bash
npm run create-adapter -- \
  --name "Reserved USD" \
  --id "reserved-usd" \
  --chains "ethereum" \
  --addresses "0x111..." \
  --types "m" \
  --reserves "0xRESERVE1...,0xRESERVE2..."
```

### **Get Help**

```bash
npm run create-adapter -- --help
```

Shows all available flags and examples!

### **Supported Chains** 

The CLI supports **all chains from `chains.json`**

```
ethereum, bsc, polygon, arbitrum, optimism, base, avax, fantom, 
gnosis, celo, moonbeam, moonriver, kava, metis, aurora, boba, 
cronos, oasis, solana, tron, algorand, terra, near, cardano, 
ton, aptos, sui, osmosis, cosmos, injective, sei, stellar, 
ripple, eos, flow, tezos, zilliqa, hedera, icp, vechain, waves
```

**Tip:** Type `list` in interactive mode or use `--help` to see all supported chains!

### **Supported Peg Types**

| Type | Description | Type | Description |
|------|-------------|------|-------------|
| `peggedUSD` | US Dollar | `peggedEUR` | Euro |
| `peggedGBP` | British Pound | `peggedCAD` | Canadian Dollar |
| `peggedJPY` | Japanese Yen | `peggedCNY` | Chinese Yuan |
| `peggedSGD` | Singapore Dollar | `peggedAUD` | Australian Dollar |
| `peggedCHF` | Swiss Franc | `peggedRUB` | Russian Ruble |
| `peggedMXN` | Mexican Peso | `peggedPHP` | Philippine Peso |
| `peggedARS` | Argentine Peso | `peggedCOP` | Colombian Peso |
| `peggedTRY` | Turkish Lira | `peggedUAH` | Ukrainian Hryvnia |
| `peggedREAL` | Brazilian Real | `peggedVAR` | Variable/Multi-peg |

## 📋 Interactive Mode Tutorial

### Example: Adding "MyStable USD"

Let's walk through the guided experience:

```bash
$ npm run create-adapter

🚀 DefiLlama Pegged Asset Adapter Generator

📝 What is the stablecoin name? MyStable USD

🔗 CoinGecko ID (lowercase, hyphenated): (mystable-usd) 
[Press Enter to accept]

💵 Select peg type:
  1. peggedUSD (US Dollar)
  2. peggedEUR (Euro)
  3. peggedGBP (British Pound)
  ...
  10. peggedRUB (Russian Ruble)
  ...
Enter number: (1) 1

🔢 Token decimals: (18) 18

⛓️  Enter chain names (comma-separated):
   Available: abstract, acala, agoric, algorand, ...and 210+ more
   Popular: ethereum, bsc, polygon, arbitrum, optimism, base, avax, fantom
   Type chain names directly (e.g., "ethereum,bsc,polygon")
   Or type "list" to see all available chains

Enter chain names: (ethereum) ethereum,bsc,polygon

📍 Configuring ethereum...
  Is it minted or bridged on ethereum? (m/b): (m) m
  Contract address on ethereum: 0x1234567890123456789012345678901234567890

📍 Configuring bsc...
  Is it minted or bridged on bsc? (m/b): (b) b
  Contract address on bsc: 0x2345678901234567890123456789012345678901
  Bridged from which chain? (ethereum) [Press Enter]

📍 Configuring polygon...
  Is it minted or bridged on polygon? (m/b): (b) b
  Contract address on polygon: 0x3456789012345678901234567890123456789012
  Bridged from which chain? (ethereum) [Press Enter]

🏦 Does it have reserve/unreleased tokens? (y/n): (n) n

============================================================
📋 Configuration Summary
============================================================
Name:     MyStable USD
ID:       mystable-usd
Peg Type: peggedUSD
Decimals: 18
Chains:   ethereum, bsc, polygon
Reserves: No
============================================================

Proceed with creation? (y/n): (y) y

⚙️  Generating adapter files...

✅ Created index.ts
✅ Created README.md

============================================================
✅ Adapter successfully created!
============================================================

Location: /path/to/src/adapters/peggedAssets/mystable-usd

📋 Next Steps:

1. Review the generated files in:
   /path/to/src/adapters/peggedAssets/mystable-usd

2. Test your adapter:
   cd src/adapters/peggedAssets
   npx ts-node --transpile-only test.ts mystable-usd USD

3. If needed, customize the adapter logic in:
   /path/to/src/adapters/peggedAssets/mystable-usd/index.ts

4. Gather required information for PR:
   - High-resolution logo
   - Website link
   - Twitter link
   - Audit links (if any)
   - Short description
   - Mint/redeem mechanism description

5. Submit a Pull Request with:
   - This adapter code
   - Fill out pull_request_template.md
   - Post metadata in DefiLlama Discord
```

## 🎯 What Gets Generated

### File: `index.ts`

```typescript
import { addChainExports } from "../helper/getSupply";

const chainContracts = {
  ethereum: {
    issued: [
      "0x1234567890123456789012345678901234567890"
    ]
  },
  bsc: {
    bridgedFromETH: [
      "0x2345678901234567890123456789012345678901"
    ]
  },
  polygon: {
    bridgedFromETH: [
      "0x3456789012345678901234567890123456789012"
    ]
  }
};

const adapter = addChainExports(chainContracts, undefined, {
  pegType: "peggedUSD",
  decimals: 18,
});

export default adapter;
```

### File: `README.md`

Complete documentation with:
- Contract addresses
- Testing instructions
- Submission checklist

## 🧪 Testing

```bash
# Navigate to adapters directory
cd src/adapters/peggedAssets

# Test your adapter
npx ts-node --transpile-only test.ts mystable-usd USD

```
