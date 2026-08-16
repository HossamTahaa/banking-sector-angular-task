import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, delay, of, tap, throwError } from 'rxjs';
import { LocalStorageService } from './local-storage.service';

const SESSION_KEY = 'banking-portal.session';
const MOCK_LATENCY_MS = 900;

export interface Session {
  email: string;
  token: string;
}

function mockToken(): string {
  return `mock.${Date.now().toString(36)}.${Math.random().toString(36).slice(2, 10)}`;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storage = inject(LocalStorageService);

  private readonly session = signal(this.storage.get<Session>(SESSION_KEY));

  readonly isAuthenticated = computed(() => this.session() !== null);

  // The header shows whoever is signed in.
  readonly currentUser = computed(() => this.session()?.email ?? null);

  login(email: string, password: string): Observable<Session> {
    if (!email.trim() || !password.trim()) {
      return throwError(() => new Error('Email and password are required.'));
    }
    const session: Session = { email, token: mockToken() };
    return of(session).pipe(
      delay(MOCK_LATENCY_MS),
      tap((value) => {
        this.storage.set(SESSION_KEY, value);
        this.session.set(value);
      }),
    );
  }

  logout(): void {
    this.storage.remove(SESSION_KEY);
    this.session.set(null);
  }
}
