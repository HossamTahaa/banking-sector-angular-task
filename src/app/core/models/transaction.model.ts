export type TransactionDirection = 'debit' | 'credit';

export interface Transaction {
  id: string;
  accountId: string;
  postedAt: string;
  description: string;
  reference: string;
  direction: TransactionDirection;
  amount: number;
  currency: string;
}
