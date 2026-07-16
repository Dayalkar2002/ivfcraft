const { sql, getPool } = require('./pool');

/**
 * Mirrors ASP.NET DataAccessLayer.ExecuteDRL – runs a stored procedure and returns all recordsets.
 * @param {string} procName
 * @param {Array<{ name: string, value: unknown }>} parameters - e.g. [{ name: '@UserLoginName', value: 'admin' }]
 */
async function executeDRL(procName, parameters = []) {
  const pool = await getPool();
  const request = pool.request();

  parameters.forEach(({ name, value }) => {
    const paramName = name.startsWith('@') ? name.slice(1) : name;
    request.input(paramName, value === undefined || value === null ? null : value);
  });

  const result = await request.execute(procName);
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
async function executeDML(procName, parameters = []) {
  const pool = await getPool();
  const request = pool.request();

  parameters.forEach(({ name, value }) => {
    const paramName = name.startsWith('@') ? name.slice(1) : name;
    request.input(paramName, value === undefined || value === null ? null : value);
  });

  const result = await request.execute(procName);
  return {
    recordsets: result.recordsets,
    recordset: result.recordset,
    rowsAffected: result.rowsAffected,
    returnValue: result.returnValue,
  };
}

/**
 * Build parameters from comma-separated names and parallel values (same as .NET sParameters + arrParameters).
 */
function buildParams(paramNamesCsv, values) {
  const names = paramNamesCsv.split(',').map((n) => n.trim());
  return names.map((name, index) => ({
    name: name.startsWith('@') ? name : `@${name}`,
    value: values[index],
  }));
}

/**
 * Run parameterized SQL text (mirrors CommonUtilities ExecuteTextDRL/DML).
 */
async function executeText(sqlQuery, parameters = []) {
  const pool = await getPool();
  const request = pool.request();

  parameters.forEach(({ name, value }) => {
    const paramName = name.startsWith('@') ? name.slice(1) : name;
    request.input(paramName, value === undefined || value === null ? null : value);
  });

  return request.query(sqlQuery);
}

module.exports = {
  executeDRL,
  executeDML,
  buildParams,
  executeText,
};
