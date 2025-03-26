import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getContract } from "./ethereum";
import { Transaction, TransactionListProps } from "./types";
import { Copy, RefreshCw } from "lucide-react";

const TransactionList: React.FC<TransactionListProps> = ({ isWalletConnected }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const contract = await getContract();
      const count = await contract.getTransactionCount();
      const countNumber = Number(count);

      const txnArray = [];
      for (let i = countNumber - 1; i >= 0; i--) {
        const txn = await contract.getTransaction(i);
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

      setTransactions(txnArray);
    } catch (error: any) {
      console.error("Error fetching transactions:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isWalletConnected) {
      fetchTransactions();
    } else {
      setTransactions([]);
      setError("Please connect your wallet to view transactions.");
    }
  }, [isWalletConnected]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Transaction Logs</h2>
        <button
          onClick={fetchTransactions}
          disabled={!isWalletConnected || loading}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-900/50 text-red-200 rounded-lg">{error}</div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No transactions found.</div>
      ) : (
        <div className="space-y-4">
          {transactions.map((txn, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Sender</span>
                    <button
                      onClick={() => copyToClipboard(txn.sender)}
                      className="text-gray-400 hover:text-white"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm font-mono">{txn.sender}</p>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Receiver</span>
                    <button
                      onClick={() => copyToClipboard(txn.receiver)}
                      className="text-gray-400 hover:text-white"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm font-mono">{txn.receiver}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-gray-400">Amount</span>
                  <p className="text-lg font-semibold">{ethers.formatUnits(txn.amount, 18)} ETH</p>
                </div>
                <div>
                  <span className="text-gray-400">Gas Used</span>
                  <p>{txn.gasUsed.toString()}</p>
                </div>
                <div>
                  <span className="text-gray-400">Block</span>
                  <p>{txn.blockNumber.toString()}</p>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Transaction Hash</span>
                  <button
                    onClick={() => copyToClipboard(txn.txHash)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm font-mono">{txn.txHash}</p>
              </div>
              <div>
                <span className="text-gray-400">Timestamp</span>
                <p>{new Date(Number(txn.timestamp) * 1000).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionList;