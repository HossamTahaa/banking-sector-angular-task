export type TransactionType = 'Debit' | 'Credit';

export interface Transaction {
  id: string;
  accountId: string;
  date: string;
  type: TransactionType;
  amount: number;
  merchant: string;
  category: string;
}

export type NewTransaction = Omit<Transaction, 'id'>;

export interface TransactionTypeOption {
  code: TransactionType;
  label: string;
}
