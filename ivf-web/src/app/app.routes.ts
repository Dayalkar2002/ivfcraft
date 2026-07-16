import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';



export const routes: Routes = [

  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {

    path: 'login',

    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),

  },

  {

    path: '',

    canActivate: [authGuard],

    loadComponent: () => import('./layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),

    children: [

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      {

        path: 'dashboard',

        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),

      },

      {

        path: 'cycle',

        loadComponent: () => import('./features/cycle/cycle-entry/cycle-entry.component').then((m) => m.CycleEntryComponent),

      },

      {

        path: 'cycle/retrieval/:cycleId',

        loadComponent: () => import('./features/cycle/cycle-retrieval/cycle-retrieval.component').then((m) => m.CycleRetrievalComponent),

      },

      {
        path: 'iui',
        loadComponent: () => import('./features/iui/iui-list/iui-list.component').then((m) => m.IuiListComponent),
      },
      {
        path: 'iui/new',
        loadComponent: () => import('./features/iui/iui-entry/iui-entry.component').then((m) => m.IuiEntryComponent),
      },
      {
        path: 'iui/:iuiId',
        loadComponent: () => import('./features/iui/iui-entry/iui-entry.component').then((m) => m.IuiEntryComponent),
      },
      {
        path: 'ivf',
        loadComponent: () => import('./features/ivf/ivf-entry/ivf-entry.component').then((m) => m.IvfEntryComponent),
      },

      {
        path: 'icsi',
        loadComponent: () => import('./features/icsi/icsi-entry/icsi-entry.component').then((m) => m.IcsiEntryComponent),
      },

      {
        path: 'et',
        loadComponent: () => import('./features/et/et-entry/et-entry.component').then((m) => m.EtEntryComponent),
      },

      {
        path: 'bt',
        loadComponent: () => import('./features/bt/bt-entry/bt-entry.component').then((m) => m.BtEntryComponent),
      },

      {
        path: 'stats',
        loadComponent: () => import('./features/modules/module-page.component').then((m) => m.ModulePageComponent),
        data: { title: 'Stats', description: 'Statistics module from legacy smART — charts and cycle analytics.' },
      },
      {
        path: 'media',
        loadComponent: () => import('./features/modules/module-page.component').then((m) => m.ModulePageComponent),
        data: { title: 'Media', description: 'Media master module — MediaBrand.aspx / MediaSeries.aspx.' },
      },
      {
        path: 'cryo/semen-self',
        loadComponent: () => import('./features/modules/module-page.component').then((m) => m.ModulePageComponent),
        data: { title: 'Cryopreservation – Semen Self', description: 'Semen self cryopreservation — SemenSelf.aspx.' },
      },
      {
        path: 'cryo/semen-donor',
        loadComponent: () => import('./features/modules/module-page.component').then((m) => m.ModulePageComponent),
        data: { title: 'Cryopreservation – Semen Donor', description: 'Donor semen cryopreservation — DonorSemen.aspx.' },
      },
      {
        path: 'cryo/oocytes',
        loadComponent: () => import('./features/modules/module-page.component').then((m) => m.ModulePageComponent),
        data: { title: 'Cryopreservation – Oocytes', description: 'Oocyte cryopreservation module.' },
      },
      {
        path: 'cryo/embryos',
        loadComponent: () => import('./features/modules/module-page.component').then((m) => m.ModulePageComponent),
        data: { title: 'Cryopreservation – Embryos', description: 'Embryo cryopreservation module.' },
      },
      {
        path: 'sms',
        loadComponent: () => import('./features/modules/module-page.component').then((m) => m.ModulePageComponent),
        data: { title: 'SMS', description: 'Manual SMS module — ManualSMS.aspx.' },
      },
      {
        path: 'report-email',
        loadComponent: () => import('./features/modules/module-page.component').then((m) => m.ModulePageComponent),
        data: { title: 'Report Email', description: 'Report email module — ReportEmail.aspx.' },
      },
      {
        path: 'role-master',
        loadComponent: () => import('./features/modules/module-page.component').then((m) => m.ModulePageComponent),
        data: { title: 'Role Master', description: 'Role and permission master — RoleMaster.aspx.' },
      },
      {
        path: 'reports/consent-forms',
        loadComponent: () => import('./features/modules/module-page.component').then((m) => m.ModulePageComponent),
        data: { title: 'Consent Forms', description: 'Report viewer — RptConsentForms.aspx.' },
      },
      {
        path: 'reports/art-cycle',
        loadComponent: () => import('./features/modules/module-page.component').then((m) => m.ModulePageComponent),
        data: { title: 'ART Cycle Summary', description: 'Report viewer — rptARTCYCLESUMMARY.aspx.' },
      },
      {
        path: 'reports/qrcode-list',
        loadComponent: () => import('./features/modules/module-page.component').then((m) => m.ModulePageComponent),
        data: { title: 'QR Code List', description: 'Report viewer — QRCodeList.aspx.' },
      },
      {
        path: 'reports/passbook/semen-self',
        loadComponent: () => import('./features/modules/module-page.component').then((m) => m.ModulePageComponent),
        data: { title: 'Frozen Semen Self Passbook', description: 'Report viewer — rptSemonSelf.aspx.' },
      },
      {
        path: 'reports/passbook/semen-donor',
        loadComponent: () => import('./features/modules/module-page.component').then((m) => m.ModulePageComponent),
        data: { title: 'Frozen Semen Donor Passbook', description: 'Report viewer — rptSemonDonor.aspx.' },
      },
      {
        path: 'reports/passbook/oocytes',
        loadComponent: () => import('./features/modules/module-page.component').then((m) => m.ModulePageComponent),
        data: { title: 'Frozen Oocytes Passbook', description: 'Report viewer — rptEmbroys.aspx (Oocytes).' },
      },
      {
        path: 'reports/passbook/embryos-self',
        loadComponent: () => import('./features/modules/module-page.component').then((m) => m.ModulePageComponent),
        data: { title: 'Embryos – Self Passbook', description: 'Report viewer — rptEmbroys.aspx.' },
      },
      {
        path: 'reports/passbook/embryos-recipient',
        loadComponent: () => import('./features/modules/module-page.component').then((m) => m.ModulePageComponent),
        data: { title: 'Embryos Recipient / Donation', description: 'Report viewer — rptEmbroysRecipient.aspx.' },
      },
      {
        path: 'reports/passbook/oocytes-passbook',
        loadComponent: () => import('./features/modules/module-page.component').then((m) => m.ModulePageComponent),
        data: { title: 'Oocytes Passbook', description: 'Report viewer — RptOcytePassbook.' },
      },
      {
        path: 'reports/andrology/iui',
        loadComponent: () => import('./features/modules/module-page.component').then((m) => m.ModulePageComponent),
        data: { title: 'IUI Summary Report', description: 'Report viewer — RptIUISummary.aspx.' },
      },
      {
        path: 'reports/andrology/semen-self-freeze',
        loadComponent: () => import('./features/modules/module-page.component').then((m) => m.ModulePageComponent),
        data: { title: 'Semen Self Freeze Report', description: 'Report viewer — RptSemenSelfFreeze.aspx.' },
      },
      {
        path: 'reports/andrology/semen-valid-till',
        loadComponent: () => import('./features/modules/module-page.component').then((m) => m.ModulePageComponent),
        data: { title: 'Semen Self – Valid Till', description: 'Report viewer — RptSemenSelfFreezeValidTill.aspx.' },
      },
      {
        path: 'reports/statistics/fresh-cycles',
        loadComponent: () => import('./features/modules/module-page.component').then((m) => m.ModulePageComponent),
        data: { title: 'Fresh Cycles Statistics', description: 'Statistics report — fresh cycles.' },
      },
      {
        path: 'reports/statistics/frozen-cycles',
        loadComponent: () => import('./features/modules/module-page.component').then((m) => m.ModulePageComponent),
        data: { title: 'Frozen Cycles Statistics', description: 'Statistics report — frozen cycles.' },
      },
      {
        path: 'reports/pictures',
        loadComponent: () => import('./features/modules/module-page.component').then((m) => m.ModulePageComponent),
        data: { title: 'Pictures Report', description: 'Report viewer — RptEmbryosPictures.aspx.' },
      },

      {

        path: 'reports',

        loadComponent: () => import('./features/modules/module-page.component').then((m) => m.ModulePageComponent),

        data: { title: 'Reports', description: 'Select a report type from the top menu.' },

      },

      {

        path: 'reports/ivf-summary',

        loadComponent: () => import('./features/modules/module-page.component').then((m) => m.ModulePageComponent),

        data: { title: 'IVF Summary Report', description: 'Report viewer — spRptIVFSummary.' },

      },

      {

        path: 'reports/hsa-summary',

        loadComponent: () => import('./features/modules/module-page.component').then((m) => m.ModulePageComponent),

        data: { title: 'HSA Summary Report', description: 'Report viewer — spRptHSASummary.' },

      },

      {

        path: 'reports/embryo-pictures',

        loadComponent: () => import('./features/modules/module-page.component').then((m) => m.ModulePageComponent),

        data: { title: 'Embryo Pictures Report', description: 'Report viewer — embryo pictures module.' },

      },

      {

        path: 'masters',

        loadComponent: () => import('./features/masters/masters-hub/masters-hub.component').then((m) => m.MastersHubComponent),

      },

      {

        path: 'masters/common/:catId',

        loadComponent: () => import('./features/masters/common-master/common-master.component').then((m) => m.CommonMasterComponent),

      },

      {

        path: 'masters/patient',

        loadComponent: () => import('./features/masters/patient-master/patient-master.component').then((m) => m.PatientMasterComponent),

      },

      {

        path: 'masters/doctor',

        loadComponent: () => import('./features/masters/doctor-master/doctor-master.component').then((m) => m.DoctorMasterComponent),

      },

      {

        path: 'masters/satellite',

        loadComponent: () => import('./features/masters/satellite-master/satellite-master.component').then((m) => m.SatelliteMasterComponent),

      },

      {

        path: 'masters/user',

        loadComponent: () => import('./features/masters/user-master/user-master.component').then((m) => m.UserMasterComponent),

      },

      {

        path: 'masters/patient-selection',

        loadComponent: () => import('./features/masters/patient-selection/patient-selection.component').then((m) => m.PatientSelectionMasterComponent),

      },

      {

        path: 'masters/donor-lab',

        loadComponent: () => import('./features/modules/module-page.component').then((m) => m.ModulePageComponent),

        data: { title: 'Donor Lab', description: 'Donor lab master — spDonorLab.', note: 'API wiring for full CRUD is planned; use legacy app for advanced edits until then.' },

      },

      {

        path: 'masters/outcome-drug',

        loadComponent: () => import('./features/modules/module-page.component').then((m) => m.ModulePageComponent),

        data: { title: 'Out Come Drug Master', description: 'Outcome drug master module.', note: 'Dedicated page from legacy OutComeDrugMaster.aspx — API to be extended.' },

      },

      {

        path: 'masters/appointments',

        loadComponent: () => import('./features/modules/module-page.component').then((m) => m.ModulePageComponent),

        data: { title: 'Appointments', description: 'Appointment schedule — spActivityMaster / AppointMentSchedule.', note: 'Scheduling UI from legacy AppointMentSchedule.aspx — API to be extended.' },

      },

    ],

  },

  { path: '**', redirectTo: 'login' },

];

