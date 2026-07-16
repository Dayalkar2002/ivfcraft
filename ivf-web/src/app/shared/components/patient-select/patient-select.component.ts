import { Component, EventEmitter, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { Subject, combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, take, takeUntil } from 'rxjs/operators';
import { Patient } from '../../../core/models';
import { PatientActions } from '../../../store/patient/patient.actions';
import {
  selectPatients,
  selectPatientError,
  selectPatientLoading,
  selectSatellites,
  selectSelectedSatellite,
} from '../../../store/patient/patient.selectors';

@Component({
  selector: 'app-patient-select',
  standalone: true,
  imports: [ReactiveFormsModule, AsyncPipe],
  templateUrl: './patient-select.component.html',
  styleUrl: './patient-select.component.scss',
})
export class PatientSelectComponent implements OnInit, OnDestroy {
  @Output() closed = new EventEmitter<void>();

  private store = inject(Store);
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  satellites$ = this.store.select(selectSatellites);
  loading$ = this.store.select(selectPatientLoading);
  error$ = this.store.select(selectPatientError);

  form = this.fb.group({
    satelliteId: [''],
    search: [''],
  });

  allPatients: Patient[] = [];
  filteredPatients: Patient[] = [];
  selectedPatientId: number | null = null;
  listMessage = 'Select a satellite clinic to load patients.';

  ngOnInit(): void {
    this.store.dispatch(PatientActions.loadSatellites());

    combineLatest([this.store.select(selectSatellites), this.store.select(selectSelectedSatellite)])
      .pipe(
        filter(([satellites]) => satellites.length > 0),
        take(1)
      )
      .subscribe(([satellites, selectedSat]) => {
        const sat = selectedSat || satellites[0];
        if (sat) {
          this.form.patchValue({ satelliteId: String(sat.id) }, { emitEvent: false });
          this.store.dispatch(PatientActions.selectSatellite({ satellite: sat }));
          this.loadPatients(sat.id);
        }
      });

    this.store
      .select(selectPatients)
      .pipe(takeUntil(this.destroy$))
      .subscribe((patients) => {
        this.allPatients = patients;
        this.applyFilter(this.form.get('search')?.value || '');
      });

    this.form.controls.search.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((term) => this.applyFilter(term || ''));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSatelliteChange(event: Event): void {
    const id = Number((event.target as HTMLSelectElement).value);
    if (!id) {
      this.allPatients = [];
      this.filteredPatients = [];
      this.listMessage = 'Select a satellite clinic to load patients.';
      return;
    }

    this.satellites$.pipe(take(1)).subscribe((sats) => {
      const sat = sats.find((s) => s.id === id);
      if (sat) {
        this.store.dispatch(PatientActions.selectSatellite({ satellite: sat }));
        this.loadPatients(id);
      }
    });
  }

  private loadPatients(satelliteId: number): void {
    this.selectedPatientId = null;
    this.listMessage = 'Loading patients…';
    this.store.dispatch(PatientActions.searchPatients({ search: '', satelliteId }));
  }

  private applyFilter(term: string): void {
    const q = term.trim().toLowerCase();
    if (!this.allPatients.length) {
      this.filteredPatients = [];
      if (!this.form.value.satelliteId) {
        this.listMessage = 'Select a satellite clinic to load patients.';
      }
      return;
    }

    if (!q) {
      this.filteredPatients = this.allPatients;
    } else {
      this.filteredPatients = this.allPatients.filter((p) => {
        const haystack = [p.name, p.uhid, p.partner, p.aadhar, p.category, String(p.id)]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      });
    }

    this.listMessage =
      this.filteredPatients.length === 0
        ? 'No patients match your search.'
        : `${this.filteredPatients.length} patient(s) found`;
  }

  pickPatient(patient: Patient): void {
    this.selectedPatientId = patient.id;
  }

  confirmSelection(): void {
    const patient = this.filteredPatients.find((p) => p.id === this.selectedPatientId)
      || this.allPatients.find((p) => p.id === this.selectedPatientId);
    if (!patient) return;

    this.store
      .select(selectSelectedSatellite)
      .pipe(take(1))
      .subscribe((satellite) => {
        this.store.dispatch(
          PatientActions.selectPatient({
            patient: {
              ...patient,
              satelliteId: patient.satelliteId || satellite?.id || Number(this.form.value.satelliteId) || 0,
            },
          })
        );
        this.closed.emit();
      });
  }

  patientInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  }

  formatAge(age: number | null | undefined): string {
    if (age === null || age === undefined || Number.isNaN(Number(age))) return '—';
    return `${age}Y`;
  }

  close(): void {
    this.closed.emit();
  }
}
