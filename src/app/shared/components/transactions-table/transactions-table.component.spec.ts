import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Transaction } from '@core/models/transaction.model';
import { TransactionsTableComponent } from './transactions-table.component';

function makeTransactions(count: number): Transaction[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `T${index + 1}`,
    accountId: 'A1001',
    date: `2025-12-${`${index + 1}`.padStart(2, '0')}`,
    type: index % 2 === 0 ? 'Debit' : 'Credit',
    amount: (index + 1) * 10,
    merchant: `Merchant ${index + 1}`,
    category: 'Groceries',
  }));
}

describe('TransactionsTableComponent', () => {
  let fixture: ComponentFixture<TransactionsTableComponent>;
  let component: TransactionsTableComponent;

  function render(transactions: Transaction[], currency = 'EGP'): void {
    fixture = TestBed.createComponent(TransactionsTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('transactions', transactions);
    fixture.componentRef.setInput('currency', currency);
    fixture.detectChanges();
  }

  function bodyRows(): HTMLElement[] {
    return fixture.debugElement.queryAll(By.css('tr.clickable')).map((row) => row.nativeElement);
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TransactionsTableComponent] });
  });

  it('paginates at ten rows and offers 10 / 20 / 50', () => {
    render(makeTransactions(25));

    expect(component.rowsPerPage).toBe(10);
    expect(bodyRows()).toHaveLength(10);
  });

  it('renders every row when there are fewer than one page', () => {
    render(makeTransactions(3));

    expect(bodyRows()).toHaveLength(3);
  });

  it('emits the clicked transaction', () => {
    render(makeTransactions(3));

    let clicked: Transaction | undefined;
    component.rowClick.subscribe((transaction) => (clicked = transaction));

    bodyRows()[1].click();

    expect(clicked?.id).toBe('T2');
  });

  it('shows the supplied empty message', () => {
    fixture = TestBed.createComponent(TransactionsTableComponent);
    fixture.componentRef.setInput('transactions', []);
    fixture.componentRef.setInput('emptyMessage', 'Nothing here.');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Nothing here.');
  });

  it('renders the currency it is given', () => {
    render(makeTransactions(1), 'USD');

    expect(fixture.nativeElement.textContent).toContain('USD');
  });
});
