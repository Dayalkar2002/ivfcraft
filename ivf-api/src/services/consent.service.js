const { executeDRL, buildParams } = require('../db/spExecutor');
const patientService = require('./patient.service');

const PRESETS = [
  { id: '1', title: 'Self Oocytes + Husband Sample + Self ET + Embryo Freezing', art: '6,9,12,14B,18', icmr: 'I', pcpndt: 'D' },
  { id: '2', title: 'Self Oocytes + Husband Sample + NO ET + Freeze All', art: '6,9,12,14B,18', icmr: 'I', pcpndt: 'D' },
  { id: '3', title: 'Self Oocytes + Husband Sample + FET', art: '6,9,12,14B,18', icmr: 'I', pcpndt: 'D', misc: 'Thaw Sheet' },
  { id: '4', title: 'Self Oocyte Freezing', art: '6,10,12', icmr: 'I', pcpndt: 'D' },
  { id: '5', title: 'Self Oocyte Thaw + Husband Sample + Self ET', art: '6', icmr: 'I', pcpndt: 'D', misc: 'Thaw Sheet' },
  { id: '6', title: 'Self Oocytes Thaw + Donor Sample + ET', art: '6,8', icmr: 'I', pcpndt: 'D', misc: 'Thaw Sheet' },
  { id: '7', title: 'Oocyte Donor', art: '12,13', icmr: 'I', pcpndt: 'D' },
  { id: '8', title: 'Donor Oocyte Freezing', art: '6,10', icmr: 'I', pcpndt: 'D' },
  { id: '9', title: 'Oocyte Recipient', art: '6,9,AFFIDAVIT', icmr: 'I', pcpndt: 'D' },
  { id: '10', title: 'Donor Oocyte Thaw + Donor Sample + ET Recipient', art: '6,8', icmr: 'I', pcpndt: 'D', misc: 'Thaw Sheet' },
  { id: '11', title: 'Donor Oocyte Thaw + Husband Sample + ET Recipient', art: '6,8', icmr: 'I', pcpndt: 'D', misc: 'Thaw Sheet' },
];

const FORM_GROUPS = [
  {
    id: 'art',
    label: 'ART Act Forms',
    forms: [
      { id: '6', label: 'Form 6 – Consent for ART' },
      { id: '8', label: 'Form 8 – Donor Semen Consent' },
      { id: '9', label: 'Form 9 – Embryo Transfer' },
      { id: '10', label: 'Form 10 – Oocyte Freezing' },
      { id: '12', label: 'Form 12 – Cryopreservation' },
      { id: '13', label: 'Form 13 – Oocyte Donor' },
      { id: '14B', label: 'Form 14B – Embryo Freezing' },
      { id: '18', label: 'Form 18 – Additional Consent' },
      { id: 'AFFIDAVIT', label: 'Affidavit' },
    ],
  },
  {
    id: 'icmr',
    label: 'ICMR Forms',
    forms: [{ id: 'I', label: 'ICMR Consent Pack' }],
  },
  {
    id: 'pcpndt',
    label: 'PCPNDT Forms',
    forms: [{ id: 'D', label: 'PCPNDT Form D' }],
  },
  {
    id: 'misc',
    label: 'Additional',
    forms: [{ id: 'Thaw Sheet', label: 'Thaw Sheet' }],
  },
];

function getPresets() {
  return PRESETS;
}

function getFormGroups() {
  return FORM_GROUPS;
}

function resolvePreset(presetId) {
  const preset = PRESETS.find((p) => p.id === String(presetId));
  if (!preset) return null;
  const selected = [
    ...(preset.art || '').split(',').map((s) => s.trim()).filter(Boolean),
    ...(preset.icmr || '').split(',').map((s) => s.trim()).filter(Boolean),
    ...(preset.pcpndt || '').split(',').map((s) => s.trim()).filter(Boolean),
    ...(preset.misc || '').split(',').map((s) => s.trim()).filter(Boolean),
  ];
  return { ...preset, selected };
}

async function searchConsentPatients({ search = '', satelliteId = 0 }) {
  return patientService.searchPatients({ search, satelliteId });
}

async function getPatientConsentContext({ patId, satId }) {
  const patient = await patientService.getPatientById(Number(patId), Number(satId));
  if (!patient) return null;

  let cycles = [];
  try {
    const result = await executeDRL(
      'spCycOutComeExtDRL',
      buildParams('@PatID,@SatID,@QueryIndex,@UserId', [Number(patId), Number(satId), 1, 0])
    );
    cycles = (result.recordset || []).slice(0, 20).map((row) => ({
      id: row.CycID ?? row.CycleID ?? '',
      date: row.CycDateOfCreation ?? row.CycDate ?? null,
      type: row.CycType ?? row.CycleType ?? '',
    }));
  } catch {
    cycles = [];
  }

  return {
    patient: {
      id: patient.id,
      name: patient.name,
      partner: patient.partner,
      uhid: patient.uhid,
      age: patient.age,
      aadhar: patient.aadhar,
      mobile: patient.mobile,
      email: patient.email,
      address: patient.address,
      city: patient.city,
      category: patient.category,
      satelliteId: patient.satelliteId,
    },
    cycles,
    clinic: {
      name: process.env.CONSENT_CLINIC_NAME || 'IVF Clinic',
      address: process.env.CONSENT_CLINIC_ADDRESS || '',
      consultant1: process.env.CONSENT_CONSULTANT1 || '',
      consultant2: process.env.CONSENT_CONSULTANT2 || '',
    },
  };
}

module.exports = {
  getPresets,
  getFormGroups,
  resolvePreset,
  searchConsentPatients,
  getPatientConsentContext,
};
