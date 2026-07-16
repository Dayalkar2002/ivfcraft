import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CycleState } from './cycle.state';

export const selectCycleState = createFeatureSelector<CycleState>('cycle');

export const selectOocyteSources = createSelector(selectCycleState, (s) => s.oocyteSources);
export const selectSemenSources = createSelector(selectCycleState, (s) => s.semenSources);
export const selectCurrentCycle = createSelector(selectCycleState, (s) => s.currentCycle);
export const selectCycleType = createSelector(selectCycleState, (s) => s.cycleType);
export const selectRetrievalConfig = createSelector(selectCycleState, (s) => s.retrievalConfig);
export const selectCycleLoading = createSelector(selectCycleState, (s) => s.loading);
export const selectCycleSaving = createSelector(selectCycleState, (s) => s.saving);
export const selectCycleError = createSelector(selectCycleState, (s) => s.error);
export const selectCycleSuccess = createSelector(selectCycleState, (s) => s.successMessage);
