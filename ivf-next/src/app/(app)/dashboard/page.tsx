'use client';

import Link from 'next/link';
import { NavIcon } from '@/components/nav-icons';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Top Header Title & Date Widget */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="mt-0.5 text-sm text-slate-600">
            Welcome, <span className="font-bold text-[#6b46c1]">Dr. Admin</span>. Here is your IVF lab overview for today.
          </p>
        </div>

        {/* Date & Time Widget */}
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-[#6b46c1]">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">
              22 May 2025 <span className="text-slate-400 font-normal">|</span> Thursday
            </div>
            <div className="text-[11px] font-semibold text-slate-500">02:45 PM</div>
          </div>
        </div>
      </div>

      {/* Top 6 Metric Cards Row */}
      <div className="grid grid-cols-2 gap-4.5 sm:grid-cols-3 xl:grid-cols-6">
        {[
          {
            title: 'Total Patients',
            count: '256',
            sub: 'All Time',
            icon: 'patient',
            bg: 'bg-purple-100',
            color: 'text-[#6b46c1]',
          },
          {
            title: 'Active Cycles',
            count: '42',
            sub: 'In Progress',
            icon: 'cycle',
            bg: 'bg-blue-100',
            color: 'text-blue-600',
          },
          {
            title: 'Oocytes Retrieved',
            count: '67',
            sub: 'Today',
            icon: 'flask',
            bg: 'bg-emerald-100',
            color: 'text-emerald-600',
          },
          {
            title: 'Embryos Created',
            count: '58',
            sub: 'Today',
            icon: 'embryo',
            bg: 'bg-pink-100',
            color: 'text-pink-600',
          },
          {
            title: 'Cryostored Units',
            count: '1,245',
            sub: 'Total',
            icon: 'cryo',
            bg: 'bg-amber-100',
            color: 'text-amber-600',
          },
          {
            title: 'Witness Events',
            count: '152',
            sub: 'Today',
            icon: 'witness',
            bg: 'bg-teal-100',
            color: 'text-teal-600',
          },
        ].map((card) => (
          <div
            key={card.title}
            className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${card.bg} ${card.color}`}>
              <NavIcon name={card.icon} className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-500">{card.title}</div>
              <div className="text-2xl font-black text-slate-900 leading-none my-0.5">
                {card.count}
              </div>
              <div className="text-[10px] font-medium text-slate-400">{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid Section (Quick Access + Right Column) */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Access Modules (Left 2/3 Grid) */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Quick Access Modules
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {[
              { label: 'Patient Management', icon: 'patient', href: '/masters/patient', bg: 'bg-purple-100', color: 'text-[#6b46c1]' },
              { label: 'Cycle Management', icon: 'cycle', href: '/cycle/entry', bg: 'bg-blue-100', color: 'text-blue-600' },
              { label: 'Sperm Management', icon: 'sperm', href: '/iui', bg: 'bg-teal-100', color: 'text-teal-600' },
              { label: 'Oocyte Management', icon: 'oocyte', href: '/ivf', bg: 'bg-pink-100', color: 'text-pink-600' },
              { label: 'Embryo Management', icon: 'embryo', href: '/icsi', bg: 'bg-purple-100', color: 'text-purple-600' },
              { label: 'Cryopreservation', icon: 'cryo', href: '/cryo/embryos', bg: 'bg-sky-100', color: 'text-sky-600' },
              { label: 'Witness System', icon: 'witness', href: '/witness', bg: 'bg-emerald-100', color: 'text-emerald-600' },
              { label: 'Lab Inventory', icon: 'inventory', href: '/inventory', bg: 'bg-amber-100', color: 'text-amber-600' },
              { label: 'Reports & Analytics', icon: 'reports', href: '/reports', bg: 'bg-indigo-100', color: 'text-indigo-600' },
              { label: 'Audit Trails', icon: 'audit', href: '/audit', bg: 'bg-blue-100', color: 'text-blue-600' },
              { label: 'Label Printing', icon: 'label', href: '/label-printing', bg: 'bg-rose-100', color: 'text-rose-600' },
              { label: 'Smart Card / Access', icon: 'smartcard', href: '/smartcard', bg: 'bg-teal-100', color: 'text-teal-600' },
            ].map((module) => (
              <Link
                key={module.label}
                href={module.href}
                className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white p-4 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${module.bg} ${module.color}`}>
                  <NavIcon name={module.icon} className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold text-slate-800 leading-tight">
                  {module.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Today's Schedule & System Alerts (Right 1/3 Column) */}
        <div className="space-y-4">
          {/* Today's Schedule Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-bold text-slate-900">
              Today's Schedule
            </h2>
            <div className="space-y-2.5">
              {[
                { time: '09:00 AM', title: 'Oocyte Retrieval', count: '2 Cycles' },
                { time: '10:30 AM', title: 'ICSI', count: '3 Cycles' },
                { time: '01:00 PM', title: 'Embryo Transfer', count: '2 Cycles' },
                { time: '03:00 PM', title: 'Embryo Evaluation', count: '4 Cycles' },
                { time: '05:00 PM', title: 'Cryopreservation', count: '1 Cycle' },
              ].map((item) => (
                <div
                  key={item.time + item.title}
                  className="flex items-center justify-between border-b border-slate-100 pb-2 text-xs last:border-0 last:pb-0"
                >
                  <span className="font-semibold text-slate-500">{item.time}</span>
                  <span className="font-bold text-slate-800">{item.title}</span>
                  <span className="font-semibold text-slate-500">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* System Alerts Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-bold text-slate-900">
              System Alerts
            </h2>
            <div className="space-y-3">
              {[
                { label: 'Low Inventory: Cryo Box', badge: '2' },
                { label: 'Label Printer: Ribbon Low', badge: '1' },
                { label: 'Witness Pending', badge: '3' },
              ].map((alert) => (
                <div key={alert.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L1 21h22L12 2zm0 3.5L20.5 19h-17L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z" />
                    </svg>
                    <span className="text-xs font-semibold text-slate-800">{alert.label}</span>
                  </div>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white">
                    {alert.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Analytics Row (3 Columns) */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Card 1: Cycle Status Overview (Donut Chart) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-slate-900">
            Cycle Status Overview
          </h2>
          <div className="flex items-center justify-between">
            {/* Donut SVG */}
            <div className="relative flex h-36 w-36 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14.5" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                {/* Blue segment: 50% */}
                <circle cx="18" cy="18" r="14.5" fill="none" stroke="#2563eb" strokeWidth="4" strokeDasharray="45.5 91" strokeDashoffset="0" />
                {/* Green segment: 24% */}
                <circle cx="18" cy="18" r="14.5" fill="none" stroke="#16a34a" strokeWidth="4" strokeDasharray="21.8 91" strokeDashoffset="-45.5" />
                {/* Orange segment: 14% */}
                <circle cx="18" cy="18" r="14.5" fill="none" stroke="#ea580c" strokeWidth="4" strokeDasharray="12.7 91" strokeDashoffset="-67.3" />
                {/* Purple segment: 7% */}
                <circle cx="18" cy="18" r="14.5" fill="none" stroke="#6b46c1" strokeWidth="4" strokeDasharray="6.4 91" strokeDashoffset="-80" />
                {/* Teal segment: 5% */}
                <circle cx="18" cy="18" r="14.5" fill="none" stroke="#0d9488" strokeWidth="4" strokeDasharray="4.6 91" strokeDashoffset="-86.4" />
              </svg>
              <div className="absolute text-center">
                <div className="text-xl font-black text-slate-900 leading-tight">42</div>
                <div className="text-[10px] font-medium text-slate-400">Total</div>
              </div>
            </div>

            {/* Legend List */}
            <div className="space-y-1.5 text-xs">
              {[
                { label: 'Ongoing', count: '21 (50%)', dot: 'bg-blue-600' },
                { label: 'Oocyte Retrieved', count: '10 (24%)', dot: 'bg-green-600' },
                { label: 'Fertilization', count: '6 (14%)', dot: 'bg-orange-600' },
                { label: 'Embryo Transfer', count: '3 (7%)', dot: 'bg-[#6b46c1]' },
                { label: 'Completed', count: '2 (5%)', dot: 'bg-teal-600' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${item.dot}`} />
                  <span className="font-semibold text-slate-700">{item.label}</span>
                  <span className="ml-auto font-medium text-slate-500">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Embryo Development (Bar Chart) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-slate-900">
            Embryo Development <span className="font-normal text-slate-500">(Today)</span>
          </h2>

          <div className="flex h-44 items-end justify-between gap-3 pt-4 px-2 border-b border-l border-slate-200 relative">
            {/* Y axis markings */}
            <div className="absolute left-0 top-0 text-[9px] text-slate-400">40</div>
            <div className="absolute left-0 top-1/4 text-[9px] text-slate-400">30</div>
            <div className="absolute left-0 top-2/4 text-[9px] text-slate-400">20</div>
            <div className="absolute left-0 top-3/4 text-[9px] text-slate-400">10</div>

            {[
              { day: 'Day 1', val: 18, h: 'h-[45%]', color: 'bg-blue-600' },
              { day: 'Day 2', val: 24, h: 'h-[60%]', color: 'bg-green-600' },
              { day: 'Day 3', val: 28, h: 'h-[70%]', color: 'bg-orange-500' },
              { day: 'Day 5', val: 14, h: 'h-[35%]', color: 'bg-[#6b46c1]' },
              { day: 'Day 6', val: 6, h: 'h-[15%]', color: 'bg-teal-500' },
            ].map((bar) => (
              <div key={bar.day} className="flex flex-1 flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[11px] font-bold text-slate-800">{bar.val}</span>
                <div className={`w-full max-w-[28px] rounded-t-md ${bar.color} ${bar.h} transition-all`} />
                <span className="text-[11px] font-medium text-slate-600 mt-1">{bar.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Recent Witness Events */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Recent Witness Events
            </h2>
            <Link href="/witness" className="text-xs font-bold text-[#6b46c1] hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {[
              {
                title: 'Embryo Labeling',
                date: '22 May 2025 | 02:30 PM',
                doctor: 'Dr. Riya',
              },
              {
                title: 'Sperm Aliquoting',
                date: '22 May 2025 | 01:45 PM',
                doctor: 'Dr. Amit',
              },
              {
                title: 'Oocyte Retrieval',
                date: '22 May 2025 | 11:20 AM',
                doctor: 'Dr. Neha',
              },
            ].map((evt) => (
              <div key={evt.title + evt.date} className="flex items-center gap-3 border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{evt.title}</div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {evt.date} <span className="text-slate-300">|</span> <span className="text-slate-700">{evt.doctor}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Bar */}
      <footer className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-slate-200/80 pt-4 text-xs text-slate-500 sm:flex-row">
        <div>© 2025 FERTITRACE. All rights reserved.</div>
        <div className="flex items-center gap-4 font-medium text-slate-600">
          <span>Secure</span>
          <span>|</span>
          <span>Compliant</span>
          <span>|</span>
          <span>Confidential</span>
        </div>
      </footer>
    </div>
  );
}
