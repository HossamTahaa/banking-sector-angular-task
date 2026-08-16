import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Account } from '@core/models/account.model';
import { TransactionStoreService } from '@core/services/transaction-store.service';
import { TransactionCreateComponent } from './transaction-create.component';

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

function yesterday(): Date {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date;
}

describe('TransactionCreateComponent', () => {
  let fixture: ComponentFixture<TransactionCreateComponent>;
  let component: TransactionCreateComponent;
  let store: TransactionStoreService;

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('bank_transactions', JSON.stringify([]));
    localStorage.setItem('bank_balances', JSON.stringify(accounts));

    TestBed.configureTestingModule({
      imports: [TransactionCreateComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        MessageService,
      ],
    });

    fixture = TestBed.createComponent(TransactionCreateComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('cif', 'C001');
    fixture.componentRef.setInput('accountId', 'A1001');
    fixture.detectChanges();

    const http = TestBed.inject(HttpTestingController);
    http.expectOne('assets/mock/transaction-types.json').flush([
      { code: 'Debit', label: 'Debit' },
      { code: 'Credit', label: 'Credit' },
    ]);
    http.expectOne('assets/mock/transaction-categories.json').flush(['Groceries', 'Income']);

    store = TestBed.inject(TransactionStoreService);
  });

  function fillValidDebit(amount: number): void {
    component.form.setValue({
      type: 'Debit',
      amount,
      date: yesterday(),
      merchant: 'Carrefour',
      category: 'Groceries',
    });
  }

  it('starts invalid and with the save button disabled', () => {
    expect(component.form.invalid).toBe(true);
    expect(component.saveDisabled()).toBe(true);
  });

  it('blocks a debit larger than the account balance', () => {
    fillValidDebit(1500);

    expect(component.form.hasError('debitExceedsBalance')).toBe(true);
    expect(component.saveDisabled()).toBe(true);
  });

  it('surfaces the cross-field message once the form is touched', () => {
    fillValidDebit(1500);
    component.form.markAllAsTouched();

    expect(component.balanceError()).toContain('1000.00');
  });

  it('does not add anything while the form is invalid', () => {
    fillValidDebit(1500);
    component.submit();

    expect(store.transactions()).toHaveLength(0);
    expect(store.getAccountBalance('A1001')).toBe(1000);
  });

  it('adds a valid debit and lowers the balance', () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fillValidDebit(250.5);
    expect(component.form.valid).toBe(true);

    component.submit();

    expect(store.transactions()).toHaveLength(1);
    expect(store.getAccountBalance('A1001')).toBe(749.5);
    expect(navigate).toHaveBeenCalledWith([
      '/customers',
      'C001',
      'accounts',
      'A1001',
      'transactions',
    ]);
  });

  it('adds a credit and raises the balance', () => {
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    component.form.setValue({
      type: 'Credit',
      amount: 500,
      date: yesterday(),
      merchant: 'Company Salary',
      category: 'Income',
    });
    component.submit();

    expect(store.getAccountBalance('A1001')).toBe(1500);
  });

  it('persists the new transaction so it survives a refresh', () => {
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fillValidDebit(100);
    component.submit();

    const saved = JSON.parse(localStorage.getItem('bank_transactions') ?? '[]');
    const savedAccounts = JSON.parse(localStorage.getItem('bank_balances') ?? '[]');

    expect(saved).toHaveLength(1);
    expect(savedAccounts[0].balance).toBe(900);
  });
});
