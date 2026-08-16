import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Account } from '@core/models/account.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly api = inject(ApiService);

  getAll(): Observable<Account[]> {
    return this.api.get<Account[]>('accounts.json');
  }
}
