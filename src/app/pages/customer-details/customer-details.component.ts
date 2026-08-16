import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Table } from 'primeng/table';
import { CustomerService } from '@core/services/customer.service';
import { TransactionStoreService } from '@core/services/transaction-store.service';
import { MainLayoutComponent } from '@layouts/main-layout/main-layout.component';

@Component({
  selector: 'app-customer-details',
  imports: [MainLayoutComponent, RouterLink, DecimalPipe, Table, ProgressSpinner],
  templateUrl: './customer-details.component.html',
  styleUrl: './customer-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerDetailsComponent {
  readonly cif = input.required<string>();

  private readonly customerService = inject(CustomerService);
  private readonly store = inject(TransactionStoreService);

  readonly customer = rxResource({
    params: () => this.cif(),
    stream: ({ params }) => this.customerService.getByCif(params),
  });

   readonly accounts = computed(() => this.store.getAccountsByCustomer(this.cif()));
  readonly accountsLoading = this.store.loading;
}
