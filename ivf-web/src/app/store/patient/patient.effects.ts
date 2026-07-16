import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import { PatientActions } from './patient.actions';
import { ApiService } from '../../core/services/api.service';
import { selectAuthToken } from '../auth/auth.selectors';
import { selectSelectedSatellite } from './patient.selectors';

@Injectable()
export class PatientEffects {
  private actions$ = inject(Actions);
  private api = inject(ApiService);
  private store = inject(Store);

  loadSatellites$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PatientActions.loadSatellites),
      withLatestFrom(this.store.select(selectAuthToken)),
      switchMap(([, token]) =>
        this.api.getSatellites(token!).pipe(
          map((res) => PatientActions.loadSatellitesSuccess({ satellites: res.data })),
          catchError((err) =>
            of(PatientActions.loadSatellitesFailure({ error: err.error?.message || 'Failed to load satellites.' }))
          )
        )
      )
    )
  );

  searchPatients$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PatientActions.searchPatients),
      withLatestFrom(this.store.select(selectAuthToken), this.store.select(selectSelectedSatellite)),
      switchMap(([{ search, satelliteId }, token, satellite]) => {
        const satId = satelliteId ?? satellite?.id;
        if (!satId) {
          return of(PatientActions.searchPatientsFailure({ error: 'Please select a satellite clinic first.' }));
        }
        return this.api.searchPatients(token!, search || '', satId).pipe(
          map((res) => PatientActions.searchPatientsSuccess({ patients: res.data })),
          catchError((err) =>
            of(PatientActions.searchPatientsFailure({ error: err.error?.message || 'Search failed.' }))
          )
        );
      })
    )
  );
}
