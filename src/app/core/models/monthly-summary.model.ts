export interface CategoryTotal {
  category: string;
  total: number;
}

export interface MonthlySummary {
  totalCredit: number;
  totalDebit: number;
  net: number;
  // Null when the month has no debits at all, which the card renders as a dash.
  topCategory: CategoryTotal | null;
}
