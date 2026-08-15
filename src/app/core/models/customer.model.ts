export type CustomerStatus = 'active' | 'dormant' | 'blocked';

export interface Customer {
  cif: string;
  fullName: string;
  nationalId: string;
  phone: string;
  email: string;
  branch: string;
  status: CustomerStatus;
}
