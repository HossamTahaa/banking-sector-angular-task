import { Injectable, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Account } from '@core/models/account.model';
import { CategoryTotal, MonthlySummary } from '@core/models/monthly-summary.model';
import { NewTransaction, Transaction } from '@core/models/transaction.model';
import { AccountService } from './account.service';
import { LocalStorageService } from './local-storage.service';
import { TransactionService } from './transaction.service';

const TRANSACTIONS_KEY = 'bank_transactions';
const BALANCES_KEY = 'bank_balances';

// Dates are stored as YYYY-MM-DD, so the first seven characters are the month key.
const MONTH_LENGTH = 7;

function sumAmount(transactions: Transaction[]): number {
  return transactions.reduce((total, transaction) => total + transaction.amount, 0);
}

function topSpendingCategory(transactions: Transaction[]): CategoryTotal | null {
  const totals = new Map<string, number>();

  for (const transaction of transactions) {
    if (transaction.type !== 'Debit') continue;

    totals.set(transaction.category, (totals.get(transaction.category) ?? 0) + transaction.amount);
  }

  let top: CategoryTotal | null = null;

  for (const [category, total] of totals) {
    if (!top || total > top.total) top = { category, total };
  }

  return top;
}

@Injectable({ providedIn: 'root' })
export class TransactionStoreService {
  private readonly storage = inject(LocalStorageService);
  private readonly transactionService = inject(TransactionService);
  private readonly accountService = inject(AccountService);

  private readonly transactionsState = signal<Transaction[]>([]);
  private readonly accountsState = signal<Account[]>([]);
  private readonly loadingState = signal(true);

  readonly transactions = this.transactionsState.asReadonly();
  readonly accounts = this.accountsState.asReadonly();
  readonly loading = this.loadingState.asReadonly();

  constructor() {
    const savedTransactions = this.storage.get<Transaction[]>(TRANSACTIONS_KEY);
    const savedAccounts = this.storage.get<Account[]>(BALANCES_KEY);

    if (savedTransactions && savedAccounts) {
      this.transactionsState.set(savedTransactions);
      this.accountsState.set(savedAccounts);
      this.loadingState.set(false);
      return;
    }

    this.seedFromFiles();
  }

  getTransactionsByAccount(accountId: string): Transaction[] {
    return this.transactionsState().filter((transaction) => transaction.accountId === accountId);
  }

  // Months that actually have transactions, newest first.
  getTransactionMonths(accountId: string): string[] {
    const months = this.getTransactionsByAccount(accountId).map((transaction) =>
      transaction.date.slice(0, MONTH_LENGTH),
    );

    return [...new Set(months)].sort().reverse();
  }

  getMonthlySummary(accountId: string, month: string): MonthlySummary {
    const monthly = month
      ? this.getTransactionsByAccount(accountId).filter((transaction) =>
          transaction.date.startsWith(month),
        )
      : [];

    const totalCredit = sumAmount(monthly.filter((transaction) => transaction.type === 'Credit'));
    const totalDebit = sumAmount(monthly.filter((transaction) => transaction.type === 'Debit'));

    return {
      totalCredit,
      totalDebit,
      net: totalCredit - totalDebit,
      topCategory: topSpendingCategory(monthly),
    };
  }

  getRecentTransactions(accountId: string, limit: number): Transaction[] {
    return [...this.getTransactionsByAccount(accountId)]
      .sort((first, second) => second.date.localeCompare(first.date))
      .slice(0, limit);
  }

  getAccountsByCustomer(customerId: string): Account[] {
    return this.accountsState().filter((account) => account.customerId === customerId);
  }

  getAccount(accountId: string): Account | undefined {
    return this.accountsState().find((account) => account.id === accountId);
  }

  getAccountBalance(accountId: string): number {
    return this.getAccount(accountId)?.balance ?? 0;
  }

  addTransaction(input: NewTransaction): void {
    const transaction: Transaction = { ...input, id: this.nextTransactionId() };

    this.transactionsState.update((transactions) => [...transactions, transaction]);
    this.accountsState.update((accounts) =>
      accounts.map((account) =>
        account.id === transaction.accountId
          ? { ...account, balance: this.applyToBalance(account.balance, transaction) }
          : account,
      ),
    );

    this.persist();
  }

  private seedFromFiles(): void {
    forkJoin({
      transactions: this.transactionService.getAll(),
      accounts: this.accountService.getAll(),
    }).subscribe({
      next: ({ transactions, accounts }) => {
        this.transactionsState.set(transactions);
        this.accountsState.set(accounts);
        this.persist();
        this.loadingState.set(false);
      },
      error: () => this.loadingState.set(false),
    });
  }

  private applyToBalance(balance: number, transaction: Transaction): number {
    return transaction.type === 'Debit'
      ? balance - transaction.amount
      : balance + transaction.amount;
  }

  // Prefixed so client-side ids never collide with the seeded T#### values.
  private nextTransactionId(): string {
    return `TX-${Date.now()}`;
  }

  private persist(): void {
    this.storage.set(TRANSACTIONS_KEY, this.transactionsState());
    this.storage.set(BALANCES_KEY, this.accountsState());
  }
}
