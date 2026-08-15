export type AccountType = 'current' | 'savings' | 'deposit';

export type AccountStatus = 'active' | 'frozen' | 'closed';

export interface Account {
  id: string;
  cif: string;
  accountNumber: string;
  iban: string;
  type: AccountType;
  currency: string;
  balance: number;
  status: AccountStatus;
  openedAt: string;
}
