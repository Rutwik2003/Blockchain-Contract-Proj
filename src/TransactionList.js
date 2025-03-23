import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getContract } from "./ethereum";
import { ClipLoader } from "react-spinners";
import "./App.css";

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const contract = await getContract();
      console.log("Contract fetched:", contract);
      console.log("Contract address:", contract.target);

      if (!contract.getTransactionCount) {
        throw new Error("getTransactionCount function not found in contract ABI");
      }

      const count = await contract.getTransactionCount();
      console.log("Transaction count (raw):", count);
      const countNumber = Number(count);
      console.log("Transaction count (number):", countNumber);

      const txnArray = [];
      for (let i = 0; i < countNumber; i++) {
        const txn = await contract.getTransaction(i);
        console.log(`Transaction ${i}:`, txn);
        txnArray.push({
          sender: txn[0],
          receiver: txn[1],
          amount: txn[2],
          gasUsed: txn[3],
          timestamp: txn[4],
          txHash: txn[5],
          blockNumber: txn[6],
        });
      }

      console.log("Transactions array:", txnArray);
      setTransactions(txnArray);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="transaction-list">
      <h1>Transaction Logs</h1>
      <button onClick={fetchTransactions}>Refresh Transactions</button>
      {loading ? (
        <div className="loading">
          <ClipLoader color="#61dafb" size={40} />
        </div>
      ) : error ? (
        <div className="error">Error: {error}</div>
      ) : transactions.length === 0 ? (
        <div className="no-transactions">No transactions found.</div>
      ) : (
        <ul>
          {transactions.map((txn, index) => (
            <li key={index} className="transaction-item">
              <div>
                <strong>Sender:</strong> <span>{txn.sender}</span>
                <button
                  className="copy-button"
                  onClick={() => copyToClipboard(txn.sender)}
                >
                  Copy
                </button>
              </div>
              <div>
                <strong>Receiver:</strong> <span>{txn.receiver}</span>
                <button
                  className="copy-button"
                  onClick={() => copyToClipboard(txn.receiver)}
                >
                  Copy
                </button>
              </div>
              <div>
                <strong>Amount:</strong> <span>{ethers.formatUnits(txn.amount, 18)} ETH</span>
              </div>
              <div>
                <strong>Gas Used:</strong> <span>{txn.gasUsed.toString()}</span>
              </div>
              <div>
                <strong>Timestamp:</strong> <span>{new Date(Number(txn.timestamp) * 1000).toLocaleString()}</span>
              </div>
              <div>
                <strong>Transaction ID:</strong> <span>{txn.txHash}</span>
                <button
                  className="copy-button"
                  onClick={() => copyToClipboard(txn.txHash)}
                >
                  Copy
                </button>
              </div>
              <div>
                <strong>Block Number:</strong> <span>{txn.blockNumber.toString()}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TransactionList;