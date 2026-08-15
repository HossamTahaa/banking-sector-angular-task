import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { LocalStorageService } from './local-storage.service';

const TOKEN_KEY = 'banking-portal.token';

interface LoginResponse {
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly storage = inject(LocalStorageService);

  private readonly token = signal<string | null>(this.storage.get<string>(TOKEN_KEY));

  readonly isAuthenticated = computed(() => this.token() !== null);

  login(username: string, password: string): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('auth/login', { username, password }).pipe(
      tap((response) => {
        this.storage.set(TOKEN_KEY, response.token);
        this.token.set(response.token);
      }),
    );
  }

  logout(): void {
    this.storage.remove(TOKEN_KEY);
    this.token.set(null);
  }

  currentToken(): string | null {
    return this.token();
  }
}
