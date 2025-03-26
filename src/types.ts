export interface Transaction {
  sender: string;
  receiver: string;
  amount: bigint;
  gasUsed: bigint;
  timestamp: bigint;
  txHash: string;
  blockNumber: bigint;
}

export interface PaymentRequest {
  requester: string;
  payer: string;
  amount: bigint;
  fulfilled: boolean;
  timestamp: bigint;
  requestHash: string;
}

export interface TransactionListProps {
  isWalletConnected: boolean;
}

export interface PaymentRequestListProps {
  isWalletConnected: boolean;
  walletAddress: string | null;
}