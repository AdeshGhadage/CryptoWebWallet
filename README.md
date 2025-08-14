# CryptoWebWallet 🚀

A modern, secure multi-chain cryptocurrency wallet built with React and Vite. Support for Solana and Ethereum testnets with HD wallet generation, transaction history, and easy-to-use interface.

## ✨ Features

### 🔐 Security
- **HD Wallet Generation**: BIP39 mnemonic phrase generation
- **Multi-Account Support**: Generate multiple addresses from a single seed phrase
- **Local Storage**: Private keys stored securely in browser's local storage
- **Testnet Only**: Designed for safe testing on devnet/testnet networks

### 💰 Solana Support
- **Devnet Integration**: Full Solana devnet support
- **Balance Checking**: Real-time SOL balance updates
- **Airdrop Functionality**: Request test SOL directly from the interface
- **Transaction History**: View recent transaction activity
- **Send Transactions**: Transfer SOL between wallets
- **Manual Refresh**: Force balance and transaction updates

### 🔷 Ethereum Support  
- **Sepolia Testnet**: Complete Ethereum Sepolia testnet integration
- **Balance Monitoring**: Real-time ETH balance tracking
- **Faucet Integration**: Direct links to Sepolia faucets for test ETH
- **Transaction History**: Complete transaction activity log
- **Send Transactions**: Transfer ETH between addresses
- **Gas Optimization**: Automatic gas price fetching

### 🎨 User Interface
- **Wallet Switching**: Easy toggle between Solana and Ethereum wallets
- **Address Management**: Multiple addresses per blockchain
- **Copy Functions**: One-click copying of addresses and transaction hashes
- **Responsive Design**: Works on desktop and mobile devices
- **Loading States**: Clear feedback during operations

## 🛠️ Tech Stack

### Frontend Framework
- **React 18** - Modern React with hooks
- **Vite** - Lightning-fast build tool and dev server
- **React Router DOM** - Client-side routing

### Blockchain Libraries
- **@solana/web3.js** - Solana blockchain interaction
- **ethers.js v6** - Ethereum blockchain interaction
- **bip39** - Mnemonic phrase generation
- **ed25519-hd-key** - Solana HD key derivation
- **tweetnacl** - Cryptographic functions for Solana

### API Integration
- **Alchemy SDK** - Blockchain data and RPC endpoints
- **Axios** - HTTP client for API requests

### Development Tools
- **ESLint** - Code linting and formatting
- **Vite Plugin React** - React integration for Vite
- **Node Polyfills** - Browser compatibility for Node.js modules

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Alchemy Account** (for API access)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/CryptoWebWallet.git
cd CryptoWebWallet
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` file with your Alchemy API URLs:
```env
# API keys for testnet/devnet only
VITE_ALCHEMY_SOLANA_DEVNET_URL=https://solana-devnet.g.alchemy.com/v2/YOUR_API_KEY
VITE_ALCHEMY_ETH_SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
```

4. **Start the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to `http://localhost:5173`

## 📖 Usage Guide

### Getting Started
1. **Create Wallet**: Generate a new mnemonic phrase on first visit
2. **Save Seed Phrase**: Securely store your 12-word mnemonic phrase
3. **Generate Addresses**: Add new wallet addresses for each blockchain
4. **Get Test Tokens**: Use airdrop (Solana) or faucet (Ethereum) for test funds

### Solana Wallet
1. **Switch to Solana**: Select "Solana" from the wallet dropdown
2. **Add Address**: Click "Add" to generate new Solana addresses
3. **Request Airdrop**: Enter amount and click "Airdrop" for test SOL
4. **Check Balance**: Use "Refresh" button to update balance
5. **Send SOL**: Enter recipient address and amount, then click "Send SOL"

### Ethereum Wallet
1. **Switch to Ethereum**: Select "Ethereum" from the wallet dropdown
2. **Add Address**: Click "Add" to generate new Ethereum addresses
3. **Get Test ETH**: Click "Get Test ETH" to open Sepolia faucet
4. **Check Balance**: Use "Refresh" button to update balance
5. **Send ETH**: Enter recipient address and amount, then click "Send ETH"

## 🔧 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

## 🌐 Network Configuration

### Solana Devnet
- **RPC URL**: `https://api.devnet.solana.com`
- **Airdrop**: Built-in airdrop functionality
- **Explorer**: `https://explorer.solana.com/?cluster=devnet`

### Ethereum Sepolia
- **RPC URL**: `https://eth-sepolia.g.alchemy.com/v2/demo`
- **Faucet**: `https://www.alchemy.com/faucets/ethereum-sepolia`
- **Explorer**: `https://sepolia.etherscan.io`

## 🔒 Security Considerations

⚠️ **IMPORTANT SECURITY NOTES**

- **Testnet Only**: This wallet is designed for testnet/devnet use only
- **Private Key Storage**: Private keys are stored in browser's local storage
- **Not Production Ready**: Do not use for mainnet or real funds
- **Backup Seed Phrase**: Always backup your mnemonic phrase securely
- **Clear Data**: Use "Logout" to clear all stored data when done testing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**Airdrop not working?**
- Ensure you're on Solana devnet
- Wait 15-30 seconds and click "Refresh"
- Check console for error messages

**Ethereum balance not showing?**
- Verify you're on Sepolia testnet
- Click "Refresh" to update balance
- Use faucet to get test ETH first

**Transaction failed?**
- Check you have sufficient balance
- Verify recipient address is valid
- Ensure you're on the correct network

### Getting Help
- Check browser console for error messages
- Verify environment variables are set correctly
- Ensure you have test tokens for transactions

## 🙏 Acknowledgments

- [Solana Labs](https://solana.com) for excellent documentation
- [Ethereum Foundation](https://ethereum.org) for Ethereum development resources
- [Alchemy](https://alchemy.com) for reliable blockchain infrastructure
- [Vite](https://vitejs.dev) for amazing development experience

---

**⚡ Happy Testing!** Remember to only use testnet/devnet tokens and never input real private keys or seed phrases.
