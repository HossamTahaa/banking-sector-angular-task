import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CustomerService } from '@core/services/customer.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-side-menu',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.scss',
})
export class SideMenuComponent {
  private readonly customerService = inject(CustomerService);

  readonly items: readonly NavItem[] = [
    { label: 'Customers', icon: 'pi pi-users', route: '/dashboard' },
  ];

  private readonly customers = rxResource({
    stream: () => this.customerService.getCustomers(),
    defaultValue: [],
  });

  readonly customerCount = this.customers.value;
}
