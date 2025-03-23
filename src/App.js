import React, { useState } from "react";
import TransactionList from "./TransactionList";
import { ethers } from "ethers";
import { getContract } from "./ethereum";
import "./App.css";

const App = () => {
  const [receiverAddress, setReceiverAddress] = useState("");
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    setReceiverAddress(e.target.value);
    setError(null);
  };

  const clearInput = () => {
    setReceiverAddress("");
    setError(null);
  };

  const sendEther = async () => {
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
      <div className="send-ether-form">
        <input
          type="text"
          value={receiverAddress}
          onChange={handleInputChange}
          placeholder="Enter receiver's address (0x...)"
          className="address-input"
        />
        <div className="button-group">
          <button onClick={sendEther}>Send 0.01 ETH</button>
          <button onClick={clearInput} className="clear-button">Clear</button>
        </div>
        {error && <div className="error">{error}</div>}
      </div>
      <TransactionList />
    </div>
  );
};

export default App;