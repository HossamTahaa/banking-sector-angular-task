import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  get<T>(key: string): T | null {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;

    try {
      return JSON.parse(raw) as T;
    } catch {
      // Stored by an older build or hand-edited: drop it instead of breaking every caller.
      localStorage.removeItem(key);
      return null;
    }
  }

  set(key: string, value: unknown): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }
}
