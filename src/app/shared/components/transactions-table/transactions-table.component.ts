import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { SortIcon, SortableColumn, Table } from 'primeng/table';
import { Transaction } from '@core/models/transaction.model';

@Component({
  selector: 'app-transactions-table',
  imports: [DatePipe, DecimalPipe, Table, SortableColumn, SortIcon],
  templateUrl: './transactions-table.component.html',
  styleUrl: './transactions-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionsTableComponent {
  readonly transactions = input.required<Transaction[]>();
  readonly currency = input('');
  readonly emptyMessage = input('No transactions to show.');

  readonly rowClick = output<Transaction>();

  readonly rowsPerPage = 10;
  readonly rowsPerPageOptions = [10, 20, 50];
}
