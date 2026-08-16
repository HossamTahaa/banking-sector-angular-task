import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { Transaction } from '@core/models/transaction.model';
import { ExportService } from './export.service';

const transactions: Transaction[] = [
  {
    id: 'T1',
    accountId: 'A1001',
    date: '2025-12-01',
    type: 'Debit',
    amount: 250.75,
    merchant: 'Carrefour',
    category: 'Groceries',
  },
  {
    id: 'T2',
    accountId: 'A1001',
    date: '2025-12-25',
    type: 'Credit',
    amount: 8500,
    merchant: 'Company Salary',
    category: 'Income',
  },
];

describe('ExportService', () => {
  let service: ExportService;
  let link: { href: string; download: string; click: ReturnType<typeof vi.fn> };
  let blobs: Blob[];

  beforeEach(() => {
    blobs = [];
    link = { href: '', download: '', click: vi.fn() };

    URL.createObjectURL = vi.fn((blob: Blob) => {
      blobs.push(blob);
      return 'blob:mock';
    });
    URL.revokeObjectURL = vi.fn();

    vi.spyOn(document, 'createElement').mockReturnValue(link as unknown as HTMLAnchorElement);

    TestBed.configureTestingModule({});
    service = TestBed.inject(ExportService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Blob.text() decodes as UTF-8, which strips a leading BOM, so the mark is asserted on the bytes.
  async function exportedCsv(rows: Transaction[]): Promise<string> {
    service.exportTransactions(rows, 'transactions.csv');
    return blobs[0].text();
  }

  it('writes the header row and one line per transaction', async () => {
    const csv = await exportedCsv(transactions);
    const lines = csv.split('\r\n');

    expect(lines[0]).toBe('id,date,type,merchant,category,amount');
    expect(lines[1]).toBe('T1,2025-12-01,Debit,Carrefour,Groceries,250.75');
    expect(lines[2]).toBe('T2,2025-12-25,Credit,Company Salary,Income,8500');
    expect(lines).toHaveLength(3);
  });

  it('starts with a byte-order mark so Excel reads it as UTF-8', async () => {
    service.exportTransactions(transactions, 'transactions.csv');
    const bytes = new Uint8Array(await blobs[0].arrayBuffer());

    expect([bytes[0], bytes[1], bytes[2]]).toEqual([0xef, 0xbb, 0xbf]);
  });

  it('quotes cells containing a comma or quote', async () => {
    const csv = await exportedCsv([
      { ...transactions[0], merchant: 'Metro, Nasr City', category: 'Say "hi"' },
    ]);

    expect(csv).toContain('"Metro, Nasr City"');
    expect(csv).toContain('"Say ""hi"""');
  });

  it('still writes a header when there is nothing to export', async () => {
    const csv = await exportedCsv([]);

    expect(csv).toBe('id,date,type,merchant,category,amount');
  });

  it('downloads under the given file name and releases the object url', () => {
    service.exportTransactions(transactions, 'transactions-A1001.csv');

    expect(link.download).toBe('transactions-A1001.csv');
    expect(link.href).toBe('blob:mock');
    expect(link.click).toHaveBeenCalledOnce();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock');
  });
});
