import { createReducer, on } from '@ngrx/store';
import { UiActions } from './ui.actions';
import { initialUiState } from './ui.state';

export const uiReducer = createReducer(
  initialUiState,
  on(UiActions.showLoader, (state, { message }) => ({
    ...state,
    globalLoading: true,
    loadingMessage: message || 'Please wait...',
  })),
  on(UiActions.hideLoader, (state) => ({
    ...state,
    globalLoading: false,
  }))
);
