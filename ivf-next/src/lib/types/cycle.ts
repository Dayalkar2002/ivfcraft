import type { Patient } from '@/lib/types/patient';

export interface SourceOption {
  id: string;
  label: string;
  description: string;
}

export interface DonorOocyteDetails {
  donorId: string;
  donorName: string;
  oocyteCount: number;
  recipientCount?: number;
}

export interface OocyteRecipientDetails {
  receivedFromDonorId: string;
  donorName: string;
  oocyteCount: number;
}

export interface EmbryoRecipientDetails {
  embryoDonorCoupleId: string;
  donorCoupleName: string;
  embryoBatchNo: string;
  oocyteDonorId?: string;
  semenDonorId?: string;
}

export interface SemenDonorDetails {
  donorSemenId: string;
  cryoStrawNo: string;
  freezingDate: string;
}

export interface CycleEntryPayload {
  patientId: number;
  satelliteId: number;
  oocyteSource: string;
  semenSource: string;
  cycleDate?: string;
  donorOocyteDetails?: DonorOocyteDetails | null;
  oocyteRecipientDetails?: OocyteRecipientDetails | null;
  embryoRecipientDetails?: EmbryoRecipientDetails | null;
  semenDonorDetails?: SemenDonorDetails | null;
}

export interface CycleEntry extends CycleEntryPayload {
  cycleId?: string;
  patientName?: string;
  uhid?: string;
  cycleType?: string;
  status?: string;
}

export interface RetrievalSections {
  showSelfToSelf: boolean;
  showSelfToRecipient: boolean;
  showDonorToSelf: boolean;
  showDonorToRecipient: boolean;
  showEmbryoRecipient: boolean;
  lockOocyteDonation: boolean;
  lockSemenCryo: boolean;
  showOocyteReceivedFrom: boolean;
  showSemenSampleId: boolean;
}

export interface RetrievalRow {
  leftOvary?: number | null;
  rightOvary?: number | null;
  ivf?: number | null;
  icsi?: number | null;
  gift?: number | null;
  zift?: number | null;
  damaged?: number | null;
  total?: number | null;
  recipientPatientId?: number | null;
  recipientCycleId?: string;
}

export interface RetrievalData {
  selfToSelf?: RetrievalRow[];
  donorToRecipient?: RetrievalRow[];
}

export interface RetrievalConfig {
  cycle: CycleEntry;
  sections: RetrievalSections;
  patient: Patient | null;
  availableRecipients: { id: number; name: string; uhid: string; aadhar?: string }[];
  lockedRecipients: {
    recipientId: number;
    recipientName: string;
    recipientAadhar?: string;
    cycleId: string;
  }[];
  donorAadhar: string;
  existingRetrieval: RetrievalData | null;
}

export interface DonorAadharCheck {
  donorAadhar: string;
  recipientAadhar: string;
  message: string;
  isAllowed: boolean;
}
