import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  booleanAttribute,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { Card } from 'primeng/card';
import { Checkbox } from 'primeng/checkbox';
import { InputPassword } from 'primeng/inputpassword';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { AuthService } from '@core/services/auth.service';
import { BlankLayoutComponent } from '@layouts/blank-layout/blank-layout.component';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_PASSWORD_LENGTH = 8;

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    BlankLayoutComponent,
    Card,
    Message,
    Checkbox,
    InputText,
    InputPassword,
    ButtonDirective,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  // Bound from the ?signedOut=true query parameter by withComponentInputBinding().
  readonly signedOut = input(false, { transform: booleanAttribute });

  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.pattern(EMAIL_PATTERN)]],
    password: ['', [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH)]],
    rememberMe: [false],
  });

  readonly submitting = signal(false);
  readonly authError = signal<string | null>(null);
  readonly passwordMasked = signal(true);
  private readonly signedOutDismissed = signal(false);
  readonly showSignedOut = computed(() => this.signedOut() && !this.signedOutDismissed());

  // Control validity and touched state sit outside the signal graph, so every derived signal below
  // re-reads them whenever the form emits an event.
  private readonly formEvents = toSignal(this.form.events);

  readonly emailError = computed(() => {
    this.formEvents();
    const email = this.form.controls.email;

    if (!email.touched) return null;
    if (email.hasError('required')) return 'Email is required.';
    if (email.hasError('pattern')) return 'Please enter a valid email address.';
    return null;
  });

  readonly passwordError = computed(() => {
    this.formEvents();
    const password = this.form.controls.password;

    if (!password.touched) return null;
    if (password.hasError('required')) return 'Password is required.';
    if (password.hasError('minlength'))
      return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    return null;
  });

  dismissSignedOut(): void {
    this.signedOutDismissed.set(true);
  }

  togglePassword(): void {
    this.passwordMasked.update((masked) => !masked);
  }

  submit(): void {
    this.authError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const { email, password } = this.form.getRawValue();
    this.auth
      .login(email, password)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: () => {
          this.submitting.set(false);
          this.authError.set('We could not sign you in. Please try again.');
        },
      });
  }
}
