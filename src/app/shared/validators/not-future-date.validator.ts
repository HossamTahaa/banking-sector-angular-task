import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const notFutureDateValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  if (!control.value) return null;

  const selected = new Date(control.value);
  if (Number.isNaN(selected.getTime())) return { dateInvalid: true };

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  return selected > endOfToday ? { dateInFuture: true } : null;
};
