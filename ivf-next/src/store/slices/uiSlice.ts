import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UiState {
  sidebarOpen: boolean;
  showPatientModal: boolean;
  showLogoutModal: boolean;
  activeCycleTab?: string;
}

const initialState: UiState = {
  sidebarOpen: true,
  showPatientModal: false,
  showLogoutModal: false,
  activeCycleTab: 'overview',
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setShowPatientModal: (state, action: PayloadAction<boolean>) => {
      state.showPatientModal = action.payload;
    },
    setShowLogoutModal: (state, action: PayloadAction<boolean>) => {
      state.showLogoutModal = action.payload;
    },
    setActiveCycleTab: (state, action: PayloadAction<string>) => {
      state.activeCycleTab = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setShowPatientModal,
  setShowLogoutModal,
  setActiveCycleTab,
} = uiSlice.actions;

export default uiSlice.reducer;
