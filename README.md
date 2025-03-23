# Blockchain Transaction Logger

A decentralized application (dApp) built with React and Solidity to log Ethereum transactions on the Sepolia testnet. Users can connect their MetaMask wallet, send Ether to a specified address, and view a detailed transaction history with a modern dark-themed UI.

## Features

- **Wallet Integration:** Connect and disconnect your MetaMask wallet dynamically with a "Connect Wallet" and "Disconnect" button.
- **Send Ether:** Input a receiver's address and send 0.01 ETH via a smart contract deployed on the Sepolia testnet.
- **Transaction Logging:** View a real-time list of transactions stored on-chain, including sender, receiver, amount, gas used, timestamp, transaction hash, and block number.
- **Dark Theme UI:** A sleek, modern interface with a dark gradient background, card-style transaction logs, and interactive buttons.
- **Responsive Design:** Optimized for both desktop and mobile devices.
- **Error Handling:** Displays validation errors for invalid addresses and connection issues.
- **Copy Functionality:** Copy sender, receiver, and transaction hash to the clipboard with a single click.

## Tech Stack

- **Frontend:** React, ethers.js, react-spinners
- **Smart Contract:** Solidity (compiled with Hardhat or Remix)
- **Blockchain:** Sepolia Testnet
- **Deployment:** Vercel
- **Styling:** Custom CSS with a dark theme
- **Wallet:** MetaMask

## Prerequisites

- **Node.js**: v16.x or later
- **MetaMask**: Installed in your browser with a Sepolia testnet account and some test ETH.
- **Git**: For cloning the repository.

## Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/Rutwik2003/Blockchain-Contract-Proj/
   cd Blockchain-Contract-Proj
2. **Install Dependencies:**
  ```bash
   npm install
  ```
3. **Configure the Smart Contract:**
 - Ensure the contractAddress in src/ethereum.js matches your deployed TransactionLogger.sol contract address on Sepolia.
 - Example: const contractAddress = "0x2324B46B4045597eB4d741743a87A73CC2cA479C";
 - If you haven’t deployed the contract yet, see the "Deploying the Smart Contract" section below.
4. **Run Locally:**
```bash
npm start
```
The app will open at http://localhost:3000.
