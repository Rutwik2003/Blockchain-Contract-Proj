// ethereum.js
import { ethers } from "ethers";

const contractAddress = "0xB0Bdc093E66A17142C83a819B5C6E44241Da8c4f"; // Your contract address

const contractABI = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "contributor", "type": "address" },
      { "indexed": false, "name": "amount", "type": "uint256" }
    ],
    "name": "ContributionReceived",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "id", "type": "uint256" },
      { "indexed": false, "name": "description", "type": "string" },
      { "indexed": true, "name": "proposer", "type": "address" },
      { "indexed": false, "name": "amount", "type": "uint256" }
    ],
    "name": "ProposalCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "proposalId", "type": "uint256" },
      { "indexed": true, "name": "voter", "type": "address" }
    ],
    "name": "Voted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "proposalId", "type": "uint256" },
      { "indexed": true, "name": "proposer", "type": "address" },
      { "indexed": false, "name": "amount", "type": "uint256" }
    ],
    "name": "FundsReleased",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "contribute",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_description", "type": "string" },
      { "internalType": "uint256", "name": "_amount", "type": "uint256" }
    ],
    "name": "createProposal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_proposalId", "type": "uint256" }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_proposalId", "type": "uint256" }
    ],
    "name": "executeProposal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalTokenSupply",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "proposalCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "name": "proposals",
    "outputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" },
      { "internalType": "string", "name": "description", "type": "string" },
      { "internalType": "uint256", "name": "voteCount", "type": "uint256" },
      { "internalType": "bool", "name": "executed", "type": "bool" },
      { "internalType": "address", "name": "proposer", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "hasVoted",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  }
];

let provider;
let signer;
let contract;

export const getProvider = async () => {
  if (!provider) {
    if (window.ethereum) {
      provider = new ethers.BrowserProvider(window.ethereum);
    } else {
      throw new Error("No Ethereum provider found. Please install MetaMask.");
    }
  }
  return provider;
};

export const getSigner = async () => {
  if (!signer) {
    const provider = await getProvider();
    signer = await provider.getSigner();
  }
  return signer;
};

export const getContract = async () => {
  if (!contract) {
    const provider = await getProvider();
    const signer = await provider.getSigner();
    contract = new ethers.Contract(contractAddress, contractABI, signer);
  }
  return contract;
};

export const connectWallet = async () => {
  try {
    const provider = await getProvider();
    const accounts = await provider.send("eth_requestAccounts", []);
    if (accounts.length === 0) {
      throw new Error("No accounts found. Please connect your wallet.");
    }
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    return address;
  } catch (error) {
    throw new Error("Wallet connection failed: " + error.message);
  }
};

export const isConnected = async () => {
  if (!window.ethereum) return false;
  const provider = await getProvider();
  const accounts = await provider.listAccounts();
  return accounts.length > 0;
};

export const getContractAddress = () => contractAddress;