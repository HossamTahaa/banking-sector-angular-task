export interface CategoryTotal {
  category: string;
  total: number;
}

export interface MonthlySummary {
  totalCredit: number;
  totalDebit: number;
  net: number;
  topCategory: CategoryTotal | null;
}
