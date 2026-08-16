import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { InputPassword } from 'primeng/inputpassword';
import { InputText } from 'primeng/inputtext';
import { AuthService } from '@core/services/auth.service';
import { ToastrService } from '@core/services/toastr.service';
import { BlankLayoutComponent } from '@layouts/blank-layout/blank-layout.component';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, BlankLayoutComponent, InputText, InputPassword, ButtonDirective],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);

  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  readonly submitting = signal(false);

  // Control validity and touched state sit outside the signal graph, so every derived signal below
  // re-reads them whenever the form emits an event.
  private readonly formEvents = toSignal(this.form.events);

  readonly emailError = computed(() => {
    this.formEvents();
    const email = this.form.controls.email;

    if (!email.touched) return null;
    if (email.hasError('required')) return 'Email is required';
    if (email.hasError('email')) return 'Enter a valid email address';
    return null;
  });

  readonly passwordError = computed(() => {
    this.formEvents();
    const password = this.form.controls.password;

    if (!password.touched) return null;
    if (password.hasError('required')) return 'Password is required';
    if (password.hasError('minlength')) return 'Password must be at least 6 characters';
    return null;
  });

  readonly submitDisabled = computed(() => {
    this.formEvents();
    return this.form.invalid || this.submitting();
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastr.error('Check the highlighted fields and try again.');
      return;
    }

    this.submitting.set(true);

    try {
      this.auth.login(this.form.getRawValue().email);
    } catch {
      // Storage is blocked or full, which is the only way signing in can fail without a backend.
      this.submitting.set(false);
      this.toastr.error('Could not start your session. Please try again.');
      return;
    }

    this.toastr.success('Signed in successfully.');
    this.router.navigateByUrl('/dashboard');
  }
}
