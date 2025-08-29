# 🎮 MonanimalCrush Onchain Score System - Deployment Guide

## 📋 **Deployment Summary**

- **Contract Address**: `0x88C6D20C5E34236E6dc615e2F6B5aA3Ff5B6a349`
- **Network**: Monad Testnet
- **Chain ID**: 10143
- **Deployer**: `0xc23c128c6e685d3235AF493B8F38B440fD30860e`
- **Deployment Date**: August 27, 2025

## 🔗 **Links**

- **Monad Explorer**: https://testnet.monadexplorer.com/address/0x88C6D20C5E34236E6dc615e2F6B5aA3Ff5B6a349
- **Monad Testnet RPC**: https://testnet-rpc.monad.xyz
- **Game URL**: `/monanimalcrush`

## 🏗️ **System Architecture**

### **1. Smart Contract (MonanimalCrushScore.sol)**
- **Location**: `contracts/MonanimalCrushScore.sol`
- **Features**:
  - Fee-free score submission via signatures
  - Player statistics tracking
  - Global leaderboard system
  - Monad Games ID integration
  - Replay attack protection

### **2. Frontend Integration**
- **Location**: `src/dapp/components/mon-crush/MonanimalCrushGame.tsx`
- **Features**:
  - Automatic score submission on candy matches
  - Wallet signature for fee-free transactions
  - Real-time blockchain integration

### **3. API Endpoint**
- **Location**: `api/submit-score.ts`
- **Features**:
  - Signature verification
  - Score validation
  - Blockchain submission relay

## 🚀 **How It Works**

### **Step 1: Player Plays Game**
1. Player connects wallet to Monad Testnet
2. Plays MonanimalCrush game
3. Matches candies and earns score

### **Step 2: Score Submission**
1. Frontend creates message with score details
2. Player signs message (no gas fee)
3. Signed data sent to API endpoint

### **Step 3: Blockchain Recording**
1. API verifies signature
2. Score submitted to smart contract
3. Player stats updated on-chain
4. Leaderboard automatically updated

## 💰 **Fee-Free Meta-Transactions**

- **No Gas Fees**: Players only sign messages
- **Relayer System**: Backend handles blockchain submission
- **Signature Security**: ECDSA verification prevents fraud
- **Replay Protection**: Unique nonces for each submission

## 📊 **Player Statistics**

- **Total Score**: Cumulative score across all games
- **Highest Score**: Best single game performance
- **Total Matches**: Number of candy matches
- **Total Combos**: Combo bonus points earned
- **Rank**: Global leaderboard position

## 🏆 **Leaderboard System**

- **Rank 1**: 10,000+ total score
- **Rank 2**: 5,000+ total score
- **Rank 3**: 2,000+ total score
- **Rank 4**: 1,000+ total score
- **Rank 5**: <1,000 total score

## 🔧 **Technical Details**

### **Smart Contract Functions**
```solidity
function submitScoreWithSignature(
    uint256 score,
    uint256 matchedCount,
    uint256 comboBonus,
    uint256 nonce,
    bytes memory signature
) external

function getPlayerStats(address player) external view returns (...)
function getContractStats() external view returns (...)
```

### **Frontend Integration**
```typescript
const submitScoreToBlockchain = async (totalScore, matchedCount, comboBonus) => {
    const signature = await walletClient.signMessage({ message, account: address });
    await fetch('/api/submit-score', { method: 'POST', body: JSON.stringify({...}) });
};
```

## 🧪 **Testing**

### **1. Local Testing**
```bash
npm start
# Navigate to /monanimalcrush
# Connect MetaMask to Monad Testnet
# Play game and check console for score submissions
```

### **2. Contract Verification**
```bash
npx hardhat verify --network monadTestnet 0x88C6D20C5E34236E6dc615e2F6B5aA3Ff5B6a349
```

### **3. Score Submission Test**
```bash
# Check API endpoint
curl -X POST http://localhost:3000/api/submit-score \
  -H "Content-Type: application/json" \
  -d '{"player":"0x...","score":100,"matchedCount":5,"comboBonus":10,"nonce":123,"signature":"0x...","gameId":"monanimalcrush"}'
```

## 🔒 **Security Features**

- **Signature Verification**: ECDSA-based message signing
- **Nonce Protection**: Prevents replay attacks
- **Input Validation**: Score and match count validation
- **Access Control**: Owner-only emergency functions

## 📈 **Future Enhancements**

- **Real-time Leaderboard**: Live updates on frontend
- **Achievement System**: Badges for milestones
- **Tournament Mode**: Time-limited competitions
- **Cross-Game Integration**: Unified Monad Games platform

## 🐛 **Troubleshooting**

### **Common Issues**
1. **Signature Verification Failed**: Check message format and nonce
2. **Contract Not Found**: Verify contract address and network
3. **API Errors**: Check console for detailed error messages

### **Debug Commands**
```bash
# Check contract deployment
npx hardhat run scripts/deploy-monanimalcrush-ethers.cjs

# Verify contract on explorer
npx hardhat verify --network monadTestnet [CONTRACT_ADDRESS]

# Check contract stats
npx hardhat console --network monadTestnet
> const contract = await ethers.getContractAt("MonanimalCrushScore", "0x88C6D20C5E34236E6dc615e2F6B5aA3Ff5B6a349")
> await contract.getContractStats()
```

## 📞 **Support**

- **Contract Issues**: Check Monad Explorer for transaction status
- **Frontend Issues**: Check browser console for error messages
- **API Issues**: Check server logs for detailed errors

---

**🎯 MonanimalCrush Onchain Score System is now live on Monad Testnet!**

Players can now earn scores, compete on leaderboards, and have their achievements permanently recorded on the blockchain - all without paying gas fees! 🚀✨






