import React, { useState, useEffect } from "react";
import TransactionList from "./TransactionList";
import PaymentRequestList from "./PaymentRequestList";
import { ethers } from "ethers";
import { getContract, connectWallet, isConnected, getSigner } from "./ethereum";
import { Wallet, Send, FileText, History, LogOut, Menu } from 'lucide-react';

const App = () => {
  const [receiverAddress, setReceiverAddress] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [payerAddress, setPayerAddress] = useState("");
  const [requestAmount, setRequestAmount] = useState("");
  const [error, setError] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [activeSection, setActiveSection] = useState("send");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <div className="min-h-screen bg-gray-900">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center justify-between h-16 px-4 bg-gray-900">
          <span className="text-xl font-bold text-blue-400">ETH Logger</span>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <Menu className="h-6 w-6" />
          </button>
        </div>
        <nav className="mt-8 px-4">
          <button
            onClick={() => setActiveSection("send")}
            className={`flex items-center w-full px-4 py-3 mb-2 rounded-lg transition-colors ${activeSection === "send" ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
          >
            <Send className="h-5 w-5 mr-3" />
            Send ETH
          </button>
          <button
            onClick={() => setActiveSection("request")}
            className={`flex items-center w-full px-4 py-3 mb-2 rounded-lg transition-colors ${activeSection === "request" ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
          >
            <FileText className="h-5 w-5 mr-3" />
            Request Payment
          </button>
          <button
            onClick={() => setActiveSection("transactions")}
            className={`flex items-center w-full px-4 py-3 mb-2 rounded-lg transition-colors ${activeSection === "transactions" ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
          >
            <History className="h-5 w-5 mr-3" />
            Transactions
          </button>
          <button
            onClick={() => setActiveSection("requests")}
            className={`flex items-center w-full px-4 py-3 mb-2 rounded-lg transition-colors ${activeSection === "requests" ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
          >
            <Wallet className="h-5 w-5 mr-3" />
            Payment Requests
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Navigation */}
        <header className="bg-gray-800 shadow-lg">
          <div className="flex items-center justify-between h-16 px-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden text-gray-400 hover:text-white">
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-semibold text-white">Blockchain Transaction Dashboard</h1>
            {isWalletConnected ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-300">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
                <button
                  onClick={handleDisconnectWallet}
                  className="flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </button>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6">
          {!isWalletConnected ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <Wallet className="h-16 w-16 text-blue-500 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">Welcome to ETH Logger</h2>
              <p className="text-gray-400 mb-8">Connect your wallet to start managing transactions</p>
              <button
                onClick={handleConnectWallet}
                className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Connect Wallet
              </button>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {activeSection === "send" && (
                <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                  <h2 className="text-xl font-semibold text-white mb-6">Send Ether</h2>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={receiverAddress}
                      onChange={handleInputChange}
                      placeholder="Enter receiver's address (0x...)"
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      value={sendAmount}
                      onChange={handleSendAmountChange}
                      placeholder="Amount in ETH"
                      step="0.001"
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex space-x-4">
                      <button
                        onClick={sendEther}
                        className="flex-1 px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Send ETH
                      </button>
                      <button
                        onClick={clearInput}
                        className="px-6 py-3 text-white bg-gray-600 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "request" && (
                <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                  <h2 className="text-xl font-semibold text-white mb-6">Request Payment</h2>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={payerAddress}
                      onChange={handlePayerChange}
                      placeholder="Enter payer's address (0x...)"
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      value={requestAmount}
                      onChange={handleAmountChange}
                      placeholder="Amount in ETH"
                      step="0.001"
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex space-x-4">
                      <button
                        onClick={requestPayment}
                        className="flex-1 px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Request Payment
                      </button>
                      <button
                        onClick={clearInput}
                        className="px-6 py-3 text-white bg-gray-600 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "transactions" && (
                <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                  <TransactionList isWalletConnected={isWalletConnected} />
                </div>
              )}

              {activeSection === "requests" && (
                <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                  <PaymentRequestList
                    isWalletConnected={isWalletConnected}
                    walletAddress={walletAddress}
                  />
                </div>
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-900/50 text-red-200 rounded-lg">
                  {error}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;