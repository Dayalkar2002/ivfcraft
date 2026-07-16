// In-memory cycle data until cycle SPs are wired (spCycRetrieval, etc.)
const users = [];

const satellites = [
  { id: 1, name: 'Main Clinic - Mumbai' },
  { id: 2, name: 'Satellite - Pune' },
];

const patients = [];

let cycles = [];
let cycleCounter = 161;

const cycleTypeMatrix = {
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

function resolveCycleType(oocyteSource, semenSource) {
  return cycleTypeMatrix[oocyteSource]?.[semenSource] || 'Unknown Cycle Type';
}

function nextCycleId() {
  cycleCounter += 1;
  return `Cyc${cycleCounter}`;
}

module.exports = {
  users,
  satellites,
  patients,
  cycles,
  setCycles: (value) => {
    cycles = value;
  },
  getCycles: () => cycles,
  resolveCycleType,
  nextCycleId,
};
