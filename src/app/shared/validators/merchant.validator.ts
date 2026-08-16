import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const MERCHANT_MIN_LENGTH = 3;
export const MERCHANT_MAX_LENGTH = 50;

// Angular's minLength counts whitespace, so "   " would pass. Merchant names are trimmed first.
export const merchantValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const merchant = String(control.value ?? '').trim();

  if (!merchant) return { required: true };
  if (merchant.length < MERCHANT_MIN_LENGTH)
    return { merchantTooShort: { min: MERCHANT_MIN_LENGTH } };
  if (merchant.length > MERCHANT_MAX_LENGTH)
    return { merchantTooLong: { max: MERCHANT_MAX_LENGTH } };

  return null;
};
