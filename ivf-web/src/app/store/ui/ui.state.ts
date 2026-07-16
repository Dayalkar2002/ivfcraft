export interface UiState {
  globalLoading: boolean;
  loadingMessage: string;
}

export const initialUiState: UiState = {
  globalLoading: false,
  loadingMessage: 'Please wait...',
};
