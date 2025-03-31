import React, { useState, useEffect } from "react";
import TransactionList from "./TransactionList";
import ProposalList from "./ProposalList";
import { ethers } from "ethers";
import { getContract, connectWallet, isConnected, getProvider, getSigner } from "./ethereum";
import "./App.css";

const App = () => {
  const [contributionAmount, setContributionAmount] = useState("");
  const [proposalDesc, setProposalDesc] = useState("");
  const [proposalAmount, setProposalAmount] = useState("");
  const [voteProposalId, setVoteProposalId] = useState("");
  const [executeProposalId, setExecuteProposalId] = useState("");
  const [error, setError] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [activeSection, setActiveSection] = useState("contribute");
  const [contractBalance, setContractBalance] = useState("0");
  const [proposalDetails, setProposalDetails] = useState(null);
  const [totalTokenSupply, setTotalTokenSupply] = useState(0);
  const VOTE_THRESHOLD = 0.5; // 50% of totalTokenSupply must vote

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

  useEffect(() => {
    const fetchContractBalance = async () => {
      if (isWalletConnected) {
        try {
          const provider = await getProvider();
          const contract = await getContract();
          const balance = await provider.getBalance(contract.target);
          setContractBalance(ethers.formatEther(balance));
          const supply = Number(await contract.totalTokenSupply());
          setTotalTokenSupply(supply);
        } catch (err) {
          console.error("Error fetching contract balance or total supply:", err);
        }
      }
    };
    fetchContractBalance();
  }, [isWalletConnected]);

  useEffect(() => {
    const fetchProposalDetails = async () => {
      if (isWalletConnected && executeProposalId && !isNaN(executeProposalId)) {
        try {
          const contract = await getContract();
          const proposal = await contract.proposals(executeProposalId);
          setProposalDetails({
            voteCount: Number(proposal.voteCount),
            executed: proposal.executed,
            requiredVotes: Math.ceil(totalTokenSupply * VOTE_THRESHOLD),
          });
        } catch (err) {
          console.error("Error fetching proposal details:", err);
          setProposalDetails(null);
        }
      } else {
        setProposalDetails(null);
      }
    };
    fetchProposalDetails();
  }, [isWalletConnected, executeProposalId, totalTokenSupply]);

  const handleConnectWallet = async () => {
    try {
      const address = await connectWallet();
      setWalletAddress(address);
      setIsWalletConnected(true);
    } catch (error) {
      setError("Failed to connect wallet: " + error.message);
    }
  };

  const handleDisconnectWallet = () => {
    setWalletAddress(null);
    setIsWalletConnected(false);
    setError(null);
    setContractBalance("0");
    setProposalDetails(null);
  };

  const contribute = async () => {
    if (!contributionAmount || isNaN(contributionAmount) || Number(contributionAmount) <= 0) {
      setError("Please enter a valid contribution amount.");
      return;
    }
    try {
      const contract = await getContract();
      const amountInWei = ethers.parseEther(contributionAmount);
      const tx = await contract.contribute({ value: amountInWei });
      await tx.wait();
      alert("Contribution successful!");
      setContributionAmount("");
      // Refresh contract balance
      const provider = await getProvider();
      const balance = await provider.getBalance(contract.target);
      setContractBalance(ethers.formatEther(balance));
    } catch (error) {
      setError("Error contributing: " + error.message);
      console.error(error);
    }
  };

  const createProposal = async () => {
    if (!proposalDesc || !proposalAmount || isNaN(proposalAmount) || Number(proposalAmount) <= 0) {
      setError("Please enter a valid description and amount.");
      return;
    }
    if (Number(proposalAmount) > Number(contractBalance)) {
      setError("Requested amount exceeds contract balance.");
      return;
    }
    try {
      const contract = await getContract();
      const amountInWei = ethers.parseEther(proposalAmount);
      const tx = await contract.createProposal(proposalDesc, amountInWei);
      await tx.wait();
      alert("Proposal created successfully!");
      setProposalDesc("");
      setProposalAmount("");
    } catch (error) {
      setError("Error creating proposal: " + error.message);
      console.error(error);
    }
  };

  const vote = async () => {
    if (!voteProposalId || isNaN(voteProposalId)) {
      setError("Please enter a valid proposal ID.");
      return;
    }
    try {
      const contract = await getContract();
      const tx = await contract.vote(voteProposalId);
      await tx.wait();
      alert("Vote cast successfully!");
      setVoteProposalId("");
    } catch (error) {
      setError("Error voting: " + error.message);
      console.error(error);
    }
  };

  const executeProposal = async () => {
    if (!executeProposalId || isNaN(executeProposalId)) {
      setError("Please enter a valid proposal ID.");
      return;
    }
    if (!proposalDetails) {
      setError("Unable to fetch proposal details.");
      return;
    }
    if (proposalDetails.executed) {
      setError("Proposal has already been executed.");
      return;
    }
    if (proposalDetails.voteCount < proposalDetails.requiredVotes) {
      setError(`Insufficient votes. Required: ${proposalDetails.requiredVotes}, Current: ${proposalDetails.voteCount}`);
      return;
    }
    try {
      const contract = await getContract();
      const tx = await contract.executeProposal(executeProposalId);
      await tx.wait();
      alert("Proposal executed successfully!");
      setExecuteProposalId("");
      setProposalDetails(null);
      // Refresh contract balance
      const provider = await getProvider();
      const balance = await provider.getBalance(contract.target);
      setContractBalance(ethers.formatEther(balance));
    } catch (error) {
      setError("Error executing proposal: " + error.message);
      console.error(error);
    }
  };

  return (
    <div className="dashboard">
      <nav className="sidebar">
        <div className="sidebar-header">
        <img src="./logo.png" alt="Logo" className="logo " />
          <h2>Charity DAO</h2>
        </div>
        <ul className="nav-list">
          <li className="nav-item">
            <button
              className={activeSection === "contribute" ? "nav-link active" : "nav-link"}
              onClick={() => setActiveSection("contribute")}
            >
              <span>Contribute</span>
            </button>
          </li>
          <li className="nav-item">
            <button
              className={activeSection === "create" ? "nav-link active" : "nav-link"}
              onClick={() => setActiveSection("create")}
            >
              <span>Create Proposal</span>
            </button>
          </li>
          <li className="nav-item">
            <button
              className={activeSection === "vote" ? "nav-link active" : "nav-link"}
              onClick={() => setActiveSection("vote")}
            >
              <span>Vote</span>
            </button>
          </li>
          <li className="nav-item">
            <button
              className={activeSection === "execute" ? "nav-link active" : "nav-link"}
              onClick={() => setActiveSection("execute")}
            >
              <span>Execute Proposal</span>
            </button>
          </li>
 
          <li className="nav-item">
            <button
              className={activeSection === "proposals" ? "nav-link active" : "nav-link"}
              onClick={() => setActiveSection("proposals")}
            >
              <span>Proposals</span>
            </button>
          </li>
        </ul>
      </nav>

      <div className="navbar">
        <span className="navbar-title">Charity DAO Dashboard</span>
        {isWalletConnected && (
          <div className="connected">
            <span>{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
            <button onClick={handleDisconnectWallet} className="disconnect-button">
              Disconnect
            </button>
          </div>
        )}
      </div>

      <main className="main-content">
        {!isWalletConnected && (
          <div className="content-section">
            <h1>Welcome to Charity DAO</h1>
            <button onClick={handleConnectWallet}>Connect Wallet</button>
          </div>
        )}

        {activeSection === "contribute" && isWalletConnected && (
          <div className="content-section">
            <h2>Contribute to Charity DAO</h2>
            <div className="send-ether-form">
              <input
                type="number"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
                placeholder="Amount in ETH"
                className="address-input"
                step="0.001"
              />
              <button onClick={contribute}>Contribute</button>
              {error && <div className="error">{error}</div>}
            </div>
          </div>
        )}

        {activeSection === "create" && isWalletConnected && (
          <div className="content-section">
            <h2>Create Proposal</h2>
            <p>Contract Balance: {contractBalance} ETH</p>
            <div className="send-ether-form">
              <input
                type="text"
                value={proposalDesc}
                onChange={(e) => setProposalDesc(e.target.value)}
                placeholder="Proposal description"
                className="address-input"
              />
              <input
                type="number"
                value={proposalAmount}
                onChange={(e) => setProposalAmount(e.target.value)}
                placeholder="Amount in ETH"
                className="address-input"
                step="0.001"
              />
              <button onClick={createProposal}>Create Proposal</button>
              {error && <div className="error">{error}</div>}
            </div>
          </div>
        )}

        {activeSection === "vote" && isWalletConnected && (
          <div className="content-section">
            <h2>Vote on Proposal</h2>
            <div className="send-ether-form">
              <input
                type="number"
                value={voteProposalId}
                onChange={(e) => setVoteProposalId(e.target.value)}
                placeholder="Proposal ID"
                className="address-input"
              />
              <button onClick={vote}>Vote</button>
              {error && <div className="error">{error}</div>}
            </div>
          </div>
        )}

        {activeSection === "execute" && isWalletConnected && (
          <div className="content-section">
            <h2>Execute Proposal</h2>
            <div className="send-ether-form">
              <input
                type="number"
                value={executeProposalId}
                onChange={(e) => setExecuteProposalId(e.target.value)}
                placeholder="Proposal ID"
                className="address-input"
              />
              {proposalDetails && (
                <div>
                  <p>Current Votes: {proposalDetails.voteCount}</p>
                  <p>Required Votes: {proposalDetails.requiredVotes} (50% of total tokens)</p>
                </div>
              )}
              <button
                onClick={executeProposal}
                disabled={
                  !proposalDetails ||
                  proposalDetails.executed ||
                  proposalDetails.voteCount < proposalDetails.requiredVotes
                }
              >
                Execute
              </button>
              {error && <div className="error">{error}</div>}
            </div>
          </div>
        )}

        {activeSection === "transactions" && isWalletConnected && (
          <div className="content-section">
            <TransactionList isWalletConnected={isWalletConnected} />
          </div>
        )}

        {activeSection === "proposals" && isWalletConnected && (
          <div className="content-section">
            <ProposalList isWalletConnected={isWalletConnected} walletAddress={walletAddress} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;