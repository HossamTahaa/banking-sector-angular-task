import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Account } from '@core/models/account.model';
import { Transaction } from '@core/models/transaction.model';
import { TransactionStoreService } from './transaction-store.service';

const seedAccounts: Account[] = [
  {
    id: 'A1001',
    customerId: 'C001',
    type: 'Current',
    currency: 'EGP',
    balance: 1000,
    iban: 'EG1',
    status: 'Active',
  },
];

const seedTransactions: Transaction[] = [
  {
    id: 'T1',
    accountId: 'A1001',
    date: '2025-12-01',
    type: 'Debit',
    amount: 100,
    merchant: 'Carrefour',
    category: 'Groceries',
  },
  {
    id: 'T2',
    accountId: 'A2002',
    date: '2025-12-02',
    type: 'Credit',
    amount: 50,
    merchant: 'Salary',
    category: 'Income',
  },
];

describe('TransactionStoreService', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  function createSeededStore(): TransactionStoreService {
    const store = TestBed.inject(TransactionStoreService);
    http.expectOne('assets/mock/transactions.json').flush(seedTransactions);
    http.expectOne('assets/mock/accounts.json').flush(seedAccounts);
    return store;
  }

  it('seeds from the static files and persists that initial state', () => {
    const store = createSeededStore();

    expect(store.transactions()).toEqual(seedTransactions);
    expect(store.accounts()).toEqual(seedAccounts);
    expect(JSON.parse(localStorage.getItem('bank_transactions') ?? '')).toEqual(seedTransactions);
    expect(JSON.parse(localStorage.getItem('bank_balances') ?? '')).toEqual(seedAccounts);
  });

  it('restores saved state without re-reading the static files', () => {
    localStorage.setItem('bank_transactions', JSON.stringify(seedTransactions));
    localStorage.setItem('bank_balances', JSON.stringify(seedAccounts));

    const store = TestBed.inject(TransactionStoreService);

    expect(store.transactions()).toEqual(seedTransactions);
    http.verify();
  });

  it('returns only the transactions for the requested account', () => {
    const store = createSeededStore();

    expect(store.getTransactionsByAccount('A1001').map((entry) => entry.id)).toEqual(['T1']);
  });

  it('reports the current balance of an account', () => {
    const store = createSeededStore();

    expect(store.getAccountBalance('A1001')).toBe(1000);
    expect(store.getAccountBalance('missing')).toBe(0);
  });

  it('subtracts a debit from the account balance and persists', () => {
    const store = createSeededStore();

    store.addTransaction({
      accountId: 'A1001',
      date: '2025-12-06',
      type: 'Debit',
      amount: 250.5,
      merchant: 'Amazon',
      category: 'Shopping',
    });

    expect(store.getAccountBalance('A1001')).toBe(749.5);
    expect(store.getTransactionsByAccount('A1001')).toHaveLength(2);

    const persisted = JSON.parse(localStorage.getItem('bank_balances') ?? '') as Account[];
    expect(persisted[0].balance).toBe(749.5);
  });

  it('adds a credit to the account balance', () => {
    const store = createSeededStore();

    store.addTransaction({
      accountId: 'A1001',
      date: '2025-12-06',
      type: 'Credit',
      amount: 500,
      merchant: 'Company Salary',
      category: 'Income',
    });

    expect(store.getAccountBalance('A1001')).toBe(1500);
  });

  it('leaves other accounts untouched when adding a transaction', () => {
    const store = createSeededStore();

    store.addTransaction({
      accountId: 'A9999',
      date: '2025-12-06',
      type: 'Debit',
      amount: 75,
      merchant: 'Unknown',
      category: 'Fees',
    });

    expect(store.getAccountBalance('A1001')).toBe(1000);
    expect(store.transactions()).toHaveLength(3);
  });
});
