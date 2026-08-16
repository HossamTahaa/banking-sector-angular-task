import { Injectable, inject } from '@angular/core';
import { Observable, delay, map } from 'rxjs';
import { Customer } from '@core/models/customer.model';
import { ApiService } from './api.service';

 const MOCK_LATENCY_MS = 400;

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly api = inject(ApiService);

  getCustomers(): Observable<Customer[]> {
    return this.api.get<Customer[]>('customers.json').pipe(delay(MOCK_LATENCY_MS));
  }

  getByCif(cif: string): Observable<Customer | null> {
    return this.getCustomers().pipe(
      map((customers) => customers.find((customer) => customer.cif === cif) ?? null),
    );
  }
}
