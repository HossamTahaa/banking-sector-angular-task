import { Injectable } from '@angular/core';
import { Transaction } from '@core/models/transaction.model';

const COLUMNS = ['id', 'date', 'type', 'merchant', 'category', 'amount'] as const;

// Excel only detects UTF-8 from a byte-order mark; without it Arabic merchant names arrive mangled.
const BYTE_ORDER_MARK = '\ufeff';

function escapeCell(value: string | number): string {
  const text = String(value);

  return /["\n\r,]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsv(transactions: Transaction[]): string {
  const rows = transactions.map((transaction) =>
    COLUMNS.map((column) => escapeCell(transaction[column])).join(','),
  );

  return [COLUMNS.join(','), ...rows].join('\r\n');
}

@Injectable({ providedIn: 'root' })
export class ExportService {
  exportTransactions(transactions: Transaction[], fileName: string): void {
    this.download(BYTE_ORDER_MARK + toCsv(transactions), fileName);
  }

  private download(content: string, fileName: string): void {
    const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');

    link.href = url;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(url);
  }
}
