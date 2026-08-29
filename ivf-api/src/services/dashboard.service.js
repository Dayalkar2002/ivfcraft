const { executeDRL, executeText, buildParams } = require('../db/spExecutor');

async function safeCount(sql, parameters = []) {
  try {
    const result = await executeText(sql, parameters);
    return Number(result.recordset?.[0]?.cnt ?? 0) || 0;
  } catch {
    return 0;
  }
}

async function safeSpRows(procName, paramNames, values) {
  try {
    const result = await executeDRL(procName, buildParams(paramNames, values));
    return result.recordset || [];
  } catch {
    return [];
  }
}

/**
 * Clinic-wide KPIs + optional patient activity from legacy SPs.
 * Aggregates use COUNT queries; lists use ExtDRL SPs (same as ASP.NET pages).
 */
async function getSummary({ patId = 0, satId = 0, userId = 0 } = {}) {
  const [
    patients,
    satellites,
    cycles,
    iui,
    ivf,
    et,
    bt,
    satelliteRows,
    recentCycles,
    recentIui,
  ] = await Promise.all([
    safeCount('SELECT COUNT(*) AS cnt FROM PatientMaster'),
    safeCount('SELECT COUNT(*) AS cnt FROM SatelliteMaster'),
    safeCount('SELECT COUNT(*) AS cnt FROM CycOutCome'),
    safeCount('SELECT COUNT(*) AS cnt FROM IUIOutCome'),
    safeCount('SELECT COUNT(*) AS cnt FROM IVFOutCome'),
    safeCount('SELECT COUNT(*) AS cnt FROM ETOutCome'),
    safeCount('SELECT COUNT(*) AS cnt FROM BTOutCome'),
    safeSpRows('spSatelliteMasterExtDRL', '@SatID,@QueryIndex', [0, 1]),
    patId
      ? safeSpRows('spCycOutComeExtDRL', '@PatID,@SatID,@QueryIndex,@UserId', [
          Number(patId),
          Number(satId) || 0,
          1,
          Number(userId) || 0,
        ])
      : Promise.resolve([]),
    patId
      ? safeSpRows('spIUIOutComeExtDRL', '@PatID,@SatID,@QueryIndex,@UserId', [
          Number(patId),
          Number(satId) || 0,
          1,
          Number(userId) || 0,
        ])
      : Promise.resolve([]),
  ]);

  const satelliteCount = satellites || satelliteRows.length;

  return {
    kpis: {
      patients,
      satellites: satelliteCount,
      cycles,
      iui,
      ivf,
      et,
      bt,
    },
    recentCycles: recentCycles.slice(0, 8).map((row) => ({
      id: row.CycID ?? row.CycleID ?? row.ID ?? '',
      date: row.CycDateOfCreation ?? row.CycDate ?? row.DateOfCreation ?? null,
      type: row.CycType ?? row.CycleType ?? row.Type ?? 'Cycle',
      outcome: row.CycOutCome ?? row.Outcome ?? '',
      raw: row,
    })),
    recentIui: recentIui.slice(0, 8).map((row) => ({
      id: row.IUIID ?? row.IuiID ?? row.ID ?? '',
      date: row.IUIODateOfCreation ?? row.IUIODate ?? row.DateOfCreation ?? null,
      outcome: row.IUIOOutcome ?? row.Outcome ?? '',
      raw: row,
    })),
    modules: [
      { key: 'iui', label: 'IUI', href: '/iui', count: iui },
      { key: 'cycle', label: 'Cycles', href: '/cycle/entry', count: cycles },
      { key: 'ivf', label: 'IVF', href: '/ivf', count: ivf },
      { key: 'icsi', label: 'ICSI', href: '/icsi', count: 0 },
      { key: 'et', label: 'ET', href: '/et', count: et },
      { key: 'bt', label: 'BT', href: '/bt', count: bt },
    ],
  };
}

module.exports = { getSummary };
