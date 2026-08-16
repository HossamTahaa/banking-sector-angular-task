import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const MAX_AMOUNT = 100_000;

const MAX_DECIMALS = 2;

function decimalPlaces(value: number): number {
  const [, decimals = ''] = String(value).split('.');
  return decimals.length;
}

export const amountValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (control.value === null || control.value === '') return { required: true };

  const amount = Number(control.value);

  if (Number.isNaN(amount)) return { amountInvalid: true };
  if (amount <= 0) return { amountNotPositive: true };
  if (amount > MAX_AMOUNT) return { amountTooLarge: { max: MAX_AMOUNT } };
  if (decimalPlaces(amount) > MAX_DECIMALS) return { amountDecimals: { max: MAX_DECIMALS } };

  return null;
};
