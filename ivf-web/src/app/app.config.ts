import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { routes } from './app.routes';
import { authReducer } from './store/auth/auth.reducer';
import { patientReducer } from './store/patient/patient.reducer';
import { cycleReducer } from './store/cycle/cycle.reducer';
import { uiReducer } from './store/ui/ui.reducer';
import { AuthEffects } from './store/auth/auth.effects';
import { PatientEffects } from './store/patient/patient.effects';
import { CycleEffects } from './store/cycle/cycle.effects';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    provideStore({
      auth: authReducer,
      patient: patientReducer,
      cycle: cycleReducer,
      ui: uiReducer,
    }),
    provideEffects(AuthEffects, PatientEffects, CycleEffects),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
  ],
};
