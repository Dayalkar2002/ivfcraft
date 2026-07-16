import { createReducer, on } from '@ngrx/store';
import { CycleActions } from './cycle.actions';
import { initialCycleState } from './cycle.state';

export const cycleReducer = createReducer(
  initialCycleState,
  on(CycleActions.loadTypes, (state) => ({ ...state, loading: true })),
  on(CycleActions.loadTypesSuccess, (state, { oocyteSources, semenSources }) => ({
    ...state,
    oocyteSources,
    semenSources,
    loading: false,
  })),
  on(CycleActions.loadTypesFailure, (state, { error }) => ({ ...state, loading: false, error })),
  on(CycleActions.updateSelection, (state, { oocyteSource, semenSource, cycleType }) => ({
    ...state,
    cycleType,
    currentCycle: state.currentCycle
      ? { ...state.currentCycle, oocyteSource, semenSource, cycleType }
      : null,
  })),
  on(CycleActions.saveEntry, (state) => ({ ...state, saving: true, error: null, successMessage: null })),
  on(CycleActions.saveEntrySuccess, (state, { cycle, message }) => ({
    ...state,
    saving: false,
    currentCycle: cycle,
    successMessage: message,
  })),
  on(CycleActions.saveEntryFailure, (state, { error }) => ({ ...state, saving: false, error })),
  on(CycleActions.loadRetrievalConfig, (state) => ({ ...state, loading: true })),
  on(CycleActions.loadRetrievalConfigSuccess, (state, { config }) => ({
    ...state,
    loading: false,
    retrievalConfig: config,
  })),
  on(CycleActions.loadRetrievalConfigFailure, (state, { error }) => ({ ...state, loading: false, error })),
  on(CycleActions.saveRetrieval, (state) => ({ ...state, saving: true, error: null })),
  on(CycleActions.saveRetrievalSuccess, (state, { cycle, message }) => ({
    ...state,
    saving: false,
    currentCycle: cycle,
    successMessage: message,
  })),
  on(CycleActions.saveRetrievalFailure, (state, { error }) => ({ ...state, saving: false, error })),
  on(CycleActions.clearMessages, (state) => ({ ...state, error: null, successMessage: null })),
  on(CycleActions.setCurrentCycle, (state, { cycle }) => ({ ...state, currentCycle: cycle }))
);
