'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@/contexts/auth-context';
import { fetchSatellites, searchPatients } from '@/lib/services/patients';
import type { Patient, Satellite } from '@/lib/types/patient';

interface PatientContextValue {
  selectedPatient: Patient | null;
  selectedSatellite: Satellite | null;
  satellites: Satellite[];
  patients: Patient[];
  loading: boolean;
  error: string | null;
  loadSatellites: () => Promise<void>;
  loadPatients: (satelliteId: number) => Promise<void>;
  selectSatellite: (satellite: Satellite) => void;
  selectPatient: (patient: Patient) => void;
  clearPatient: () => void;
}

const PatientContext = createContext<PatientContextValue | null>(null);

export function PatientProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedSatellite, setSelectedSatellite] = useState<Satellite | null>(null);
  const [satellites, setSatellites] = useState<Satellite[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSatellites = useCallback(async () => {
    if (!token) return;
    setError(null);
    try {
      const data = await fetchSatellites(token);
      setSatellites(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load satellites.');
    }
  }, [token]);

  const loadPatients = useCallback(
    async (satelliteId: number) => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const data = await searchPatients(token, satelliteId, '');
        setPatients(data);
      } catch (err) {
        setPatients([]);
        setError(err instanceof Error ? err.message : 'Failed to load patients.');
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const selectSatellite = useCallback((satellite: Satellite) => {
    setSelectedSatellite(satellite);
  }, []);

  const selectPatient = useCallback(
    (patient: Patient) => {
      setSelectedPatient({
        ...patient,
        satelliteId: patient.satelliteId || selectedSatellite?.id || 0,
      });
    },
    [selectedSatellite]
  );

  const clearPatient = useCallback(() => {
    setSelectedPatient(null);
  }, []);

  const value = useMemo(
    () => ({
      selectedPatient,
      selectedSatellite,
      satellites,
      patients,
      loading,
      error,
      loadSatellites,
      loadPatients,
      selectSatellite,
      selectPatient,
      clearPatient,
    }),
    [
      selectedPatient,
      selectedSatellite,
      satellites,
      patients,
      loading,
      error,
      loadSatellites,
      loadPatients,
      selectSatellite,
      selectPatient,
      clearPatient,
    ]
  );

  return <PatientContext.Provider value={value}>{children}</PatientContext.Provider>;
}

export function usePatient() {
  const ctx = useContext(PatientContext);
  if (!ctx) {
    throw new Error('usePatient must be used within PatientProvider');
  }
  return ctx;
}
