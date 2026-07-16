import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PatientState } from './patient.state';

export const selectPatientState = createFeatureSelector<PatientState>('patient');

export const selectSelectedPatient = createSelector(selectPatientState, (s) => s.selectedPatient);
export const selectSelectedSatellite = createSelector(selectPatientState, (s) => s.selectedSatellite);

/** Patient with satelliteId resolved from selected satellite clinic when missing on patient record */
export const selectPatientWithSatellite = createSelector(
  selectSelectedPatient,
  selectSelectedSatellite,
  (patient, satellite) => {
    if (!patient) return null;
    const satelliteId = patient.satelliteId || satellite?.id || 0;
    return { ...patient, satelliteId };
  }
);
export const selectPatients = createSelector(selectPatientState, (s) => s.patients);
export const selectSatellites = createSelector(selectPatientState, (s) => s.satellites);
export const selectPatientLoading = createSelector(selectPatientState, (s) => s.loading);
export const selectPatientError = createSelector(selectPatientState, (s) => s.error);
