import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, combineLatest } from 'rxjs';
import { filter, switchMap, takeUntil } from 'rxjs/operators';
import { selectAuthToken } from '../../../store/auth/auth.selectors';
import { MasterService, CommonMasterRow } from '../../../core/services/master.service';
import { getCommonMasterLabel } from '../master-registry';

@Component({
  selector: 'app-common-master',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="master-page">
      <div class="master-card">
        <div class="header">
          <h1>{{ title }}</h1>
          @if (loading) { <span class="badge">Loading…</span> }
        </div>
        @if (error) { <p class="error">{{ error }}</p> }

        <div class="add-row">
          <input [(ngModel)]="newName" placeholder="Enter name" (keyup.enter)="add()" />
          <button type="button" (click)="add()" [disabled]="!newName.trim() || saving">Add</button>
        </div>

        <table>
          <thead>
            <tr><th>ID</th><th>Name</th><th>Actions</th></tr>
          </thead>
          <tbody>
            @for (row of rows; track row.id) {
              <tr>
                <td>{{ row.id }}</td>
                <td>
                  @if (editId === row.id) {
                    <input [(ngModel)]="editName" (keyup.enter)="saveEdit(row)" />
                  } @else {
                    {{ row.name }}
                  }
                </td>
                <td class="actions">
                  @if (editId === row.id) {
                    <button type="button" (click)="saveEdit(row)" [disabled]="saving">Save</button>
                    <button type="button" class="muted" (click)="cancelEdit()">Cancel</button>
                  } @else {
                    <button type="button" (click)="startEdit(row)">Edit</button>
                    <button type="button" class="danger" (click)="remove(row)" [disabled]="saving">Delete</button>
                  }
                </td>
              </tr>
            } @empty {
              <tr><td colspan="3" class="empty">No records found.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .master-page { padding: 8px 0; }
    .master-card {
      background: #fff;
      border-radius: 12px;
      padding: 16px 20px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    }
    .header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    h1 { margin: 0; color: #2e7d32; font-size: 20px; }
    .badge { font-size: 12px; color: #6b7280; }
    .error { color: #b91c1c; font-size: 13px; }
    .add-row { display: flex; gap: 8px; margin-bottom: 12px; }
    .add-row input, td input { flex: 1; padding: 6px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; }
    button {
      padding: 6px 12px;
      border: none;
      border-radius: 6px;
      background: #2e7d32;
      color: #fff;
      font-size: 12px;
      cursor: pointer;
    }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
    button.muted { background: #9ca3af; }
    button.danger { background: #dc2626; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; text-align: left; }
    th { background: #f3faf4; color: #374151; }
    .actions { display: flex; gap: 6px; }
    .empty { text-align: center; color: #6b7280; padding: 20px; }
  `],
})
export class CommonMasterComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private store = inject(Store);
  private masterService = inject(MasterService);
  private destroy$ = new Subject<void>();

  catId = Number(this.route.snapshot.paramMap.get('catId'));
  title = getCommonMasterLabel(this.catId);
  rows: CommonMasterRow[] = [];
  loading = false;
  saving = false;
  error = '';
  newName = '';
  editId: number | null = null;
  editName = '';

  ngOnInit(): void {
    combineLatest([this.store.select(selectAuthToken), this.route.paramMap])
      .pipe(
        filter(([token]) => !!token),
        takeUntil(this.destroy$)
      )
      .subscribe(([token, params]) => {
        this.catId = Number(params.get('catId'));
        this.title = getCommonMasterLabel(this.catId);
        this.load(token!);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load(token: string): void {
    this.loading = true;
    this.error = '';
    this.masterService.listCommonMaster(token, this.catId).subscribe({
      next: (res) => {
        this.rows = res.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message ?? 'Failed to load master data.';
        this.loading = false;
      },
    });
  }

  add(): void {
    if (!this.newName.trim()) return;
    this.persist('insert', { name: this.newName.trim() });
    this.newName = '';
  }

  startEdit(row: CommonMasterRow): void {
    this.editId = row.id;
    this.editName = row.name;
  }

  cancelEdit(): void {
    this.editId = null;
    this.editName = '';
  }

  saveEdit(row: CommonMasterRow): void {
    if (!this.editName.trim()) return;
    this.persist('update', { id: row.id, name: this.editName.trim() });
    this.cancelEdit();
  }

  remove(row: CommonMasterRow): void {
    if (!confirm(`Delete "${row.name}"?`)) return;
    this.persist('delete', { id: row.id, name: row.name });
  }

  private persist(action: 'insert' | 'update' | 'delete', payload: { id?: number; name: string }): void {
    this.store
      .select(selectAuthToken)
      .pipe(
        filter((token): token is string => !!token),
        switchMap((token) => {
          this.saving = true;
          return this.masterService.saveCommonMaster(token, this.catId, { ...payload, action });
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => {
          this.rows = res.data;
          this.saving = false;
        },
        error: (err) => {
          this.error = err.error?.message ?? 'Save failed.';
          this.saving = false;
        },
      });
  }
}
