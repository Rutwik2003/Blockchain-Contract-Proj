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
   Before proceeding with the application, you need to create and deploy the \`TransactionLogger.sol\` smart contract on the Sepolia testnet. Follow the steps below to create, compile, and deploy the smart contract using Remix IDE.

   **Create and Deploy the Smart Contract:**
   - Go to Remix IDE: Visit [https://remix.ethereum.org/](https://remix.ethereum.org/) in your browser.
   - Create a new file: In the Remix IDE, create a new file called \`TransactionLogger.sol\` in the "contracts" folder.
     - [Create your own contract]

   **Compile the Contract:**
   - In Remix, go to the "Solidity Compiler" tab and select the appropriate compiler version (0.8.x or higher).
   - Click on the "Compile" button to compile the \`TransactionLogger.sol\` file.

   **Deploy the Contract:**
   - After compiling the contract, go to the "Deploy & Run Transactions" tab.
   - Select "Injected Web3" as the environment to use your MetaMask wallet.
   - Make sure your MetaMask is connected to the Sepolia testnet.
   - Click on the "Deploy" button and confirm the transaction in MetaMask.

   **Copy the Contract Address:**
   - Once the contract is deployed, copy the contract address.

   **Update the Contract Address in the App:**
   - Open `src/ethereum.js` in your React app.
   - Replace the placeholder contract address with your deployed contract address:
     ```javascript
     const contractAddress = "$CONTRACT_ADDRESS";
     ```
     
4. **Run Locally:**
```bash
npm start
```
The app will open at http://localhost:3000.
