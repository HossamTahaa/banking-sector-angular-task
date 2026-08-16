import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { TransactionType } from '@core/models/transaction.model';
import { ToastrService } from '@core/services/toastr.service';
import { TransactionService } from '@core/services/transaction.service';
import { TransactionStoreService } from '@core/services/transaction-store.service';
import { MainLayoutComponent } from '@layouts/main-layout/main-layout.component';
import { MAX_AMOUNT, amountValidator } from '@shared/validators/amount.validator';
import { debitNotExceedBalanceValidator } from '@shared/validators/debit-not-exceed-balance.validator';
import {
  MERCHANT_MAX_LENGTH,
  MERCHANT_MIN_LENGTH,
  merchantValidator,
} from '@shared/validators/merchant.validator';
import { notFutureDateValidator } from '@shared/validators/not-future-date.validator';

const AMOUNT_MESSAGES: Record<string, string> = {
  required: 'Amount is required',
  amountInvalid: 'Enter a valid number',
  amountNotPositive: 'Amount must be greater than 0',
  amountTooLarge: `Amount cannot exceed ${MAX_AMOUNT.toLocaleString()}`,
  amountDecimals: 'Use at most 2 decimal places',
};

const DATE_MESSAGES: Record<string, string> = {
  required: 'Date is required',
  dateInvalid: 'Enter a valid date',
  dateInFuture: 'Date cannot be in the future',
};

const MERCHANT_MESSAGES: Record<string, string> = {
  required: 'Merchant is required',
  merchantTooShort: `Merchant must be at least ${MERCHANT_MIN_LENGTH} characters`,
  merchantTooLong: `Merchant must be at most ${MERCHANT_MAX_LENGTH} characters`,
};

function firstError(control: AbstractControl, messages: Record<string, string>): string | null {
  if (!control.touched || !control.errors) return null;

  const key = Object.keys(control.errors).find((error) => error in messages);
  return key ? messages[key] : null;
}

// Local calendar parts, so a picked day never shifts across the UTC boundary.
function toIsoDate(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${date.getFullYear()}-${month}-${day}`;
}

@Component({
  selector: 'app-transaction-create',
  imports: [
    MainLayoutComponent,
    ReactiveFormsModule,
    RouterLink,
    DecimalPipe,
    DatePicker,
    InputText,
    Select,
    ButtonDirective,
  ],
  templateUrl: './transaction-create.component.html',
  styleUrl: './transaction-create.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionCreateComponent {
  readonly cif = input.required<string>();
  readonly accountId = input.required<string>();

  private readonly formBuilder = inject(FormBuilder);
  private readonly store = inject(TransactionStoreService);
  private readonly transactionService = inject(TransactionService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);

  readonly account = computed(() => this.store.getAccount(this.accountId()));
  readonly balance = computed(() => this.store.getAccountBalance(this.accountId()));

  readonly backLink = computed(() => [
    '/customers',
    this.cif(),
    'accounts',
    this.accountId(),
    'transactions',
  ]);

  readonly today = new Date();

  readonly form = this.formBuilder.group(
    {
      type: this.formBuilder.control<TransactionType | null>(null, Validators.required),
      amount: this.formBuilder.control<number | null>(null, amountValidator),
      date: this.formBuilder.control<Date | null>(null, [
        Validators.required,
        notFutureDateValidator,
      ]),
      merchant: this.formBuilder.nonNullable.control('', merchantValidator),
      category: this.formBuilder.control<string | null>(null, Validators.required),
    },
    { validators: debitNotExceedBalanceValidator(this.balance) },
  );

  private readonly typeLookup = rxResource({
    stream: () => this.transactionService.getTypes(),
    defaultValue: [],
  });

  readonly typeOptions = this.typeLookup.value;

  private readonly categoryLookup = rxResource({
    stream: () => this.transactionService.getCategories(),
    defaultValue: [],
  });

  readonly categoryOptions = this.categoryLookup.value;

  private readonly formEvents = toSignal(this.form.events);

  readonly errors = computed(() => {
    this.formEvents();
    const controls = this.form.controls;

    return {
      type: firstError(controls.type, { required: 'Type is required' }),
      amount: firstError(controls.amount, AMOUNT_MESSAGES),
      date: firstError(controls.date, DATE_MESSAGES),
      merchant: firstError(controls.merchant, MERCHANT_MESSAGES),
      category: firstError(controls.category, { required: 'Category is required' }),
    };
  });

  readonly balanceError = computed(() => {
    this.formEvents();
    if (!this.form.hasError('debitExceedsBalance')) return null;

    return `A debit of this amount exceeds the available balance of ${this.balance().toFixed(2)}.`;
  });

  readonly saveDisabled = computed(() => {
    this.formEvents();
    return this.form.invalid;
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { type, amount, date, merchant, category } = this.form.getRawValue();
    if (!type || amount === null || !date || !category) return;

    this.store.addTransaction({
      accountId: this.accountId(),
      date: toIsoDate(date),
      type,
      amount,
      merchant: merchant.trim(),
      category,
    });

    this.toastr.success('Transaction added.');
    this.router.navigate(this.backLink());
  }
}
