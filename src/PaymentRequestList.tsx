import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getContract } from "./ethereum";
import { PaymentRequest, PaymentRequestListProps } from "./types";
import { Copy, RefreshCw } from "lucide-react";

const PaymentRequestList: React.FC<PaymentRequestListProps> = ({ isWalletConnected, walletAddress }) => {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [manualHash, setManualHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const contract = await getContract();
      const count = Number(await contract.getPaymentRequestCount()) || 0;

      const requestArray = [];
      for (let i = 0; i < count; i++) {
        const request = await contract.getPaymentRequest(i);
        requestArray.push({
          requester: request[0],
          payer: request[1],
          amount: request[2],
          fulfilled: request[3],
          timestamp: request[4],
          requestHash: request[5],
        });
      }
      setRequests(requestArray);
    } catch (err: any) {
      console.error("Error fetching payment requests:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fulfillRequest = async (requestHash: string, amount: bigint) => {
    try {
      const contract = await getContract();
      const tx = await contract.fulfillPayment(requestHash, { value: amount });
      await tx.wait();
      alert("Payment fulfilled successfully!");
      fetchPaymentRequests();
    } catch (err: any) {
      console.error("Error fulfilling payment:", err);
      alert("Error fulfilling payment: " + err.message);
    }
  };

  const fulfillManualRequest = async () => {
    if (!manualHash) {
      alert("Please enter a request hash.");
      return;
    }
    try {
      const contract = await getContract();
      const request = requests.find((r) => r.requestHash === manualHash);
      if (!request || request.fulfilled) {
        alert("Invalid or already fulfilled request.");
        return;
      }
      const tx = await contract.fulfillPayment(manualHash, { value: request.amount });
      await tx.wait();
      alert("Payment fulfilled successfully!");
      fetchPaymentRequests();
      setManualHash("");
    } catch (err: any) {
      console.error("Error fulfilling payment:", err);
      alert("Error fulfilling payment: " + err.message);
    }
  };

  useEffect(() => {
    let contract;

    const setupEventListener = async () => {
      if (!isWalletConnected || !walletAddress) return;

      contract = await getContract();
      console.log("Setting up event listener for PaymentRequested...");

      contract.on("PaymentRequested", (requester, payer, amount, requestHash, event) => {
        console.log("PaymentRequested event received:", {
          requester,
          payer,
          amount: ethers.formatEther(amount),
          requestHash,
        });

        if (payer.toLowerCase() === walletAddress.toLowerCase()) {
          const formattedAmount = ethers.formatEther(amount);
          alert(
            `New payment request for ${formattedAmount} ETH from ${requester}!\nRequest Hash: ${requestHash}`
          );
          fetchPaymentRequests();
        }
      });
    };

    setupEventListener();

    return () => {
      if (contract) {
        console.log("Cleaning up PaymentRequested event listener...");
        contract.removeAllListeners("PaymentRequested");
      }
    };
  }, [isWalletConnected, walletAddress]);

  useEffect(() => {
    if (isWalletConnected) {
      fetchPaymentRequests();
    } else {
      setRequests([]);
      setError("Please connect your wallet to view payment requests.");
    }
  }, [isWalletConnected]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Payment Requests</h2>
        <button
          onClick={fetchPaymentRequests}
          disabled={!isWalletConnected || loading}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      <div className="flex space-x-4">
        <input
          type="text"
          value={manualHash}
          onChange={(e) => setManualHash(e.target.value)}
          placeholder="Enter request hash to fulfill"
          className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={!isWalletConnected}
        />
        <button
          onClick={fulfillManualRequest}
          disabled={!isWalletConnected || !manualHash}
          className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Fulfill by Hash
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-900/50 text-red-200 rounded-lg">{error}</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No payment requests found.</div>
      ) : (
        <div className="space-y-4">
          {requests.map((request, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Requester</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(request.requester)}
                      className="text-gray-400 hover:text-white"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm font-mono">{request.requester}</p>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Payer</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(request.payer)}
                      className="text-gray-400 hover:text-white"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm font-mono">{request.payer}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400">Amount</span>
                  <p className="text-lg font-semibold">{ethers.formatUnits(request.amount, 18)} ETH</p>
                </div>
                <div>
                  <span className="text-gray-400">Status</span>
                  <p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        request.fulfilled
                          ? "bg-green-900/50 text-green-200"
                          : "bg-yellow-900/50 text-yellow-200"
                      }`}
                    >
                      {request.fulfilled ? "Fulfilled" : "Pending"}
                    </span>
                  </p>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Request Hash</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(request.requestHash)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm font-mono">{request.requestHash}</p>
              </div>
              <div>
                <span className="text-gray-400">Timestamp</span>
                <p>{new Date(Number(request.timestamp) * 1000).toLocaleString()}</p>
              </div>
              {!request.fulfilled && request.payer.toLowerCase() === walletAddress?.toLowerCase() && (
                <button
                  onClick={() => fulfillRequest(request.requestHash, request.amount)}
                  className="w-full mt-4 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Fulfill Payment
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentRequestList;