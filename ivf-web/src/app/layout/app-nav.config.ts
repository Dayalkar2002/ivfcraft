import { getMasterColumns, MasterMenuItem } from '../features/masters/master-registry';

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
  { label: 'Cycle', route: '/cycle', icon: 'cycle' },
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
      { label: 'Select Patient', route: '/masters/patient-selection', icon: 'patient' },
    ],
  },
  {
    title: 'Clinical Modules',
    flat: true,
    items: [
      { label: 'IUI', route: '/iui', icon: 'iui' },
      { label: 'Cycle Entry', route: '/cycle', icon: 'cycle' },
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
      { label: 'Inventory', route: '/stats', icon: 'inventory' },
      { label: 'Billing', route: '/report-email', icon: 'billing' },
    ],
  },
  {
    title: 'Administration',
    flat: true,
    items: [
      { label: 'Users', route: '/masters/user', icon: 'users' },
      { label: 'Settings', route: '/masters', icon: 'settings' },
    ],
  },
];
