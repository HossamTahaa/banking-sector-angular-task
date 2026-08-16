import { Injectable, computed, inject, signal } from '@angular/core';
import { LocalStorageService } from './local-storage.service';

const SESSION_KEY = 'banking-portal.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storage = inject(LocalStorageService);

  private readonly session = signal(this.storage.get<string>(SESSION_KEY));

  readonly isAuthenticated = computed(() => this.session() !== null);

  // The session value is the signed-in email, which the header shows.
  readonly currentUser = this.session.asReadonly();

  // No backend to verify against yet, so any email that passed form validation is accepted.
  login(email: string): void {
    this.storage.set(SESSION_KEY, email);
    this.session.set(email);
  }

  logout(): void {
    this.storage.remove(SESSION_KEY);
    this.session.set(null);
  }
}
