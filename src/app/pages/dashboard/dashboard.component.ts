import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { InputText } from 'primeng/inputtext';
import { Table } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { CustomerSegment, CustomerStatus } from '@core/models/customer.model';
import { CustomerService } from '@core/services/customer.service';
import { MainLayoutComponent } from '@layouts/main-layout/main-layout.component';

type SegmentFilter = 'All' | CustomerSegment;

const SEGMENT_FILTERS: readonly SegmentFilter[] = ['All', 'Retail', 'Priority', 'Business'];

const SEGMENT_SEVERITY: Record<CustomerSegment, 'secondary' | 'success' | 'info'> = {
  Retail: 'secondary',
  Priority: 'success',
  Business: 'info',
};

const STATUS_CLASS: Record<CustomerStatus, string> = {
  Active: 'status-active',
  'KYC review': 'status-kyc',
  Dormant: 'status-dormant',
};

function initialsFrom(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

@Component({
  selector: 'app-dashboard',
  imports: [MainLayoutComponent, RouterLink, Table, Tag, InputText],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private readonly customerService = inject(CustomerService);
  private readonly router = inject(Router);

  readonly customers = rxResource({
    stream: () => this.customerService.getCustomers(),
    defaultValue: [],
  });

  readonly segmentFilters = SEGMENT_FILTERS;
  readonly segment = signal<SegmentFilter>('All');

   readonly visibleCustomers = computed(() => {
    const segment = this.segment();
    const customers = this.customers.value();

    return segment === 'All' ? customers : customers.filter((c) => c.segment === segment);
  });

  readonly counts = computed(() => {
    const customers = this.customers.value();

    return {
      All: customers.length,
      Retail: customers.filter((c) => c.segment === 'Retail').length,
      Priority: customers.filter((c) => c.segment === 'Priority').length,
      Business: customers.filter((c) => c.segment === 'Business').length,
    } as Record<SegmentFilter, number>;
  });

  segmentLabel(segment: SegmentFilter): string {
    return segment === 'All' ? 'All customers' : segment;
  }

  segmentSeverity(segment: CustomerSegment): 'secondary' | 'success' | 'info' {
    return SEGMENT_SEVERITY[segment];
  }

  statusClass(status: CustomerStatus): string {
    return STATUS_CLASS[status];
  }

  initials(name: string): string {
    return initialsFrom(name);
  }

  openCustomer(cif: string): void {
    this.router.navigate(['/customers', cif]);
  }
}
