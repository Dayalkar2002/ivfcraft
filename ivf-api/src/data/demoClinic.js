/** Offline demo clinic data when SQL Server is unreachable. */

const DEMO_SATELLITES = [
  { id: 1, name: 'Main Clinic - Mumbai', shortName: 'MUM' },
  { id: 2, name: 'Satellite - Pune', shortName: 'PUN' },
];

const DEMO_PATIENTS = [
  {
    id: 101,
    uhid: 'UHID-1001',
    name: 'Priya Sharma',
    partner: 'Rahul Sharma',
    age: 32,
    gender: 'F',
    aadhar: '',
    satelliteId: 1,
    category: 'Self',
    email: 'priya.demo@example.com',
    mobile: '9876543210',
    address: 'Andheri West',
    city: 'Mumbai',
  },
  {
    id: 102,
    uhid: 'UHID-1002',
    name: 'Ananya Patel',
    partner: 'Karan Patel',
    age: 29,
    gender: 'F',
    aadhar: '',
    satelliteId: 1,
    category: 'Self',
    email: '',
    mobile: '9876501234',
    address: 'Bandra',
    city: 'Mumbai',
  },
  {
    id: 201,
    uhid: 'UHID-2001',
    name: 'Meera Joshi',
    partner: 'Amit Joshi',
    age: 34,
    gender: 'F',
    aadhar: '',
    satelliteId: 2,
    category: 'Recipient',
    email: '',
    mobile: '9123456780',
    address: 'Kothrud',
    city: 'Pune',
  },
];

function getDemoSatellites() {
  return DEMO_SATELLITES;
}

function getDemoPatients(satelliteId, search = '') {
  const satId = Number(satelliteId) || 0;
  const q = String(search || '').trim().toLowerCase();
  return DEMO_PATIENTS.filter((p) => {
    if (satId && p.satelliteId !== satId) return false;
    if (!q) return true;
    const hay = [p.name, p.uhid, p.partner, p.mobile, String(p.id)].join(' ').toLowerCase();
    return hay.includes(q);
  });
}

function getDemoPatientById(patientId, satelliteId) {
  return (
    DEMO_PATIENTS.find(
      (p) => p.id === Number(patientId) && (!satelliteId || p.satelliteId === Number(satelliteId))
    ) || null
  );
}

module.exports = {
  getDemoSatellites,
  getDemoPatients,
  getDemoPatientById,
};
