'use client';

import type { SpRow } from '@/lib/services/sp';

interface SpDataTableProps {
  rows: SpRow[];
  emptyMessage?: string;
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toLocaleDateString();
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function SpDataTable({ rows, emptyMessage = 'No records found.' }: SpDataTableProps) {
  if (rows.length === 0) {
    return <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">{emptyMessage}</p>;
  }

  const columns = Object.keys(rows[0]).filter((key) => !key.startsWith('_'));

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
          <tr>
            {columns.map((col) => (
              <th key={col} className="whitespace-nowrap px-3 py-2">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-t border-slate-100">
              {columns.map((col) => (
                <td key={col} className="whitespace-nowrap px-3 py-2">
                  {formatCell(row[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
