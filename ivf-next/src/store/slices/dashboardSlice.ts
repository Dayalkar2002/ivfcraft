import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { DashboardSummary } from '@/lib/services/dashboard';

export interface DashboardState {
  summary: DashboardSummary | null;
  patientCount: number;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: DashboardState = {
  summary: null,
  patientCount: 0,
  loading: false,
  error: null,
  lastUpdated: null,
};

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setDashboardSummary: (state, action: PayloadAction<DashboardSummary>) => {
      state.summary = action.payload;
      state.lastUpdated = new Date().toISOString();
      state.loading = false;
      state.error = null;
    },
    setDashboardPatientCount: (state, action: PayloadAction<number>) => {
      state.patientCount = action.payload;
    },
    setDashboardLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setDashboardError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setDashboardSummary,
  setDashboardPatientCount,
  setDashboardLoading,
  setDashboardError,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
