import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getContract, getProvider } from "./ethereum";
import { ClipLoader } from "react-spinners";
import "./App.css";

const TransactionList = ({ isWalletConnected }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecentEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const contract = await getContract();
      const provider = await getProvider();
      console.log("Contract address:", contract.target);

      const currentBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(currentBlock - 100, 0); // Last 100 blocks for speed

      const filters = {
        contribution: contract.filters.ContributionReceived(),
        proposal: contract.filters.ProposalCreated(),
        vote: contract.filters.Voted(),
        funds: contract.filters.FundsReleased(),
      };

      console.log(`Fetching events from block ${fromBlock} to ${currentBlock}`);

      const [contributions, proposals, votes, funds] = await Promise.all([
        provider.getLogs({ ...filters.contribution, fromBlock, toBlock: currentBlock }),
        provider.getLogs({ ...filters.proposal, fromBlock, toBlock: currentBlock }),
        provider.getLogs({ ...filters.vote, fromBlock, toBlock: currentBlock }),
        provider.getLogs({ ...filters.funds, fromBlock, toBlock: currentBlock }),
      ]);

      const txnArray = [];
      const blockCache = new Map();

      const fetchBlockTimestamps = async (logs) => {
        const blockNumbers = new Set(logs.map(log => log.blockNumber));
        for (const blockNumber of blockNumbers) {
          if (!blockCache.has(blockNumber)) {
            const block = await provider.getBlock(blockNumber);
            blockCache.set(blockNumber, block.timestamp);
          }
        }
      };

      await fetchBlockTimestamps([...contributions, ...proposals, ...votes, ...funds]);

      contributions.forEach(log => {
        const parsed = contract.interface.parseLog(log);
        const timestamp = blockCache.get(log.blockNumber);
        txnArray.push({
          type: "Contribution",
          sender: parsed.args.contributor,
          amount: ethers.formatEther(parsed.args.amount),
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
          timestamp: timestamp ? new Date(timestamp * 1000).toLocaleString() : "Unknown",
        });
      });

      proposals.forEach(log => {
        const parsed = contract.interface.parseLog(log);
        const timestamp = blockCache.get(log.blockNumber);
        txnArray.push({
          type: "Proposal Created",
          sender: parsed.args.proposer,
          description: parsed.args.description,
          amount: ethers.formatEther(parsed.args.amount),
          proposalId: Number(parsed.args.id),
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
          timestamp: timestamp ? new Date(timestamp * 1000).toLocaleString() : "Unknown",
        });
      });

      votes.forEach(log => {
        const parsed = contract.interface.parseLog(log);
        const timestamp = blockCache.get(log.blockNumber);
        txnArray.push({
          type: "Vote",
          sender: parsed.args.voter,
          proposalId: Number(parsed.args.proposalId),
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
          timestamp: timestamp ? new Date(timestamp * 1000).toLocaleString() : "Unknown",
        });
      });

      funds.forEach(log => {
        const parsed = contract.interface.parseLog(log);
        const timestamp = blockCache.get(log.blockNumber);
        txnArray.push({
          type: "Funds Released",
          sender: parsed.args.proposer,
          proposalId: Number(parsed.args.proposalId),
          amount: ethers.formatEther(parsed.args.amount),
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
          timestamp: timestamp ? new Date(timestamp * 1000).toLocaleString() : "Unknown",
        });
      });

      txnArray.sort((a, b) => b.blockNumber - a.blockNumber); // Latest first
      console.log("Fetched transactions:", txnArray);
      setTransactions(txnArray);

      if (txnArray.length === 0) {
        setError("No transactions found in the recent block range.");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to fetch transactions. Please try refreshing.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let contract;

    const setupEventListener = async () => {
      if (!isWalletConnected) {
        setTransactions([]);
        setError("Please connect your wallet to view transactions.");
        return;
      }

      contract = await getContract();
      console.log("Setting up event listeners...");

      fetchRecentEvents(); // Initial fetch

      contract.on("ContributionReceived", (contributor, amount, event) => {
        console.log("New Contribution:", { contributor, amount: ethers.formatEther(amount) });
        setTransactions(prev => [{
          type: "Contribution",
          sender: contributor,
          amount: ethers.formatEther(amount),
          txHash: event.transactionHash,
          blockNumber: event.blockNumber,
          timestamp: new Date().toLocaleString(), // Approximate for instant display
        }, ...prev]);
      });

      contract.on("ProposalCreated", (id, description, proposer, amount, event) => {
        console.log("New Proposal:", { id, description, proposer });
        setTransactions(prev => [{
          type: "Proposal Created",
          sender: proposer,
          description,
          amount: ethers.formatEther(amount),
          proposalId: Number(id),
          txHash: event.transactionHash,
          blockNumber: event.blockNumber,
          timestamp: new Date().toLocaleString(),
        }, ...prev]);
      });

      contract.on("Voted", (proposalId, voter, event) => {
        console.log("New Vote:", { proposalId, voter });
        setTransactions(prev => [{
          type: "Vote",
          sender: voter,
          proposalId: Number(proposalId),
          txHash: event.transactionHash,
          blockNumber: event.blockNumber,
          timestamp: new Date().toLocaleString(),
        }, ...prev]);
      });

      contract.on("FundsReleased", (proposalId, proposer, amount, event) => {
        console.log("New Funds Released:", { proposalId, proposer, amount });
        setTransactions(prev => [{
          type: "Funds Released",
          sender: proposer,
          proposalId: Number(proposalId),
          amount: ethers.formatEther(amount),
          txHash: event.transactionHash,
          blockNumber: event.blockNumber,
          timestamp: new Date().toLocaleString(),
        }, ...prev]);
      });
    };

    setupEventListener().catch(err => {
      console.error("Error setting up listeners:", err);
      setError("Failed to setup transaction listener: " + err.message);
    });

    return () => {
      if (contract) {
        console.log("Cleaning up event listeners...");
        contract.removeAllListeners("ContributionReceived");
        contract.removeAllListeners("ProposalCreated");
        contract.removeAllListeners("Voted");
        contract.removeAllListeners("FundsReleased");
      }
    };
  }, [isWalletConnected]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="transaction-list">
      <h1>Transaction Logs</h1>
      <button onClick={fetchRecentEvents} disabled={!isWalletConnected}>
        Refresh Transactions
      </button>
      {loading ? (
        <div className="loading">
          <ClipLoader color="#63b3ed" size={40} />
        </div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : transactions.length === 0 ? (
        <div className="no-transactions">No transactions found.</div>
      ) : (
        <ul>
          {transactions.map((txn, index) => (
            <li key={index} className="transaction-item">
              <div><strong>Type:</strong> {txn.type}</div>
              <div>
                <strong>Sender:</strong> {txn.sender}
                <button onClick={() => copyToClipboard(txn.sender)} className="copy-button">
                  Copy
                </button>
              </div>
              {txn.description && (
                <div><strong>Description:</strong> {txn.description}</div>
              )}
              {txn.proposalId !== undefined && (
                <div><strong>Proposal ID:</strong> {txn.proposalId}</div>
              )}
              {txn.amount && (
                <div><strong>Amount:</strong> {txn.amount} ETH</div>
              )}
              <div>
                <strong>Transaction Hash:</strong> {txn.txHash}
                <button onClick={() => copyToClipboard(txn.txHash)} className="copy-button">
                  Copy
                </button>
              </div>
              <div><strong>Block Number:</strong> {txn.blockNumber}</div>
              <div><strong>Timestamp:</strong> {txn.timestamp}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TransactionList;