import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Customer } from '@core/models/customer.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly api = inject(ApiService);

  getAll(): Observable<Customer[]> {
    return this.api.get<Customer[]>('customers.json');
  }

  getByCif(cif: string): Observable<Customer | null> {
    return this.getAll().pipe(
      map((customers) => customers.find((customer) => customer.CIF === cif) ?? null),
    );
  }
}
