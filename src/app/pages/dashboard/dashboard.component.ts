import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Table } from 'primeng/table';
import { CustomerService } from '@core/services/customer.service';
import { MainLayoutComponent } from '@layouts/main-layout/main-layout.component';

@Component({
  selector: 'app-dashboard',
  imports: [MainLayoutComponent, RouterLink, Table],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private readonly customerService = inject(CustomerService);

  readonly customers = rxResource({
    stream: () => this.customerService.getAll(),
    defaultValue: [],
  });
}
