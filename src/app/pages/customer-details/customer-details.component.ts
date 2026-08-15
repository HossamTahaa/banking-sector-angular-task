import { Component, input } from '@angular/core';
import { MainLayoutComponent } from '@layouts/main-layout/main-layout.component';

@Component({
  selector: 'app-customer-details',
  imports: [MainLayoutComponent],
  templateUrl: './customer-details.component.html',
  styleUrl: './customer-details.component.scss',
})
export class CustomerDetailsComponent {
  readonly cif = input.required<string>();
}
