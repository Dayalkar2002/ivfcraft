import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { filter, switchMap, takeUntil } from 'rxjs/operators';
import { selectAuthToken } from '../../../store/auth/auth.selectors';
import { MasterService, UserMasterRow } from '../../../core/services/master.service';

@Component({
  selector: 'app-user-master',
  standalone: true,
  template: `
    <div class="master-page">
      <div class="master-card">
        <h1>User Master</h1>
        @if (error) { <p class="error">{{ error }}</p> }
        <p class="hint">User list from spUserMaster. Full permission editing will be added in a follow-up.</p>
        <table>
          <thead><tr><th>ID</th><th>User Name</th><th>Login Name</th><th>Role ID</th></tr></thead>
          <tbody>
            @for (row of rows; track row.id) {
              <tr>
                <td>{{ row.id }}</td>
                <td>{{ row.name }}</td>
                <td>{{ row.loginName }}</td>
                <td>{{ row.roleId }}</td>
              </tr>
            } @empty {
              <tr><td colspan="4" class="empty">No users found.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .master-page { padding: 8px 0; }
    .master-card { background: #fff; border-radius: 12px; padding: 16px 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    h1 { margin: 0 0 8px; color: #2e7d32; font-size: 20px; }
    .hint { color: #6b7280; font-size: 13px; margin: 0 0 12px; }
    .error { color: #b91c1c; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; text-align: left; }
    th { background: #f3faf4; }
    .empty { text-align: center; color: #6b7280; padding: 16px; }
  `],
})
export class UserMasterComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private masterService = inject(MasterService);
  private destroy$ = new Subject<void>();

  rows: UserMasterRow[] = [];
  error = '';

  ngOnInit(): void {
    this.store
      .select(selectAuthToken)
      .pipe(
        filter((token): token is string => !!token),
        switchMap((token) => this.masterService.listUsers(token)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => {
          this.rows = res.data;
        },
        error: (err) => {
          this.error = err.error?.message ?? 'Failed to load users.';
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
