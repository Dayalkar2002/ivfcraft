import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Patient, Satellite } from '@/lib/types/patient';

export interface PatientState {
  selectedPatient: Patient | null;
  selectedSatellite: Satellite | null;
  satellites: Satellite[];
  patients: Patient[];
  loading: boolean;
  error: string | null;
}

const initialState: PatientState = {
  selectedPatient: null,
  selectedSatellite: null,
  satellites: [],
  patients: [],
  loading: false,
  error: null,
};

export const patientSlice = createSlice({
  name: 'patient',
  initialState,
  reducers: {
    setSelectedPatient: (state, action: PayloadAction<Patient | null>) => {
      state.selectedPatient = action.payload;
    },
    setSelectedSatellite: (state, action: PayloadAction<Satellite | null>) => {
      state.selectedSatellite = action.payload;
    },
    setSatellites: (state, action: PayloadAction<Satellite[]>) => {
      state.satellites = action.payload;
    },
    setPatients: (state, action: PayloadAction<Patient[]>) => {
      state.patients = action.payload;
    },
    setPatientLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setPatientError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearSelectedPatient: (state) => {
      state.selectedPatient = null;
    },
  },
});

export const {
  setSelectedPatient,
  setSelectedSatellite,
  setSatellites,
  setPatients,
  setPatientLoading,
  setPatientError,
  clearSelectedPatient,
} = patientSlice.actions;

export default patientSlice.reducer;
