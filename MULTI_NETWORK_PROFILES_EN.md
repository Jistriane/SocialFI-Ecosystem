<!--
Copyright (c) 2024-2034 jistriane Brunielli Silva de Oliveira <jistriane@live.com>
Criado do zero por mim. Removal of this notice is prohibited for 10 years.
-->

# 👤 Multi-Network Profiles - SocialFI Ecosystem

## 📋 Overview

The SocialFI Ecosystem now supports multiple blockchain networks, and **each network requires its own profile**. This means you need to create a separate profile for each network you want to use.

## 🌐 Supported Networks

### 1. **Ethereum Sepolia Testnet**
- **Chain ID:** 11155111
- **RPC:** `https://eth-sepolia.g.alchemy.com/v2/[API_KEY]`
- **Explorer:** https://sepolia.etherscan.io
- **Token:** SepoliaETH

### 2. **Metis Sepolia Testnet**
- **Chain ID:** 59902
- **RPC:** `https://sepolia.metisdevops.link`
- **Explorer:** https://sepolia-explorer.metisdevops.link
- **Token:** tMETIS

## 🎯 Current Profile Status

✅ **Ethereum Sepolia:** Profile created
- Username: `UsuarioTesteSepolia`
- Trust Score: 100
- Transaction: `0x334b8c7792eacabe0ccc6cc03e3fb74acac860c4e9628526e34c5fbc04972001`

✅ **Metis Sepolia:** Profile created
- Username: `UsuarioTesteMetis`
- Trust Score: 100
- Transaction: `0x7e1e34af978dcdf7399f81b789032635689fdff7154389c3ae4e3b44e3fafb87`

## 🚀 How to Create Profiles

### Option 1: Frontend (Recommended)

1. **Connect your wallet** to the frontend
2. **Switch to the desired network** using the network selector
3. **View the warning** that appears when there is no profile
4. **Click "Create Profile"** to create it automatically

### Option 2: Terminal Scripts

#### For Ethereum Sepolia:
```bash
node scripts/create-test-profile-sepolia.js
```

#### For Metis Sepolia:
```bash
node scripts/create-test-profile-metis.js
```

#### For other networks:
```bash
node scripts/create-test-profile.js
```

## 🔧 Technical Details

### Contract Addresses

#### Ethereum Sepolia (11155111)
```
RewardsToken:  0x55c8231d1c0b93d763bc01Fa4f5f9fa1424eaaF8
TrustChain:    0x95D41cc1dD95d0C40e401987f4Bc0a7BB2343184
TradeConnect:  0x564a7a43A779d0Ebc9a0E9e9A1B8ed1583338706
GovGame:       0x7123c8538953Ab1F3Fe9ea83722f6e7133DDF9f8
EcosystemHub:  0x8204C13B075e7E90C23C7117bAF31065CE02783b
```

#### Metis Sepolia (59902)
```
RewardsToken:  0x2a1df9d5b7D277a614607b4d8C82f3d085638751
TrustChain:    0xA6207a47E5D57f905A36756A4681607F12E66239
TradeConnect:  0xD0F5BAD2919ccC87583F7AeCb8ea0C12f141AFdf
GovGame:       0xf88d37494887b4AB0e1221b73A8056DB61538e85
EcosystemHub:  0x86A6FA81b7bA20E9B430613F820583a8473471aB
```

## ⚠️ Important Notices

### 1. **Profile per Network**
- Each blockchain network is independent
- You need to create a profile on each network you want to use
- Profiles are not synchronized between networks

### 2. **Tokens for Gas**
- **Ethereum Sepolia:** Needs SepoliaETH
- **Metis Sepolia:** Needs tMETIS
- Make sure you have enough balance before creating the profile

### 3. **Automatic Detection**
- The frontend automatically detects if you have a profile on the current network
- A colored warning appears when you need to create a profile
- The warning shows specific instructions for each network

## 🎨 User Interface

### Visual Warnings
- **🔵 Blue:** Ethereum Sepolia
- **🟢 Green:** Metis Sepolia
- **⚪ Gray:** Other networks

### Displayed Information
- Name of the current network
- Profile status (exists/does not exist)
- Instructions to create a profile
- Specific scripts for each network
- Gas reminders

## 🔍 System Verification

To check if everything is working correctly:

```bash
node scripts/verify-multi-network.js
```

This script checks:
- Connectivity with all networks
- Status of deployed contracts
- Latest blocks
- System integrity

## 📱 Using the Frontend

1. **Open the frontend:** http://localhost:3001
2. **Connect your wallet**
3. **Switch between networks** using the selector
4. **Observe the warnings** when there is no profile
5. **Create profiles as needed**

## 🛠️ Troubleshooting

### "Profile does not exist"
- ✅ **Solution:** Create a profile on the current network
- Use the button in the frontend or run the corresponding script

### "Insufficient funds"
- ✅ **Solution:** Get tokens from the network using faucets
- Ethereum Sepolia: Use official faucets
- Metis Sepolia: Use the official Metis faucet

### "Wrong network"
- ✅ **Solution:** Switch to the correct network in your wallet
- Use the network selector in the frontend

## 📈 Next Steps

- [ ] Add more testnets
- [ ] Implement profile synchronization (optional)
- [ ] Improve UX for network switching
- [ ] Add usage metrics per network

---

**📅 Last update:** 2025-06-26
**✅ Status:** Fully functional on both networks 