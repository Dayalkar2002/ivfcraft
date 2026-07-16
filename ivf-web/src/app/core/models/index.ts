export interface User {
  id: number;
  userLoginName: string;
  userName: string;
  roleId: number;
  roleName: string;
}

export interface Patient {
  id: number;
  uhid: string;
  name: string;
  partner: string;
  age: number;
  gender: string;
  aadhar: string;
  satelliteId: number;
  category?: string;
  isOocyteDonor?: boolean;
  lockedRecipients?: LockedRecipient[];
  receivedFromDonorId?: number;
}

export interface LockedRecipient {
  recipientId: number;
  recipientName: string;
  cycleId: string;
}

export interface Satellite {
  id: number;
  name: string;
}

export interface CycleEntry {
  cycleId?: string;
  patientId: number;
  satelliteId?: number;
  oocyteSource: string;
  semenSource: string;
  cycleDate?: string;
  cycleType?: string;
  donorOocyteDetails?: DonorOocyteDetails | null;
  oocyteRecipientDetails?: OocyteRecipientDetails | null;
  embryoRecipientDetails?: EmbryoRecipientDetails | null;
  semenDonorDetails?: SemenDonorDetails | null;
  retrievalSections?: RetrievalSections;
  status?: string;
}

export interface DonorOocyteDetails {
  donorId: string;
  donorName: string;
  oocyteCount: number;
  recipientCount?: number;
  recipientIds?: number[];
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
  leftOvary?: number;
  rightOvary?: number;
  ivf?: number;
  icsi?: number;
  gift?: number;
  zift?: number;
  damaged?: number;
  total?: number;
  recipientPatientId?: number;
  recipientCycleId?: string;
  donorPatientId?: number;
}

export interface RetrievalData {
  selfToSelf?: RetrievalRow[];
  selfToRecipient?: RetrievalRow[];
  donorToSelf?: RetrievalRow[];
  donorToRecipient?: RetrievalRow[];
  embryoRecipient?: RetrievalRow[];
}

export interface SourceOption {
  id: string;
  label: string;
  description: string;
}
