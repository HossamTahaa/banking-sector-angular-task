export type CustomerSegment = 'Retail' | 'Priority' | 'Business';

export type CustomerStatus = 'Active' | 'KYC review' | 'Dormant';

export interface Customer {
  cif: string;
  name: string;
  nationalId: string;
  email: string;
  phone: string;
  segment: CustomerSegment;
  accounts: number;
  status: CustomerStatus;
}
