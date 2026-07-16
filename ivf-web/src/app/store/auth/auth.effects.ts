import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { AuthActions } from './auth.actions';
import { ApiService } from '../../core/services/api.service';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private api = inject(ApiService);
  private router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ username, password }) =>
        this.api.login(username, password).pipe(
          map((res) => AuthActions.loginSuccess({ user: res.user, token: res.token })),
          catchError((err) =>
            of(AuthActions.loginFailure({ error: err.error?.message || 'Login failed.' }))
          )
        )
      )
    )
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(() => this.router.navigate(['/dashboard']))
      ),
    { dispatch: false }
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => this.router.navigate(['/login']))
      ),
    { dispatch: false }
  );
}
