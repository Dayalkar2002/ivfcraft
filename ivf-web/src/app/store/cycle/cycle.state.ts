import { CycleEntry, RetrievalData, RetrievalSections, SourceOption } from '../../core/models';

export interface CycleState {
  oocyteSources: SourceOption[];
  semenSources: SourceOption[];
  currentCycle: CycleEntry | null;
  cycleType: string;
  retrievalConfig: {
    sections: RetrievalSections;
    existingRetrieval: RetrievalData | null;
    availableRecipients: { id: number; name: string; uhid: string; aadhar?: string }[];
    lockedRecipients: {
      recipientId: number;
      recipientName: string;
      recipientAadhar?: string;
      cycleId: string;
    }[];
    donorAadhar?: string;
  } | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  successMessage: string | null;
}

export const initialCycleState: CycleState = {
  oocyteSources: [],
  semenSources: [],
  currentCycle: null,
  cycleType: '',
  retrievalConfig: null,
  loading: false,
  saving: false,
  error: null,
  successMessage: null,
};
