# Secure Scholar Seal

A revolutionary academic credential verification platform powered by Fully Homomorphic Encryption (FHE) technology. Secure Scholar Seal enables secure, private, and transparent scholarship applications with zero-knowledge verification capabilities.

## 🚀 Features

- **FHE-Powered Encryption**: All sensitive academic data is encrypted using Fully Homomorphic Encryption
- **Zero-Knowledge Verification**: Verify credentials without revealing underlying data
- **Blockchain Integration**: Immutable credential records on the blockchain
- **Multi-Wallet Support**: Connect with Rainbow, WalletConnect, and other popular wallets
- **Academic Score Privacy**: Encrypted GPA, test scores, and academic achievements
- **Institution Verification**: Secure verification by educational institutions
- **Reputation System**: Trust-based reputation scoring for scholars and institutions

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS
- **Blockchain**: Ethereum Sepolia Testnet
- **Wallet Integration**: RainbowKit, Wagmi, Viem
- **Smart Contracts**: Solidity with FHE support
- **Encryption**: Zama FHEVM for homomorphic encryption

## 📋 Prerequisites

- Node.js 18+ and npm
- Git
- MetaMask or compatible Web3 wallet
- Sepolia ETH for gas fees

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/DjangoWizard/secure-scholar-seal.git
   cd secure-scholar-seal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update the following variables in `.env.local`:
   ```env
   NEXT_PUBLIC_CHAIN_ID=11155111
   NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=YOUR_WALLETCONNECT_PROJECT_ID
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔧 Smart Contract Deployment

The project includes FHE-enabled smart contracts for secure credential management:

- **SecureScholarSeal.sol**: Main contract for credential verification
- **Scholar Profiles**: Encrypted academic profiles
- **Credential Management**: Issue and verify academic credentials
- **Verification Requests**: Secure verification workflow
- **Academic Records**: Encrypted academic history

### Deploy to Sepolia

1. **Install Hardhat dependencies**
   ```bash
   npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
   ```

2. **Configure Hardhat**
   ```bash
   npx hardhat init
   ```

3. **Deploy contracts**
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```

## 🌐 Vercel Deployment

### Step-by-Step Deployment Guide

1. **Prepare for deployment**
   ```bash
   npm run build
   ```

2. **Connect to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "New Project"
   - Import your GitHub repository

3. **Configure environment variables**
   In Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add the following variables:
     ```
     NEXT_PUBLIC_CHAIN_ID=11155111
     NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
     NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=YOUR_WALLETCONNECT_PROJECT_ID
     NEXT_PUBLIC_INFURA_API_KEY=YOUR_INFURA_KEY
     ```

4. **Deploy**
   - Click "Deploy" button
   - Wait for deployment to complete
   - Your app will be available at `https://your-project.vercel.app`

## 🔐 Security Features

- **FHE Encryption**: All sensitive data encrypted with homomorphic encryption
- **Zero-Knowledge Proofs**: Verify without revealing data
- **Smart Contract Security**: Audited and tested contracts
- **Wallet Security**: Non-custodial wallet integration
- **Data Privacy**: No personal data stored in plaintext

## 📚 API Documentation

### Smart Contract Functions

#### Scholar Profile Management
- `createScholarProfile()`: Create encrypted scholar profile
- `getScholarProfileInfo()`: Retrieve profile information
- `updateReputation()`: Update scholar reputation score

#### Credential Management
- `issueCredential()`: Issue encrypted academic credential
- `getCredentialInfo()`: Retrieve credential information
- `revokeCredential()`: Revoke issued credential

#### Verification System
- `submitVerificationRequest()`: Submit verification request
- `processVerificationRequest()`: Process verification request
- `getVerificationRequestInfo()`: Get request status

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Demo**: [Deployed on Vercel](https://secure-scholar-seal.vercel.app)
- **Documentation**: [Project Wiki](https://github.com/DjangoWizard/secure-scholar-seal/wiki)
- **Issues**: [GitHub Issues](https://github.com/DjangoWizard/secure-scholar-seal/issues)

## 🙏 Acknowledgments

- Zama for FHEVM technology
- Rainbow for wallet integration
- shadcn/ui for beautiful components
- The Ethereum community for blockchain infrastructure

---

**Built with ❤️ for the future of academic credential verification**