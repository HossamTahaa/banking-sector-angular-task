import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class ToastrService {
  private readonly messages = inject(MessageService);

  success(detail: string, summary = 'Success'): void {
    this.messages.add({ severity: 'success', summary, detail });
  }

  info(detail: string, summary = 'Info'): void {
    this.messages.add({ severity: 'info', summary, detail });
  }

  error(detail: string, summary = 'Error'): void {
    this.messages.add({ severity: 'error', summary, detail, life: 6000 });
  }
}
