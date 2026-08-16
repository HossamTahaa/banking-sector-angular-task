import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { combineLatest, map, startWith } from 'rxjs';
import { ButtonDirective } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Transaction } from '@core/models/transaction.model';
import { ExportService } from '@core/services/export.service';
import { TransactionService } from '@core/services/transaction.service';
import { TransactionStoreService } from '@core/services/transaction-store.service';
import { MainLayoutComponent } from '@layouts/main-layout/main-layout.component';
import { TransactionsTableComponent } from '@shared/components/transactions-table/transactions-table.component';

const ALL = 'All';
const DEFAULT_STATEMENT_SIZE = 5;

interface Filters {
  search: string;
  dateRange: Date[] | null;
  type: string;
  category: string;
}

function withinDateRange(transaction: Transaction, range: Date[] | null): boolean {
  const [from, to] = range ?? [];
  if (!from || !to) return true;

  return transaction.date >= toIsoDate(from) && transaction.date <= toIsoDate(to);
}

function matchesFilters(transaction: Transaction, filters: Filters): boolean {
  const search = filters.search.trim().toLowerCase();

  if (search && !transaction.merchant.toLowerCase().includes(search)) return false;
  if (filters.type !== ALL && transaction.type !== filters.type) return false;
  if (filters.category !== ALL && transaction.category !== filters.category) return false;

  return withinDateRange(transaction, filters.dateRange);
}

// "2025-12" reads as "December 2025" in the month dropdown.
function formatMonthLabel(month: string): string {
  const [year, monthNumber] = month.split('-').map(Number);

  return new Date(year, monthNumber - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

// Local calendar parts, so a picked day never shifts across the UTC boundary.
function toIsoDate(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${date.getFullYear()}-${month}-${day}`;
}

@Component({
  selector: 'app-transactions',
  imports: [
    MainLayoutComponent,
    ReactiveFormsModule,
    RouterLink,
    DatePipe,
    DecimalPipe,
    DatePicker,
    InputText,
    Select,
    Dialog,
    TransactionsTableComponent,
    ButtonDirective,
  ],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionsComponent {
  readonly cif = input.required<string>();
  readonly accountId = input.required<string>();

  private readonly formBuilder = inject(FormBuilder);
  private readonly store = inject(TransactionStoreService);
  private readonly transactionService = inject(TransactionService);
  private readonly exportService = inject(ExportService);

  readonly loading = this.store.loading;
  readonly account = computed(() => this.store.getAccount(this.accountId()));
  readonly balance = computed(() => this.store.getAccountBalance(this.accountId()));

  readonly createLink = computed(() => [
    '/customers',
    this.cif(),
    'accounts',
    this.accountId(),
    'transactions',
    'new',
  ]);

  readonly customerLink = computed(() => ['/customers', this.cif()]);

  readonly filterForm = this.formBuilder.group({
    search: this.formBuilder.nonNullable.control(''),
    dateRange: this.formBuilder.control<Date[] | null>(null),
    type: this.formBuilder.nonNullable.control(ALL),
    category: this.formBuilder.nonNullable.control(ALL),
  });

  readonly typeOptions = [
    { label: 'All types', value: ALL },
    { label: 'Debit', value: 'Debit' },
    { label: 'Credit', value: 'Credit' },
  ];

  private readonly categories = rxResource({
    stream: () => this.transactionService.getCategories(),
    defaultValue: [],
  });

  readonly categoryOptions = computed(() => [ALL, ...this.categories.value()]);

  private readonly accountTransactions = computed(() =>
    this.store.getTransactionsByAccount(this.accountId()),
  );

  readonly rows = toSignal(
    combineLatest([
      toObservable(this.accountTransactions),
      this.filterForm.valueChanges.pipe(
        startWith(null),
        map(() => this.filterForm.getRawValue()),
      ),
    ]).pipe(
      map(([transactions, filters]) =>
        transactions.filter((transaction) => matchesFilters(transaction, filters)),
      ),
    ),
    { initialValue: [] as Transaction[] },
  );

  readonly statementSizeOptions = [5, 10, 20];

  // A control rather than a plain signal, so the dropdown stays on Reactive Forms like the filters.
  readonly statementSizeControl = this.formBuilder.nonNullable.control(DEFAULT_STATEMENT_SIZE);

  readonly statementSize = toSignal(this.statementSizeControl.valueChanges, {
    initialValue: DEFAULT_STATEMENT_SIZE,
  });

  readonly recentTransactions = computed(() =>
    this.store.getRecentTransactions(this.accountId(), this.statementSize()),
  );

  readonly exportDisabled = computed(() => this.rows().length === 0);

  readonly monthOptions = computed(() =>
    this.store.getTransactionMonths(this.accountId()).map((month) => ({
      label: formatMonthLabel(month),
      value: month,
    })),
  );

  readonly monthControl = this.formBuilder.nonNullable.control('');

  private readonly pickedMonth = toSignal(this.monthControl.valueChanges, { initialValue: '' });

  // Falls back to the newest month so the card is right on first paint, before the effect below has
  // had a chance to show that month in the dropdown.
  readonly selectedMonth = computed(
    () => this.pickedMonth() || this.monthOptions()[0]?.value || '',
  );

  readonly insights = computed(() =>
    this.store.getMonthlySummary(this.accountId(), this.selectedMonth()),
  );

  constructor() {
    effect(() => {
      const [newest] = this.monthOptions();
      if (newest && !this.monthControl.value) this.monthControl.setValue(newest.value);
    });
  }

  readonly selectedTransaction = signal<Transaction | null>(null);

  readonly detailVisible = computed(() => this.selectedTransaction() !== null);

  resetFilters(): void {
    this.filterForm.setValue({ search: '', dateRange: null, type: ALL, category: ALL });
  }

  openDetail(transaction: Transaction): void {
    this.selectedTransaction.set(transaction);
  }

  closeDetail(): void {
    this.selectedTransaction.set(null);
  }

  exportCsv(): void {
    this.exportService.exportTransactions(this.rows(), `transactions-${this.accountId()}.csv`);
  }
}
