import React, { useState, useEffect } from "react";
import TransactionList from "./TransactionList";
import { ethers } from "ethers";
import { getContract, connectWallet, isConnected, getSigner } from "./ethereum";
import "./App.css";

const App = () => {
  const [receiverAddress, setReceiverAddress] = useState("");
  const [error, setError] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  // Check if wallet is already connected on mount
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
    setError(null); // Clear any errors
  };

  const handleInputChange = (e) => {
    setReceiverAddress(e.target.value);
    setError(null);
  };

  const clearInput = () => {
    setReceiverAddress("");
    setError(null);
  };

  const sendEther = async () => {
    if (!isWalletConnected) {
      setError("Please connect your wallet first.");
      return;
    }

    if (!receiverAddress) {
      setError("Please enter a receiver address.");
      return;
    }

    if (!ethers.isAddress(receiverAddress)) {
      setError("Invalid Ethereum address.");
      return;
    }

    try {
      const contract = await getContract();
      console.log("Sending Ether to:", receiverAddress);
      console.log("Contract address:", contract.target);

      const tx = await contract.sendEther(receiverAddress, { value: ethers.parseEther("0.01") });
      console.log("Transaction sent:", tx);
      const receipt = await tx.wait();
      console.log("Transaction mined:", receipt);
      alert("Transaction confirmed!");
      setReceiverAddress("");
    } catch (error) {
      console.error("Error sending Ether:", error);
      alert("Error sending Ether: " + error.message);
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
        <input
          type="text"
          value={receiverAddress}
          onChange={handleInputChange}
          placeholder="Enter receiver's address (0x...)"
          className="address-input"
          disabled={!isWalletConnected}
        />
        <div className="button-group">
          <button onClick={sendEther} disabled={!isWalletConnected}>
            Send 0.01 ETH
          </button>
          <button onClick={clearInput} className="clear-button" disabled={!isWalletConnected}>
            Clear
          </button>
        </div>
        {error && <div className="error">{error}</div>}
      </div>
      <TransactionList isWalletConnected={isWalletConnected} />
    </div>
  );
};

export default App;