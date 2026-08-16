import { Signal } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function debitNotExceedBalanceValidator(balance: Signal<number>): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const type = group.get('type')?.value;
    const amount = Number(group.get('amount')?.value);

    if (type !== 'Debit' || Number.isNaN(amount) || amount <= 0) return null;

    const available = balance();
    return amount > available ? { debitExceedsBalance: { available } } : null;
  };
}
