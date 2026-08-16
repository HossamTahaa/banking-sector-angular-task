import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { vi } from 'vitest';
import { Account } from '@core/models/account.model';
import { Transaction } from '@core/models/transaction.model';
import { ExportService } from '@core/services/export.service';
import { TransactionsComponent } from './transactions.component';

const accounts: Account[] = [
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
  {
    id: 'T3',
    accountId: 'A1001',
    date: '2025-12-10',
    type: 'Debit',
    amount: 75.5,
    merchant: 'Amazon',
    category: 'Shopping',
  },
  {
    id: 'T4',
    accountId: 'A1001',
    date: '2025-11-05',
    type: 'Debit',
    amount: 1200,
    merchant: 'Vodafone',
    category: 'Bills',
  },
  {
    id: 'T9',
    accountId: 'A2002',
    date: '2025-12-11',
    type: 'Debit',
    amount: 40,
    merchant: 'Other account',
    category: 'Fees',
  },
];

describe('TransactionsComponent', () => {
  let fixture: ComponentFixture<TransactionsComponent>;
  let component: TransactionsComponent;

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('bank_transactions', JSON.stringify(transactions));
    localStorage.setItem('bank_balances', JSON.stringify(accounts));

    TestBed.configureTestingModule({
      imports: [TransactionsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        MessageService,
      ],
    });

    fixture = TestBed.createComponent(TransactionsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('cif', 'C001');
    fixture.componentRef.setInput('accountId', 'A1001');
    fixture.detectChanges();

    TestBed.inject(HttpTestingController)
      .expectOne('assets/mock/transaction-categories.json')
      .flush(['Groceries', 'Income', 'Shopping']);
  });

  function ids(): string[] {
    return component.rows().map((row) => row.id);
  }

  it('shows only this account, never another account', () => {
    expect(ids()).toEqual(['T1', 'T2', 'T3', 'T4']);
  });

  it('reports the account balance from the store', () => {
    expect(component.balance()).toBe(1000);
    expect(component.account()?.currency).toBe('EGP');
  });

  it('filters by type', () => {
    component.filterForm.patchValue({ type: 'Debit' });

    expect(ids()).toEqual(['T1', 'T3', 'T4']);
  });

  it('filters by category', () => {
    component.filterForm.patchValue({ category: 'Income' });

    expect(ids()).toEqual(['T2']);
  });

  it('filters by an inclusive date range', () => {
    component.filterForm.patchValue({
      dateRange: [new Date(2025, 11, 1), new Date(2025, 11, 10)],
    });

    expect(ids()).toEqual(['T1', 'T3']);
  });

  it('ignores a half-picked date range', () => {
    component.filterForm.patchValue({ dateRange: [new Date(2025, 11, 5)] });

    expect(ids()).toEqual(['T1', 'T2', 'T3', 'T4']);
  });

  it('combines type and date filters', () => {
    component.filterForm.patchValue({
      type: 'Debit',
      dateRange: [new Date(2025, 11, 9), new Date(2025, 11, 31)],
    });

    expect(ids()).toEqual(['T3']);
  });

  it('offers All plus the categories from the lookup file', () => {
    expect(component.categoryOptions()).toEqual(['All', 'Groceries', 'Income', 'Shopping']);
  });

  it('shows the five most recent transactions newest first by default', () => {
    expect(component.statementSize()).toBe(5);
    expect(component.recentTransactions().map((item) => item.id)).toEqual(['T2', 'T3', 'T1', 'T4']);
  });

  it('caps the mini statement at the chosen size', () => {
    component.statementSizeControl.setValue(2);

    expect(component.recentTransactions().map((item) => item.id)).toEqual(['T2', 'T3']);
  });

  it('keeps the mini statement independent of the table filters', () => {
    component.filterForm.patchValue({ type: 'Credit' });

    expect(ids()).toEqual(['T2']);
    expect(component.recentTransactions()).toHaveLength(4);
  });

  it('disables export only when nothing is shown', () => {
    expect(component.exportDisabled()).toBe(false);

    component.filterForm.patchValue({ category: 'Nothing matches this' });

    expect(ids()).toEqual([]);
    expect(component.exportDisabled()).toBe(true);
  });

  it('exports the filtered rows under an account-specific file name', () => {
    const exportService = TestBed.inject(ExportService);
    const exportTransactions = vi
      .spyOn(exportService, 'exportTransactions')
      .mockImplementation(() => undefined);

    component.filterForm.patchValue({ type: 'Debit' });
    component.exportCsv();

    expect(exportTransactions).toHaveBeenCalledWith(component.rows(), 'transactions-A1001.csv');
    expect(exportTransactions.mock.calls[0][0].map((row) => row.id)).toEqual(['T1', 'T3', 'T4']);
  });

  it('offers only months that have transactions, newest first', () => {
    expect(component.monthOptions()).toEqual([
      { label: 'December 2025', value: '2025-12' },
      { label: 'November 2025', value: '2025-11' },
    ]);
  });

  it('defaults to the most recent month', () => {
    expect(component.selectedMonth()).toBe('2025-12');
  });

  it('totals credit, debit and net for the selected month', () => {
    const insights = component.insights();

    expect(insights.totalCredit).toBe(8500);
    expect(insights.totalDebit).toBe(326.25);
    expect(insights.net).toBe(8173.75);
  });

  it('picks the top spending category from debits only', () => {
    expect(component.insights().topCategory).toEqual({ category: 'Groceries', total: 250.75 });
  });

  it('recalculates when another month is chosen', () => {
    component.monthControl.setValue('2025-11');
    const insights = component.insights();

    expect(insights.totalCredit).toBe(0);
    expect(insights.totalDebit).toBe(1200);
    expect(insights.net).toBe(-1200);
    expect(insights.topCategory).toEqual({ category: 'Bills', total: 1200 });
  });

  it('reports zeros and no top category for a month with nothing in it', () => {
    component.monthControl.setValue('2024-01');
    const insights = component.insights();

    expect(insights.totalCredit).toBe(0);
    expect(insights.totalDebit).toBe(0);
    expect(insights.net).toBe(0);
    expect(insights.topCategory).toBeNull();
  });

  it('keeps the detail dialog closed until a row is clicked', () => {
    expect(component.detailVisible()).toBe(false);
    expect(component.selectedTransaction()).toBeNull();
  });

  it('opens the detail dialog for the clicked transaction', () => {
    component.openDetail(transactions[0]);

    expect(component.detailVisible()).toBe(true);
    expect(component.selectedTransaction()?.id).toBe('T1');
  });

  it('clears the selection when the dialog closes', () => {
    component.openDetail(transactions[0]);
    component.closeDetail();

    expect(component.detailVisible()).toBe(false);
    expect(component.selectedTransaction()).toBeNull();
  });

  it('restores the full list after a reset', () => {
    component.filterForm.patchValue({ type: 'Credit' });
    expect(ids()).toEqual(['T2']);

    component.resetFilters();
    expect(ids()).toEqual(['T1', 'T2', 'T3', 'T4']);
  });
});
