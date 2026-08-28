export interface NavMenuItem {
  label: string;
  route: string;
  icon?: string;
}

export interface NavMenuGroup {
  label: string;
  items: NavMenuItem[];
}

export interface TopNavMenu {
  label: string;
  route?: string;
  icon?: string;
  items?: NavMenuItem[];
  groups?: NavMenuGroup[];
  columns?: MasterMenuItem[][];
}

export interface SideNavSection {
  title: string;
  icon?: string;
  standalone?: boolean;
  flat?: boolean;
  items: NavMenuItem[];
}

export type MasterType =
  | 'common'
  | 'patient'
  | 'doctor'
  | 'satellite'
  | 'user'
  | 'donor-lab'
  | 'outcome-drug'
  | 'appointments'
  | 'patient-selection';

export interface MasterMenuItem {
  label: string;
  type: MasterType;
  catId?: number;
  column: 1 | 2 | 3 | 4;
  route: string;
}

function routeFor(item: Omit<MasterMenuItem, 'route'>): string {
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
      return '/dashboard?selectPatient=1';
    default:
      return '/masters';
  }
}

const RAW_REGISTRY: Omit<MasterMenuItem, 'route'>[] = [
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

export const MASTER_REGISTRY: MasterMenuItem[] = RAW_REGISTRY.map((item) => ({
  ...item,
  route: routeFor(item),
}));

export function getMasterColumns(): MasterMenuItem[][] {
  return [1, 2, 3, 4].map((col) => MASTER_REGISTRY.filter((item) => item.column === col));
}

export function getCommonMasterLabel(catId: number): string {
  return MASTER_REGISTRY.find((item) => item.type === 'common' && item.catId === catId)?.label ?? 'Common Master';
}

export const REPORT_MENU_GROUPS: NavMenuGroup[] = [
  {
    label: 'Documents & Summary',
    items: [
      { label: 'Documents', route: '/reports/consent-forms' },
      { label: 'ART Cycle', route: '/reports/art-cycle' },
      { label: 'QR Code List', route: '/reports/qrcode-list' },
      { label: 'IVF Summary', route: '/reports/ivf-summary' },
      { label: 'HSA Summary', route: '/reports/hsa-summary' },
      { label: 'Embryo Pictures', route: '/reports/embryo-pictures' },
    ],
  },
  {
    label: 'Passbook',
    items: [
      { label: 'Frozen Semen Self', route: '/reports/passbook/semen-self' },
      { label: 'Frozen Semen Donor', route: '/reports/passbook/semen-donor' },
      { label: 'Frozen Oocytes', route: '/reports/passbook/oocytes' },
      { label: 'Embryos – Self', route: '/reports/passbook/embryos-self' },
      { label: 'Embryos Recipient / Donation', route: '/reports/passbook/embryos-recipient' },
      { label: 'Oocytes Passbook', route: '/reports/passbook/oocytes-passbook' },
    ],
  },
  {
    label: 'Andrology',
    items: [
      { label: 'IUI Summary', route: '/reports/andrology/iui' },
      { label: 'Semen Self Freeze', route: '/reports/andrology/semen-self-freeze' },
      { label: 'Semen Self – Valid Till', route: '/reports/andrology/semen-valid-till' },
    ],
  },
  {
    label: 'Statistics & Pictures',
    items: [
      { label: 'Fresh Cycles', route: '/reports/statistics/fresh-cycles' },
      { label: 'Frozen Cycles', route: '/reports/statistics/frozen-cycles' },
      { label: 'Pictures', route: '/reports/pictures' },
    ],
  },
];

export const TOP_NAV_MENUS: TopNavMenu[] = [
  { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
  { label: 'Master', icon: 'masters', columns: getMasterColumns() },
  { label: 'Cycle', route: '/cycle/entry', icon: 'cycle' },
  { label: 'Report', icon: 'reports', groups: REPORT_MENU_GROUPS },
];

export const SIDE_NAV_SECTIONS: SideNavSection[] = [
  {
    title: 'Dashboard',
    standalone: true,
    items: [{ label: 'Dashboard', route: '/dashboard', icon: 'dashboard' }],
  },
  {
    title: 'Patient Management',
    icon: 'patient',
    items: [
      { label: 'Patient Master', route: '/masters/patient', icon: 'patient' },
      { label: 'Select Patient', route: '/dashboard?selectPatient=1', icon: 'patient' },
    ],
  },
  {
    title: 'Clinical Modules',
    flat: true,
    items: [
      { label: 'IUI', route: '/iui', icon: 'iui' },
      { label: 'Cycle Entry', route: '/cycle/entry', icon: 'cycle' },
      { label: 'IVF', route: '/ivf', icon: 'ivf' },
      { label: 'ICSI', route: '/icsi', icon: 'icsi' },
      { label: 'ET', route: '/et', icon: 'et' },
      { label: 'BT', route: '/bt', icon: 'bt' },
    ],
  },
  {
    title: 'Cryopreservation',
    icon: 'cryo',
    items: [
      { label: 'Semen – Self', route: '/cryo/semen-self', icon: 'cryo' },
      { label: 'Semen – Donor', route: '/cryo/semen-donor', icon: 'cryo' },
      { label: 'Oocytes', route: '/cryo/oocytes', icon: 'cryo' },
      { label: 'Embryos', route: '/cryo/embryos', icon: 'cryo' },
    ],
  },
  {
    title: 'Operations',
    flat: true,
    items: [
      { label: 'Stats', route: '/stats', icon: 'inventory' },
      { label: 'Media', route: '/media', icon: 'media' },
      { label: 'SMS', route: '/sms', icon: 'sms' },
      { label: 'Report Email', route: '/report-email', icon: 'billing' },
      { label: 'Role Master', route: '/role-master', icon: 'users' },
    ],
  },
  {
    title: 'Administration',
    flat: true,
    items: [
      { label: 'Users', route: '/masters/user', icon: 'users' },
      { label: 'Masters Hub', route: '/masters', icon: 'settings' },
    ],
  },
];
