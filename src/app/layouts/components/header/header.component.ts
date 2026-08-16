import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { AuthService } from '@core/services/auth.service';

// The mock sign-in accepts any address, so the display name is read back out of the local part.
function displayNameFrom(email: string | null): string {
  const localPart = email?.split('@')[0] ?? '';

  const words = localPart
    .split(/[._-]+/)
    .map((word) => word.replace(/\d+/g, ''))
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1));

  return words.join(' ') || 'Signed in';
}

function initialsFrom(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

@Component({
  selector: 'app-header',
  imports: [ButtonDirective],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly displayName = computed(() => displayNameFrom(this.auth.currentUser()));
  readonly initials = computed(() => initialsFrom(this.displayName()));

  logout(): void {
    this.auth.logout();
    // The login page shows the sign-out notice, so it is not also raised as a toast here.
    this.router.navigate(['/login'], { queryParams: { signedOut: true } });
  }
}
