import { Component } from '@angular/core';
import { HeaderComponent } from '@layouts/components/header/header.component';
import { SideMenuComponent } from '@layouts/components/side-menu/side-menu.component';

@Component({
  selector: 'app-main-layout',
  imports: [HeaderComponent, SideMenuComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {}
