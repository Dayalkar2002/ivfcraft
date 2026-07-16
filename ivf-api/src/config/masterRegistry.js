/**
 * Master menu registry – mirrors PatMngtSys.master (.NET smART app).
 * column: 1–4 matches the four-column Master dropdown layout.
 */
const MASTER_REGISTRY = [
  { label: 'Allergies Master', type: 'common', catId: 12, column: 1 },
  { label: 'Catheter Master', type: 'common', catId: 9, column: 1 },
  { label: 'Contamination', type: 'common', catId: 27, column: 1 },
  { label: 'Donor Lab', type: 'donor-lab', column: 1 },
  { label: 'FSH Drug Master', type: 'common', catId: 14, column: 1 },
  { label: 'Indication Master', type: 'common', catId: 23, column: 1 },
  { label: 'Media Brand', type: 'common', catId: 28, column: 1 },
  { label: 'Out Come Drug Master', type: 'outcome-drug', column: 1 },
  { label: 'RefBy Master', type: 'common', catId: 21, column: 1 },
  { label: 'Termination Master', type: 'common', catId: 11, column: 1 },

  { label: 'Antagonist Master', type: 'common', catId: 18, column: 2 },
  { label: 'Clomiphena Master', type: 'common', catId: 17, column: 2 },
  { label: 'Diagnosis Master', type: 'common', catId: 20, column: 2 },
  { label: 'Findings', type: 'common', catId: 26, column: 2 },
  { label: 'Gas', type: 'common', catId: 31, column: 2 },
  { label: 'Lab Oper. Master', type: 'common', catId: 2, column: 2 },
  { label: 'Media Series', type: 'common', catId: 29, column: 2 },
  { label: 'Patient Master', type: 'patient', column: 2 },
  { label: 'Satellite Master', type: 'satellite', column: 2 },
  { label: 'User Master', type: 'user', column: 2 },

  { label: 'Appearance Master', type: 'common', catId: 4, column: 3 },
  { label: 'Coll Problem Master', type: 'common', catId: 24, column: 3 },
  { label: 'Doctor Master', type: 'doctor', column: 3 },
  { label: 'Form Master', type: 'common', catId: 1, column: 3 },
  { label: 'HMG Drug Master', type: 'common', catId: 15, column: 3 },
  { label: 'Linearity', type: 'common', catId: 25, column: 3 },
  { label: 'Method Master', type: 'common', catId: 3, column: 3 },
  { label: 'Patient Selection', type: 'patient-selection', column: 3 },
  { label: 'Sperm Id Master', type: 'common', catId: 22, column: 3 },
  { label: 'Viscosity Master', type: 'common', catId: 6, column: 3 },

  { label: 'AppointMents', type: 'appointments', column: 4 },
  { label: 'Colour Master', type: 'common', catId: 5, column: 4 },
  { label: 'Done By Master', type: 'common', catId: 10, column: 4 },
  { label: 'Fructose Master', type: 'common', catId: 8, column: 4 },
  { label: 'Incubator Used', type: 'common', catId: 30, column: 4 },
  { label: 'Liquefaction Master', type: 'common', catId: 7, column: 4 },
  { label: 'Other Master', type: 'common', catId: 19, column: 4 },
  { label: 'Personnel Master', type: 'common', catId: 16, column: 4 },
  { label: 'StimulProtocol Master', type: 'common', catId: 13, column: 4 },
];

function getMasterRoute(item) {
  switch (item.type) {
    case 'common':
      return `/masters/common/${item.catId}`;
    case 'patient':
      return '/masters/patient';
    case 'doctor':
      return '/masters/doctor';
    case 'satellite':
      return '/masters/satellite';
    case 'user':
      return '/masters/user';
    case 'donor-lab':
      return '/masters/donor-lab';
    case 'outcome-drug':
      return '/masters/outcome-drug';
    case 'appointments':
      return '/masters/appointments';
    case 'patient-selection':
      return '/masters/patient-selection';
    default:
      return '/masters';
  }
}

function getRegistryWithRoutes() {
  return MASTER_REGISTRY.map((item) => ({
    ...item,
    route: getMasterRoute(item),
  }));
}

function getCommonMasterByCatId(catId) {
  return MASTER_REGISTRY.find((item) => item.type === 'common' && item.catId === Number(catId));
}

module.exports = {
  MASTER_REGISTRY,
  getMasterRoute,
  getRegistryWithRoutes,
  getCommonMasterByCatId,
};
