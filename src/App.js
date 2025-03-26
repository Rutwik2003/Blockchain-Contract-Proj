import React, { useState, useEffect } from "react";
import TransactionList from "./TransactionList";
import PaymentRequestList from "./PaymentRequestList";
import { ethers } from "ethers";
import { getContract, connectWallet, isConnected, getSigner } from "./ethereum";
import "./App.css";

const App = () => {
  const [receiverAddress, setReceiverAddress] = useState("");
  const [sendAmount, setSendAmount] = useState(""); // New state for send amount
  const [payerAddress, setPayerAddress] = useState("");
  const [requestAmount, setRequestAmount] = useState("");
  const [error, setError] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      if (isConnected()) {
        const signer = await getSigner();
        const address = await signer.getAddress();
        setWalletAddress(address);
        setIsWalletConnected(true);
      }
    };
    checkConnection();
  }, []);

  const handleConnectWallet = async () => {
    try {
      const address = await connectWallet();
      setWalletAddress(address);
      setIsWalletConnected(true);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setError("Failed to connect wallet: " + error.message);
    }
  };

  const handleDisconnectWallet = () => {
    setWalletAddress(null);
    setIsWalletConnected(false);
    setError(null);
  };

  const handleInputChange = (e) => {
    setReceiverAddress(e.target.value);
    setError(null);
  };

  const handleSendAmountChange = (e) => {
    setSendAmount(e.target.value);
    setError(null);
  };

  const handlePayerChange = (e) => {
    setPayerAddress(e.target.value);
    setError(null);
  };

  const handleAmountChange = (e) => {
    setRequestAmount(e.target.value);
    setError(null);
  };

  const clearInput = () => {
    setReceiverAddress("");
    setSendAmount("");
    setPayerAddress("");
    setRequestAmount("");
    setError(null);
  };

  const sendEther = async () => {
    if (!isWalletConnected) {
      setError("Please connect your wallet first.");
      return;
    }
    if (!receiverAddress || !ethers.isAddress(receiverAddress)) {
      setError("Please enter a valid receiver address.");
      return;
    }
    if (!sendAmount || isNaN(sendAmount) || Number(sendAmount) <= 0) {
      setError("Please enter a valid amount to send.");
      return;
    }
    try {
      const contract = await getContract();
      const amountInWei = ethers.parseEther(sendAmount);
      const tx = await contract.sendEther(receiverAddress, { value: amountInWei });
      await tx.wait();
      alert("Transaction confirmed!");
      clearInput();
    } catch (error) {
      console.error("Error sending Ether:", error);
      alert("Error sending Ether: " + error.message);
    }
  };

  const requestPayment = async () => {
    if (!isWalletConnected) {
      setError("Please connect your wallet first.");
      return;
    }
    if (!payerAddress || !ethers.isAddress(payerAddress)) {
      setError("Please enter a valid payer address.");
      return;
    }
    if (!requestAmount || isNaN(requestAmount) || Number(requestAmount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    try {
      const contract = await getContract();
      const amountInWei = ethers.parseEther(requestAmount);
      const tx = await contract.requestPayment(payerAddress, amountInWei);
      await tx.wait();
      alert("Payment request created successfully!");
      clearInput();
    } catch (error) {
      console.error("Error requesting payment:", error);
      alert("Error requesting payment: " + error.message);
    }
  };

  return (
    <div className="App">
      <h1>Blockchain Transaction Logger</h1>
      <div className="wallet-status">
        {isWalletConnected ? (
          <div className="connected">
            <span>Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
            <button onClick={handleDisconnectWallet} className="disconnect-button">
              Disconnect
            </button>
          </div>
        ) : (
          <button onClick={handleConnectWallet}>Connect Wallet</button>
        )}
      </div>
      
      <div className="send-ether-form">
        <h2>Send Ether</h2>
        <input
          type="text"
          value={receiverAddress}
          onChange={handleInputChange}
          placeholder="Enter receiver's address (0x...)"
          className="address-input"
          disabled={!isWalletConnected}
        />
        <input
          type="number"
          value={sendAmount}
          onChange={handleSendAmountChange}
          placeholder="Amount in ETH"
          className="address-input"
          disabled={!isWalletConnected}
          step="0.001" // Allows decimal input
        />
        <div className="button-group">
          <button onClick={sendEther} disabled={!isWalletConnected}>
            Send ETH
          </button>
          <button onClick={clearInput} className="clear-button" disabled={!isWalletConnected}>
            Clear
          </button>
        </div>
      </div>

      <div className="send-ether-form">
        <h2>Request Payment</h2>
        <input
          type="text"
          value={payerAddress}
          onChange={handlePayerChange}
          placeholder="Enter payer's address (0x...)"
          className="address-input"
          disabled={!isWalletConnected}
        />
        <input
          type="number"
          value={requestAmount}
          onChange={handleAmountChange}
          placeholder="Amount in ETH"
          className="address-input"
          disabled={!isWalletConnected}
          step="0.001"
        />
        <div className="button-group">
          <button onClick={requestPayment} disabled={!isWalletConnected}>
            Request Payment
          </button>
          <button onClick={clearInput} className="clear-button" disabled={!isWalletConnected}>
            Clear
          </button>
        </div>
        {error && <div className="error">{error}</div>}
      </div>

      <TransactionList isWalletConnected={isWalletConnected} />
      <PaymentRequestList 
        isWalletConnected={isWalletConnected} 
        walletAddress={walletAddress}
      />
    </div>
  );
};

export default App;