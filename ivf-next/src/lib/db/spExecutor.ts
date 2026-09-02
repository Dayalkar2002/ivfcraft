import { getPool } from './pool';
import { IResult, IRecordSet } from 'mssql';

export interface ProcedureParameter {
  name: string;
  value: unknown;
}

export interface ExecResult<T = unknown> {
  recordsets: IRecordSet<T>[];
  recordset: IRecordSet<T>;
  rowsAffected: number[];
  returnValue: number;
}

/**
 * Mirrors ASP.NET DataAccessLayer.ExecuteDRL – runs a stored procedure and returns all recordsets.
 */
export async function executeDRL<T = unknown>(
  procName: string,
  parameters: ProcedureParameter[] = []
): Promise<ExecResult<T>> {
  const pool = await getPool();
  const request = pool.request();

  parameters.forEach(({ name, value }) => {
    const paramName = name.startsWith('@') ? name.slice(1) : name;
    request.input(paramName, value === undefined || value === null ? null : value);
  });

  const result = await request.execute<T>(procName);
  return {
    recordsets: result.recordsets,
    recordset: result.recordset,
    rowsAffected: result.rowsAffected,
    returnValue: result.returnValue,
  };
}

/**
 * Mirrors ASP.NET DataAccessLayer.ExecuteDML – runs SP and returns scalar / rows affected.
 */
export async function executeDML<T = unknown>(
  procName: string,
  parameters: ProcedureParameter[] = []
): Promise<ExecResult<T>> {
  return executeDRL<T>(procName, parameters);
}

/**
 * Build parameters from comma-separated names and parallel values.
 */
export function buildParams(paramNamesCsv: string, values: unknown[]): ProcedureParameter[] {
  const names = paramNamesCsv.split(',').map((n) => n.trim());
  return names.map((name, index) => ({
    name: name.startsWith('@') ? name : `@${name}`,
    value: values[index],
  }));
}

/**
 * Run parameterized SQL text.
 */
export async function executeText<T = unknown>(
  sqlQuery: string,
  parameters: ProcedureParameter[] = []
): Promise<IResult<T>> {
  const pool = await getPool();
  const request = pool.request();

  parameters.forEach(({ name, value }) => {
    const paramName = name.startsWith('@') ? name.slice(1) : name;
    request.input(paramName, value === undefined || value === null ? null : value);
  });

  return request.query<T>(sqlQuery);
}
