export interface DemoSatellite {
  id: number;
  name: string;
  shortName: string;
}

export interface DemoPatient {
  id: number;
  uhid: string;
  name: string;
  partner: string;
  age: number;
  gender: string;
  aadhar: string;
  satelliteId: number;
  category: string;
  email: string;
  mobile: string;
  address: string;
  city: string;
}

export const DEMO_SATELLITES: DemoSatellite[] = [
  { id: 1, name: 'Main Clinic - Mumbai', shortName: 'MUM' },
  { id: 2, name: 'Satellite - Pune', shortName: 'PUN' },
];

export const DEMO_PATIENTS: DemoPatient[] = [
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

export function getDemoSatellites(): DemoSatellite[] {
  return DEMO_SATELLITES;
}

export function getDemoPatients(satelliteId?: number | string, search = ''): DemoPatient[] {
  const satId = Number(satelliteId) || 0;
  const q = String(search || '').trim().toLowerCase();
  return DEMO_PATIENTS.filter((p) => {
    if (satId && p.satelliteId !== satId) return false;
    if (!q) return true;
    const hay = [p.name, p.uhid, p.partner, p.mobile, String(p.id)].join(' ').toLowerCase();
    return hay.includes(q);
  });
}

export function getDemoPatientById(patientId: number | string, satelliteId?: number | string): DemoPatient | null {
  return (
    DEMO_PATIENTS.find(
      (p) => p.id === Number(patientId) && (!satelliteId || p.satelliteId === Number(satelliteId))
    ) || null
  );
}
