import { createReducer, on } from '@ngrx/store';
import { PatientActions } from './patient.actions';
import { initialPatientState } from './patient.state';

export const patientReducer = createReducer(
  initialPatientState,
  on(PatientActions.loadSatellites, (state) => ({ ...state, loading: true })),
  on(PatientActions.loadSatellitesSuccess, (state, { satellites }) => ({
    ...state,
    satellites,
    loading: false,
  })),
  on(PatientActions.loadSatellitesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(PatientActions.searchPatients, (state) => ({ ...state, loading: true, error: null })),
  on(PatientActions.searchPatientsSuccess, (state, { patients }) => ({
    ...state,
    patients,
    loading: false,
  })),
  on(PatientActions.searchPatientsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(PatientActions.selectSatellite, (state, { satellite }) => ({
    ...state,
    selectedSatellite: satellite,
  })),
  on(PatientActions.selectPatient, (state, { patient }) => ({
    ...state,
    selectedPatient: patient,
  })),
  on(PatientActions.clearPatient, (state) => ({
    ...state,
    selectedPatient: null,
  }))
);
