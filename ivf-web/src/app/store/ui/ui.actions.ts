import { createActionGroup, props } from '@ngrx/store';

export const UiActions = createActionGroup({
  source: 'UI',
  events: {
    'Show Loader': props<{ message?: string }>(),
    'Hide Loader': props<{ dummy?: boolean }>(),
  },
});
