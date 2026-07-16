import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Patient, Satellite } from '../../core/models';

export const PatientActions = createActionGroup({
  source: 'Patient',
  events: {
    'Load Satellites': emptyProps(),
    'Load Satellites Success': props<{ satellites: Satellite[] }>(),
    'Load Satellites Failure': props<{ error: string }>(),
    'Search Patients': props<{ search?: string; satelliteId?: number }>(),
    'Search Patients Success': props<{ patients: Patient[] }>(),
    'Search Patients Failure': props<{ error: string }>(),
    'Select Satellite': props<{ satellite: Satellite }>(),
    'Select Patient': props<{ patient: Patient }>(),
    'Clear Patient': emptyProps(),
  },
});
