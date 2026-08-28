import { apiFetch } from '@/lib/api';

export interface SpExecutePayload {
  procName: string;
  paramNames: string;
  values?: unknown[];
}

export type SpRow = Record<string, unknown>;

export interface SpExecuteResult {
  success: boolean;
  data: SpRow[] | SpRow[][] | null;
  rowsAffected?: number[];
  returnValue?: number;
}

function normalizeRows(data: SpExecuteResult['data']): SpRow[] {
  if (!data) return [];
  if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
    return (data[0] as SpRow[]) ?? [];
  }
  if (Array.isArray(data)) {
    return data as SpRow[];
  }
  return [];
}

export async function executeSpDrl(token: string, payload: SpExecutePayload): Promise<SpRow[]> {
  const res = await apiFetch<SpExecuteResult>(
    '/sp/drl',
    {
      method: 'POST',
      body: JSON.stringify({ ...payload, values: payload.values ?? [] }),
    },
    token
  );
  return normalizeRows(res.data);
}

export async function executeSpDml(token: string, payload: SpExecutePayload): Promise<SpExecuteResult> {
  return apiFetch<SpExecuteResult>(
    '/sp/dml',
    {
      method: 'POST',
      body: JSON.stringify({ ...payload, values: payload.values ?? [] }),
    },
    token
  );
}

export function rowId(row: SpRow): number {
  const keys = ['ID', 'Id', 'id', 'CommID', 'DonorLabID', 'OutComeDrugID', 'RoleID', 'UserID'];
  for (const key of keys) {
    const val = row[key];
    if (val !== undefined && val !== null && val !== '') {
      return Number(val);
    }
  }
  return 0;
}

export function rowName(row: SpRow): string {
  const keys = ['Name', 'CommName', 'DonorLabName', 'OutComeDrugName', 'RoleName', 'UserName'];
  for (const key of keys) {
    const val = row[key];
    if (val !== undefined && val !== null) {
      return String(val);
    }
  }
  return '';
}
