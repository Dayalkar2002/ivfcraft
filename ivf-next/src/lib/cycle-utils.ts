export const CYCLE_TYPE_MAP: Record<string, Record<string, string>> = {
  self_oocyte: {
    husband_fresh: 'Conventional IVF (Self Oocyte + Husband Fresh)',
    husband_cryo: 'IVF with Frozen Husband Semen',
    donor_fresh: 'IVF (Self Oocyte + Donor Fresh Semen)',
    donor_cryo: 'IVF (Self Oocyte + Donor Cryo Semen)',
    surgical_fresh: 'ICSI with Surgical Sperm (Self Oocyte)',
    surgical_frozen: 'ICSI with Frozen Surgical Sperm (Self Oocyte)',
  },
  donor_oocyte: {
    husband_fresh: 'Donor Oocyte + Husband Fresh',
    husband_cryo: 'Donor Oocyte + Husband Cryo',
    donor_fresh: 'Donor Oocyte + Donor Fresh Semen',
    donor_cryo: 'Donor Oocyte + Donor Cryo Semen',
    surgical_fresh: 'Donor Oocyte + Surgical Sperm',
    surgical_frozen: 'Donor Oocyte + Frozen Surgical Sperm',
  },
  oocyte_recipient: {
    husband_fresh: 'Oocyte Recipient + Husband Fresh',
    husband_cryo: 'Oocyte Recipient + Husband Cryo',
    donor_fresh: 'Oocyte Recipient + Donor Fresh Semen',
    donor_cryo: 'Oocyte Recipient + Donor Cryo Semen',
    surgical_fresh: 'Oocyte Recipient + Surgical Sperm',
    surgical_frozen: 'Oocyte Recipient + Frozen Surgical Sperm',
  },
  embryo_recipient: {
    husband_fresh: 'Embryo Recipient Cycle',
    husband_cryo: 'Embryo Recipient Cycle (Husband Cryo)',
    donor_fresh: 'Embryo Recipient Cycle (Donor Semen)',
    donor_cryo: 'Embryo Recipient Cycle (Donor Cryo)',
    surgical_fresh: 'Embryo Recipient Cycle (Surgical Sperm)',
    surgical_frozen: 'Embryo Recipient Cycle (Frozen Surgical)',
  },
};

export function computeCycleType(oocyteSource: string, semenSource: string): string {
  return CYCLE_TYPE_MAP[oocyteSource]?.[semenSource] ?? 'Unknown Cycle Type';
}

export function showDonorOocyteDetails(oocyteSource: string): boolean {
  return oocyteSource === 'donor_oocyte';
}

export function showOocyteRecipientDetails(oocyteSource: string): boolean {
  return oocyteSource === 'oocyte_recipient';
}

export function showEmbryoRecipientDetails(oocyteSource: string): boolean {
  return oocyteSource === 'embryo_recipient';
}

export function showSemenDonorDetails(semenSource: string): boolean {
  return ['husband_cryo', 'donor_fresh', 'donor_cryo', 'surgical_frozen'].includes(semenSource);
}
