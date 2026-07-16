import { Patient, Satellite } from '../../core/models';

export interface PatientState {
  selectedPatient: Patient | null;
  selectedSatellite: Satellite | null;
  patients: Patient[];
  satellites: Satellite[];
  loading: boolean;
  error: string | null;
}

export const initialPatientState: PatientState = {
  selectedPatient: null,
  selectedSatellite: null,
  patients: [],
  satellites: [],
  loading: false,
  error: null,
};
