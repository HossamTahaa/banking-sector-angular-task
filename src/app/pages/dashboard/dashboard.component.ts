import { Component } from '@angular/core';
import { MainLayoutComponent } from '@layouts/main-layout/main-layout.component';

@Component({
  selector: 'app-dashboard',
  imports: [MainLayoutComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {}
