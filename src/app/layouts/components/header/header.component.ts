import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { AuthService } from '@core/services/auth.service';
import { ToastrService } from '@core/services/toastr.service';

@Component({
  selector: 'app-header',
  imports: [ButtonDirective],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly auth = inject(AuthService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);

  readonly currentUser = this.auth.currentUser;

  logout(): void {
    this.auth.logout();
    this.toastr.info('You have been signed out.');
    this.router.navigateByUrl('/login');
  }
}
