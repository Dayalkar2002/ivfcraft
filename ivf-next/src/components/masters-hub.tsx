'use client';

import Link from 'next/link';
import { getMasterColumns } from '@/lib/nav-config';

export function MastersHub() {
  const columns = getMasterColumns();

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-green">Administration</p>
        <h1 className="mt-1 font-display text-2xl font-extrabold text-slate-900">Masters Hub</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Same master modules as the legacy smART Master menu — common masters use category IDs via
          stored procedures.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {columns.map((column, colIndex) => (
          <div
            key={colIndex}
            className="rounded-3xl border border-slate-200 bg-white p-4 shadow-card"
          >
            <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Column {colIndex + 1}
            </div>
            <div className="flex flex-col gap-0.5">
              {column.map((item) => (
                <Link
                  key={item.route + item.label}
                  href={item.route}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-brand-mist hover:text-brand-dark"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
