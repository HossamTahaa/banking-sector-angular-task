export type AccountStatus = 'Active' | 'Inactive';

export interface Account {
  id: string;
  customerId: string;
  type: string;
  currency: string;
  balance: number;
  iban: string;
  status: AccountStatus;
}
