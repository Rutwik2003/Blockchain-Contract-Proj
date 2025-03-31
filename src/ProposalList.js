import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getContract } from "./ethereum";
import { ClipLoader } from "react-spinners";
import "./App.css";

const ProposalList = ({ isWalletConnected, walletAddress }) => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalTokenSupply, setTotalTokenSupply] = useState(0);
  const VOTE_THRESHOLD = 0.5; // Assume 50% of totalTokenSupply must vote to execute

  const fetchProposals = async () => {
    setLoading(true);
    setError(null);
    try {
      const contract = await getContract();
      let count;
      try {
        count = Number(await contract.proposalCount()) || 0;
      } catch (err) {
        throw new Error("Failed to fetch proposal count. Ensure the contract is correctly deployed.");
      }
      console.log("Proposal count:", count);

      // Fetch totalTokenSupply
      const supply = Number(await contract.totalTokenSupply());
      setTotalTokenSupply(supply);

      const proposalArray = [];
      for (let i = 1; i <= count; i++) {
        try {
          const proposal = await contract.proposals(i);
          const hasVoted = await contract.hasVoted(i, walletAddress);
          proposalArray.push({
            id: Number(proposal.id),
            description: proposal.description,
            voteCount: Number(proposal.voteCount),
            executed: proposal.executed,
            proposer: proposal.proposer,
            amount: ethers.formatEther(proposal.amount),
            hasVoted: hasVoted,
            requiredVotes: Math.ceil(supply * VOTE_THRESHOLD), // 50% of totalTokenSupply
          });
        } catch (err) {
          console.error(`Error fetching proposal ${i}:`, err);
          continue; // Skip failed proposals
        }
      }
      setProposals(proposalArray);
      if (proposalArray.length === 0) {
        setError("No proposals found for this contract.");
      }
    } catch (error) {
      setError("Error fetching proposals: " + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isWalletConnected) {
      fetchProposals();
    } else {
      setProposals([]);
      setError("Please connect your wallet to view proposals.");
    }
  }, [isWalletConnected, walletAddress]);

  return (
    <div className="transaction-list">
      <h1>Proposals</h1>
      <button onClick={fetchProposals} disabled={!isWalletConnected}>
        Refresh Proposals
      </button>
      {loading ? (
        <div className="loading">
          <ClipLoader color="#63b3ed" size={40} />
        </div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : proposals.length === 0 ? (
        <div className="no-transactions">No proposals found.</div>
      ) : (
        <ul>
          {proposals.map((proposal) => (
            <li key={proposal.id} className="transaction-item">
              <div><strong>ID:</strong> {proposal.id}</div>
              <div><strong>Description:</strong> {proposal.description}</div>
              <div>
                <strong>Votes:</strong>{" "}
                {proposal.voteCount === 0 ? "No votes cast yet" : proposal.voteCount}
              </div>
              <div>
                <strong>Required Votes:</strong> {proposal.requiredVotes} (50% of total tokens)
              </div>
              <div><strong>Executed:</strong> {proposal.executed ? "Yes" : "No"}</div>
              <div><strong>Proposer:</strong> {proposal.proposer}</div>
              <div><strong>Amount:</strong> {proposal.amount} ETH</div>
              <div>
                <strong>You Voted:</strong> {proposal.hasVoted ? "Yes" : "No"}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProposalList;