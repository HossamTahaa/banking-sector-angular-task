import { Signal } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Takes the balance as a signal so the rule follows the store instead of a value captured at
// form-construction time, which is still empty on a cold load.
export function debitNotExceedBalanceValidator(balance: Signal<number>): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const type = group.get('type')?.value;
    const amount = Number(group.get('amount')?.value);

    if (type !== 'Debit' || Number.isNaN(amount) || amount <= 0) return null;

    const available = balance();
    return amount > available ? { debitExceedsBalance: { available } } : null;
  };
}
