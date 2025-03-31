import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getContract } from "./ethereum";
import { ClipLoader } from "react-spinners";
import "./App.css";

const PaymentRequestList = ({ isWalletConnected, walletAddress }) => {
  const [requests, setRequests] = useState([]);
  const [manualHash, setManualHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    } catch (err) {
      console.error("Error fetching payment requests:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fulfillRequest = async (requestHash, amount) => {
    try {
      const contract = await getContract();
      const tx = await contract.fulfillPayment(requestHash, { value: amount });
      await tx.wait();
      alert("Payment fulfilled successfully!");
      fetchPaymentRequests();
    } catch (err) {
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
    } catch (err) {
      console.error("Error fulfilling payment:", err);
      alert("Error fulfilling payment: " + err.message);
    }
  };

  // Real-time event listener for PaymentRequested
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
          // Refresh the request list automatically
          fetchPaymentRequests();
        }
      });
    };

    setupEventListener();

    // Cleanup listener on unmount or when walletAddress/isWalletConnected changes
    return () => {
      if (contract) {
        console.log("Cleaning up PaymentRequested event listener...");
        contract.removeAllListeners("PaymentRequested");
      }
    };
  }, [isWalletConnected, walletAddress]);

  // Fetch requests when wallet connects/disconnects
  useEffect(() => {
    if (isWalletConnected) {
      fetchPaymentRequests();
    } else {
      setRequests([]);
      setError("Please connect your wallet to view payment requests.");
    }
  }, [isWalletConnected]);

  return (
    <div className="payment-request-list">
      <h1>Payment Requests</h1>
      <button onClick={fetchPaymentRequests} disabled={!isWalletConnected}>
        Refresh Requests
      </button>
      <div>
        <input
          type="text"
          value={manualHash}
          onChange={(e) => setManualHash(e.target.value)}
          placeholder="Enter request hash to fulfill"
          className="address-input"
          disabled={!isWalletConnected}
        />
        <button onClick={fulfillManualRequest} disabled={!isWalletConnected}>
          Fulfill by Hash
        </button>
      </div>
      {loading ? (
        <div className="loading">
          <ClipLoader color="#61dafb" size={40} />
        </div>
      ) : error ? (
        <div className="error">Error: {error}</div>
      ) : requests.length === 0 ? (
        <div className="no-transactions">No payment requests found.</div>
      ) : (
        <ul>
          {requests.map((request, index) => (
            <li key={index} className="transaction-item">
              <div>
                <strong>Requester:</strong> <span>{request.requester}</span>
              </div>
              <div>
                <strong>Payer:</strong> <span>{request.payer}</span>
              </div>
              <div>
                <strong>Amount:</strong>{" "}
                <span>{ethers.formatEther(request.amount)} ETH</span>
              </div>
              <div>
                <strong>Status:</strong>{" "}
                <span>{request.fulfilled ? "Fulfilled" : "Pending"}</span>
              </div>
              <div>
                <strong>Timestamp:</strong>{" "}
                <span>
                  {new Date(Number(request.timestamp) * 1000).toLocaleString()}
                </span>
              </div>
              <div>
                <strong>Request Hash:</strong> <span>{request.requestHash}</span>
              </div>
              {!request.fulfilled &&
                request.payer.toLowerCase() === walletAddress?.toLowerCase() && (
                  <button
                    onClick={() => fulfillRequest(request.requestHash, request.amount)}
                    className="fulfill-button"
                  >
                    Fulfill Payment
                  </button>
                )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PaymentRequestList;