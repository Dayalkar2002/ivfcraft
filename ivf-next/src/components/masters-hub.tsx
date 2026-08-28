'use client';

import Link from 'next/link';
import { getMasterColumns } from '@/lib/nav-config';

export function MastersHub() {
  const columns = getMasterColumns();

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-800">Master</h1>
      <p className="mt-2 mb-6 text-sm text-slate-600">
        Select a master module below — same list as the legacy smART Master menu.
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {columns.map((column, colIndex) => (
          <div key={colIndex} className="flex flex-col gap-1">
            {column.map((item) => (
              <Link
                key={item.route}
                href={item.route}
                className="rounded-lg px-2 py-1.5 text-sm text-slate-700 hover:bg-brand-light/60 hover:text-brand-green"
              >
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
