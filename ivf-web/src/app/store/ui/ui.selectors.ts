import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UiState } from './ui.state';

export const selectUiState = createFeatureSelector<UiState>('ui');
export const selectGlobalLoading = createSelector(selectUiState, (s) => s.globalLoading);
export const selectLoadingMessage = createSelector(selectUiState, (s) => s.loadingMessage);
