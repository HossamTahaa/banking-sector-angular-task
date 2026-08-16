import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Transaction, TransactionTypeOption } from '@core/models/transaction.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly api = inject(ApiService);

  getAll(): Observable<Transaction[]> {
    return this.api.get<Transaction[]>('transactions.json');
  }

  getTypes(): Observable<TransactionTypeOption[]> {
    return this.api.get<TransactionTypeOption[]>('transaction-types.json');
  }

  getCategories(): Observable<string[]> {
    return this.api.get<string[]>('transaction-categories.json');
  }
}
