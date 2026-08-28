'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { ModuleAlerts, ModuleCard } from '@/components/clinical/clinical-shared';
import { useAuth } from '@/contexts/auth-context';
import { ApiError } from '@/lib/api';
import type { SpCrudSpec } from '@/lib/module-registry';
import { executeSpDml, executeSpDrl, rowId, rowName, type SpRow } from '@/lib/services/sp';

const inputCls = 'h-9 rounded-lg border border-slate-300 px-3 text-sm';

interface SpCrudModuleProps {
  title: string;
  description: string;
  spec: SpCrudSpec;
  note?: string;
}

export function SpCrudModule({ title, description, spec, note }: SpCrudModuleProps) {
  const { token } = useAuth();
  const [rows, setRows] = useState<SpRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await executeSpDrl(token, {
        procName: spec.procName,
        paramNames: spec.paramNames,
        values: spec.listValues,
      });
      setRows(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load data.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [token, spec]);

  useEffect(() => {
    void load();
  }, [load]);

  async function persist(queryIndex: number, id: number, name: string) {
    if (!token) return;
    setSaving(true);
    setError('');
    try {
      await executeSpDml(token, {
        procName: spec.procName,
        paramNames: spec.paramNames,
        values: spec.saveValues(id, name, queryIndex),
      });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    void persist(11, 0, newName.trim()).then(() => setNewName(''));
  }

  function startEdit(row: SpRow) {
    setEditId(rowId(row));
    setEditName(rowName(row));
  }

  function cancelEdit() {
    setEditId(null);
    setEditName('');
  }

  async function saveEdit(row: SpRow) {
    if (!editName.trim()) return;
    await persist(12, rowId(row), editName.trim());
    cancelEdit();
  }

  async function remove(row: SpRow) {
    const name = rowName(row);
    if (!confirm(`Delete "${name || rowId(row)}"?`)) return;
    await persist(13, rowId(row), name);
  }

  return (
    <ModuleCard title={title}>
      <p className="mb-4 text-sm text-slate-600">{description}</p>
      {note && <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">{note}</p>}
      <ModuleAlerts error={error} />
      <p className="mb-3 text-xs text-slate-500">
        Stored procedure: <code className="rounded bg-slate-100 px-1">{spec.procName}</code>
        {loading && <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5">Loading…</span>}
      </p>

      <form onSubmit={handleAdd} className="mb-4 flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Enter name"
          className={`${inputCls} min-w-0 flex-1`}
        />
        <button
          type="submit"
          disabled={!newName.trim() || saving}
          className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          Add
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const id = rowId(row);
              const name = rowName(row);
              return (
                <tr key={id || name} className="border-t border-slate-100">
                  <td className="px-3 py-2">{id}</td>
                  <td className="px-3 py-2">
                    {editId === id ? (
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && void saveEdit(row)}
                        className={inputCls}
                      />
                    ) : (
                      name
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      {editId === id ? (
                        <>
                          <button type="button" onClick={() => void saveEdit(row)} disabled={saving} className="text-brand-primary hover:underline">
                            Save
                          </button>
                          <button type="button" onClick={cancelEdit} className="text-slate-500 hover:underline">
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button type="button" onClick={() => startEdit(row)} className="text-brand-primary hover:underline">
                            Edit
                          </button>
                          <button type="button" onClick={() => void remove(row)} disabled={saving} className="text-red-600 hover:underline">
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={3} className="px-3 py-6 text-center text-slate-500">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </ModuleCard>
  );
}
