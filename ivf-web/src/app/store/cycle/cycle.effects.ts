import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, map, mergeMap, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import { CycleActions } from './cycle.actions';
import { ApiService } from '../../core/services/api.service';
import { selectAuthToken } from '../auth/auth.selectors';
import { UiActions } from '../ui/ui.actions';

@Injectable()
export class CycleEffects {
  private actions$ = inject(Actions);
  private api = inject(ApiService);
  private store = inject(Store);

  loadTypes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CycleActions.loadTypes),
      withLatestFrom(this.store.select(selectAuthToken)),
      switchMap(([, token]) =>
        this.api.getCycleTypes(token!).pipe(
          map((res) =>
            CycleActions.loadTypesSuccess({
              oocyteSources: res.data.oocyteSources,
              semenSources: res.data.semenSources,
            })
          ),
          catchError((err) =>
            of(CycleActions.loadTypesFailure({ error: err.error?.message || 'Failed to load cycle types.' }))
          )
        )
      )
    )
  );

  saveEntry$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CycleActions.saveEntry),
      withLatestFrom(this.store.select(selectAuthToken)),
      switchMap(([{ entry }, token]) =>
        this.api.saveCycleEntry(token!, entry).pipe(
          map((res) => CycleActions.saveEntrySuccess({ cycle: res.data, message: res.message })),
          catchError((err) =>
            of(CycleActions.saveEntryFailure({ error: err.error?.message || 'Failed to save cycle.' }))
          )
        )
      )
    )
  );

  saveEntryResult$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CycleActions.saveEntrySuccess, CycleActions.saveEntryFailure, CycleActions.saveRetrievalSuccess, CycleActions.saveRetrievalFailure),
      tap(() => this.store.dispatch(UiActions.hideLoader({})))
    ),
    { dispatch: false }
  );

  loadRetrievalConfig$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CycleActions.loadRetrievalConfig),
      withLatestFrom(this.store.select(selectAuthToken)),
      switchMap(([{ cycleId }, token]) =>
        this.api.getRetrievalConfig(token!, cycleId).pipe(
          mergeMap((res) => {
            const data = res.data as {
              cycle: import('../../core/models').CycleEntry;
              sections: unknown;
              existingRetrieval: unknown;
              availableRecipients: { id: number; name: string; uhid: string; aadhar?: string }[];
              lockedRecipients: {
                recipientId: number;
                recipientName: string;
                recipientAadhar?: string;
                cycleId: string;
              }[];
              donorAadhar?: string;
            };
            return [
              CycleActions.setCurrentCycle({ cycle: data.cycle }),
              CycleActions.loadRetrievalConfigSuccess({
                config: {
                  sections: data.sections as import('../../core/models').RetrievalSections,
                  existingRetrieval: data.existingRetrieval as import('../../core/models').RetrievalData | null,
                  availableRecipients: data.availableRecipients,
                  lockedRecipients: data.lockedRecipients,
                  donorAadhar: data.donorAadhar,
                },
              }),
            ];
          }),
          catchError((err) =>
            of(CycleActions.loadRetrievalConfigFailure({ error: err.error?.message || 'Failed to load retrieval config.' }))
          )
        )
      )
    )
  );

  saveRetrieval$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CycleActions.saveRetrieval),
      withLatestFrom(this.store.select(selectAuthToken)),
      switchMap(([{ cycleId, sections }, token]) =>
        this.api.saveRetrieval(token!, cycleId, sections).pipe(
          map((res) => CycleActions.saveRetrievalSuccess({ cycle: res.data, message: res.message })),
          catchError((err) =>
            of(CycleActions.saveRetrievalFailure({ error: err.error?.message || 'Failed to save retrieval.' }))
          )
        )
      )
    )
  );
}
