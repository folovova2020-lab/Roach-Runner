# 🚀 Mumbai Testnet Deployment Guide

This guide walks you through deploying the Roach Runners smart contract to Polygon Mumbai testnet and configuring the frontend to interact with it.

---

## Prerequisites

Before deploying, ensure you have:

1. **Mumbai Test MATIC**
   - Minimum: 0.5 MATIC (for deployment + testing)
   - Recommended: 1-2 MATIC
   
2. **Wallet Private Key**
   - From MetaMask or any EVM-compatible wallet
   - **⚠️ NEVER share or commit this key**

3. **Optional but Recommended:**
   - Alchemy API key (for reliable RPC)
   - Polygonscan API key (for contract verification)

---

## Step 1: Get Mumbai Test MATIC

### Option A: Polygon Faucet (Recommended)
```
1. Visit: https://faucet.polygon.technology/
2. Select "Mumbai" network
3. Paste your wallet address
4. Complete captcha
5. Click "Submit"
6. Wait 1-2 minutes for MATIC to arrive
```

### Option B: Alchemy Faucet
```
1. Create free account: https://auth.alchemyapi.io/signup
2. Visit: https://mumbaifaucet.com/
3. Paste wallet address
4. Receive 0.5 MATIC
```

### Option C: QuickNode Faucet
```
1. Visit: https://faucet.quicknode.com/polygon/mumbai
2. Connect wallet or paste address
3. Receive test MATIC
```

**Verify you received MATIC:**
```bash
# Check balance on Mumbai explorer
https://mumbai.polygonscan.com/address/<YOUR_ADDRESS>
```

---

## Step 2: Configure Environment Variables

### Export Your Private Key from MetaMask

**⚠️ Security Warning:** Only use test wallets for testnet deployments!

1. Open MetaMask
2. Click three dots → Account Details
3. Click "Export Private Key"
4. Enter password
5. Copy the private key (starts with 0x)

### Update Contract Configuration

```bash
cd /app/contracts

# Copy environment template
cp .env.example .env

# Edit .env file
nano .env
```

**Update these values:**
```env
# Your wallet private key (MUST start with 0x)
PRIVATE_KEY=0x1234...your_actual_private_key

# Optional: Alchemy API key (get from https://dashboard.alchemy.com)
ALCHEMY_API_KEY=your_alchemy_key_here

# Optional: Polygonscan API key (for verification)
POLYGONSCAN_API_KEY=your_polygonscan_key_here

# Network config (don't change)
CHAIN_ID=80001
POLYGON_RPC=https://polygon-rpc.com
```

**Save and exit** (Ctrl+X, then Y, then Enter)

---

## Step 3: Compile Smart Contract

```bash
cd /app/contracts

# Compile contracts
npm run compile
```

**Expected output:**
```
Compiled 4 Solidity files successfully
```

**What this does:**
- Compiles RaceContract.sol
- Generates ABI and bytecode
- Creates artifacts in /artifacts directory

---

## Step 4: Deploy to Mumbai

```bash
# Deploy to Mumbai testnet
npm run deploy:mumbai
```

**Expected output:**
```
Deploying RaceContract...
Deploying with account: 0x742d35Cc...
Account balance: 1.5 MATIC
RaceContract deployed to: 0xABCD1234...
Deployment info saved to /app/contracts/deployments/mumbai.json
ABI copied to frontend
Waiting for block confirmations...
Verifying contract on Polygonscan...
✅ Contract verified successfully
```

**Important:** Save the deployed contract address!

---

## Step 5: Verify Deployment

### Check on Mumbai Explorer

1. Visit: https://mumbai.polygonscan.com/
2. Search for your contract address
3. You should see:
   - Contract creation transaction
   - Contract balance (0 MATIC)
   - Contract code (if verification succeeded)

### Verify Contract Manually (if auto-verification failed)

```bash
cd /app/contracts

npx hardhat verify --network mumbai <CONTRACT_ADDRESS>
```

**Example:**
```bash
npx hardhat verify --network mumbai 0xABCD1234567890...
```

---

## Step 6: Update Frontend Configuration

### Method A: Update .env directly

```bash
cd /app/frontend

# Edit .env file
nano .env
```

Update this line with your deployed contract address:
```env
EXPO_PUBLIC_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_ADDRESS_HERE
```

### Method B: Use deployment script

```bash
# Auto-update from deployment file
cd /app/frontend

# Copy address from contracts deployment
CONTRACT_ADDR=$(cat ../contracts/deployments/mumbai.json | grep raceContract | cut -d'"' -f4)
sed -i "s/EXPO_PUBLIC_CONTRACT_ADDRESS=.*/EXPO_PUBLIC_CONTRACT_ADDRESS=$CONTRACT_ADDR/" .env

echo "✅ Contract address updated to: $CONTRACT_ADDR"
```

---

## Step 7: Configure WalletConnect (Optional)

For production-ready wallet connection:

1. **Get WalletConnect Project ID**
   ```
   Visit: https://cloud.walletconnect.com/
   Click "Create Project"
   Copy Project ID
   ```

2. **Update Frontend .env**
   ```env
   EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID=your_actual_project_id
   ```

---

## Step 8: Test the Deployment

### A. Test Contract Directly (Hardhat Console)

```bash
cd /app/contracts

npx hardhat console --network mumbai
```

```javascript
// In Hardhat console
const RaceContract = await ethers.getContractFactory("RaceContract");
const contract = await RaceContract.attach("0xYOUR_CONTRACT_ADDRESS");

// Create a test race
const tx = await contract.createRace(
  ethers.parseEther("0.01"),  // 0.01 MATIC entry fee
  4                            // Max 4 players
);
await tx.wait();

// Check race counter
const counter = await contract.raceCounter();
console.log("Races created:", counter.toString());
```

### B. Test Frontend Integration

```bash
cd /app/frontend

# Restart expo
sudo supervisorctl restart expo

# Access app
# Open: https://gamefi-roach.preview.emergentagent.com/
```

**Test Flow:**
1. Connect wallet (currently simulated)
2. Select entry fee
3. Choose cockroach
4. Start race
5. View results

---

## Step 9: Create a Test Race On-Chain

### Using Hardhat Script

```bash
cd /app/contracts

# Create test script
cat > scripts/createTestRace.js << 'EOF'
const hre = require("hardhat");

async function main() {
  const contractAddress = "0xYOUR_CONTRACT_ADDRESS";
  
  const RaceContract = await hre.ethers.getContractFactory("RaceContract");
  const contract = RaceContract.attach(contractAddress);
  
  console.log("Creating test race...");
  
  const tx = await contract.createRace(
    hre.ethers.parseEther("0.01"),
    4
  );
  
  const receipt = await tx.wait();
  console.log("✅ Race created! Transaction:", receipt.hash);
  
  const raceId = await contract.raceCounter();
  console.log("Race ID:", raceId.toString());
}

main().catch(console.error);
EOF

# Run the script
npx hardhat run scripts/createTestRace.js --network mumbai
```

---

## Troubleshooting

### Error: "Insufficient funds for gas"

**Problem:** Not enough MATIC in wallet

**Solution:**
```bash
# Check balance
npx hardhat run scripts/checkBalance.js --network mumbai

# Get more MATIC from faucet
```

---

### Error: "Transaction reverted"

**Possible causes:**
1. Incorrect function parameters
2. Gas limit too low
3. Contract logic failure

**Solution:**
```bash
# Check transaction details on Mumbai explorer
https://mumbai.polygonscan.com/tx/<TX_HASH>

# Run tests locally first
cd /app/contracts
npm test
```

---

### Error: "Cannot connect to RPC"

**Problem:** Network connectivity issues

**Solutions:**

**Option 1: Use Alchemy RPC**
```env
ALCHEMY_API_KEY=your_key_here
# RPC will auto-use Alchemy URL
```

**Option 2: Use different public RPC**
```javascript
// In hardhat.config.js, mumbai network:
url: "https://rpc.ankr.com/polygon_mumbai"
// or
url: "https://polygon-mumbai.g.alchemy.com/v2/<KEY>"
```

---

### Error: "Contract verification failed"

**Manual verification:**

1. Visit https://mumbai.polygonscan.com/verifyContract
2. Enter contract address
3. Select:
   - Compiler: Solidity 0.8.20
   - Optimization: Yes (200 runs)
4. Paste contract code from `contracts/RaceContract.sol`
5. Submit

---

## Gas Optimization Tips

### Estimated Gas Costs (Mumbai)

| Function | Gas Used | Cost (MATIC) |
|----------|----------|--------------|
| Deploy Contract | ~1,300,000 | ~0.026 |
| Create Race | ~140,000 | ~0.0028 |
| Join Race | ~140,000 | ~0.0028 |
| Start Race | ~72,000 | ~0.0014 |
| Finalize Race | ~124,000 | ~0.0025 |
| Withdraw | ~32,000 | ~0.0006 |

**Total for full race flow:** ~0.01 MATIC

---

## Production Deployment Checklist

Before deploying to Polygon Mainnet:

### Smart Contract
- [ ] All tests passing (19/19)
- [ ] Security audit completed
- [ ] Gas optimization review
- [ ] Emergency pause mechanism tested
- [ ] Admin functions protected

### Frontend
- [ ] Real WalletConnect integration
- [ ] Transaction error handling
- [ ] Loading states for all actions
- [ ] Mainnet RPC configured
- [ ] Contract address updated

### Security
- [ ] Private keys secured (use hardware wallet)
- [ ] Multi-sig for admin functions
- [ ] Rate limiting on backend
- [ ] Input validation everywhere

### Monitoring
- [ ] Polygonscan alerts configured
- [ ] Transaction monitoring
- [ ] Error logging (Sentry)
- [ ] Analytics tracking

---

## Quick Reference

### Mumbai Network Details
```
Network Name: Mumbai Testnet
RPC URL: https://rpc-mumbai.maticvigil.com
Chain ID: 80001
Currency Symbol: MATIC
Block Explorer: https://mumbai.polygonscan.com/
```

### Useful Commands
```bash
# Compile contracts
cd /app/contracts && npm run compile

# Run tests
npm test

# Deploy to Mumbai
npm run deploy:mumbai

# Check deployment
cat deployments/mumbai.json

# Verify contract
npx hardhat verify --network mumbai <ADDRESS>

# Restart frontend
cd /app/frontend && sudo supervisorctl restart expo
```

### Contract Addresses (Update after deployment)
```
Mumbai Testnet: 0x...
Polygon Mainnet: TBD (Phase 3+)
```

---

## Next Steps After Deployment

1. **Test End-to-End Flow**
   - Create multiple races
   - Test all edge cases
   - Verify payouts work correctly

2. **Integrate Real Wallet**
   - Implement WalletConnect SDK
   - Test MetaMask mobile deep linking
   - Handle transaction signing

3. **Add Firebase Backend**
   - Store race history
   - Real-time updates
   - Player statistics

4. **Phase 2 Preparation**
   - Design NFT contracts
   - Plan IPFS integration
   - Sketch accessory system

---

## Support Resources

**Polygon Documentation**
- Mumbai Testnet: https://wiki.polygon.technology/docs/develop/network-details/network/
- Faucets: https://wiki.polygon.technology/docs/develop/tools/polygon-faucet/

**Development Tools**
- Hardhat: https://hardhat.org/
- ethers.js: https://docs.ethers.io/
- Alchemy: https://docs.alchemy.com/

**Community**
- Polygon Discord: https://discord.com/invite/polygon
- Hardhat Discord: https://discord.com/invite/hardhat

---

**Last Updated:** 2025-01-14  
**Network:** Mumbai Testnet (Chain ID: 80001)  
**Status:** Ready for deployment 🚀
