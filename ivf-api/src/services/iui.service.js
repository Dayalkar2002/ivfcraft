const { executeDRL, executeDML, buildParams } = require('../db/spExecutor');

const LIST_SP = 'spIUIOutComeExtDRL';
const OUTCOME_SP = 'spIUIOutCome';
const UNLOCK_SP = 'spUpdateCycle';

function num(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function listIuiRecords({ patId, satId, userId }) {
  const params = buildParams('@PatID,@SatID,@QueryIndex,@UserId', [
    num(patId),
    num(satId),
    1,
    num(userId),
  ]);
  const result = await executeDRL(LIST_SP, params);
  return result.recordset || [];
}

async function loadIuiOutcome({ iuiId, iuiOId, patId, satId }) {
  const params = buildParams(
    '@IUIID,@IUIIDOff,@IUIOID,@PatID,@SatID,@IUIODate,@IUIODateOfCreation,@IUIOValue,@IUIONoSac,@IUIOPostIUIDay,@IUIOOutcome,@IUIOPregOpt,@IUIOPregDelOpt,@IUIOPostTreat,@IUIOAdvice,@QueryIndex',
    [
      iuiId || '',
      '',
      num(iuiOId),
      num(patId),
      num(satId),
      new Date(),
      new Date(),
      0,
      0,
      0,
      0,
      0,
      0,
      '',
      '',
      2,
    ]
  );
  const result = await executeDRL(OUTCOME_SP, params);
  return result.recordset?.[0] || null;
}

async function getNextIuiId({ patId, satId }) {
  const params = buildParams('@PatID,@SatID,@QueryIndex', [num(patId), num(satId), 2]);
  const result = await executeDRL(LIST_SP, params);
  const rowCount = num(result.recordset?.[0]?.[Object.keys(result.recordset[0] || {})[0]], 0);
  return `IUI${satId}${patId}${rowCount + 1}`;
}

async function saveIuiOutcome(payload) {
  const queryIndex = payload.mode === 'update' ? 12 : 11;
  let iuiId = payload.iuiId || '';

  if (queryIndex === 11 && !iuiId) {
    iuiId = await getNextIuiId({ patId: payload.patId, satId: payload.satId });
  }

  const params = buildParams(
    '@IUIID,@IUIIDOff,@IUIOID,@PatID,@SatID,@IUIODate,@IUIODateOfCreation,@IUIOValue,@IUIONoSac,@IUIOPostIUIDay,@IUIOOutcome,@IUIOPregOpt,@IUIOPregDelOpt,@IUIOPostTreat,@IUIOAdvice,@QueryIndex',
    [
      iuiId,
      payload.iuiIdOff ?? '',
      num(payload.iuiOId),
      num(payload.patId),
      num(payload.satId),
      payload.iuiODate ? new Date(payload.iuiODate) : new Date(),
      payload.iuiDate ? new Date(payload.iuiDate) : new Date(),
      num(payload.iuioValue),
      num(payload.iuioNoSac),
      num(payload.iuioPostIuiDay),
      num(payload.iuioOutcome),
      num(payload.iuioPregOpt),
      num(payload.iuioPregDelOpt),
      payload.iuioPostTreat ?? '',
      payload.iuioAdvice ?? '',
      queryIndex,
    ]
  );

  await executeDML(OUTCOME_SP, params);
  return { iuiId, queryIndex };
}

async function unlockIuiCycle({ patId, cycleId, patName, userId }) {
  const params = buildParams('@QueryIndex,@Patid,@CycleId,@PatName,@Lock,@Updatedby', [
    2,
    num(patId),
    cycleId,
    patName || '',
    0,
    num(userId),
  ]);
  await executeDML(UNLOCK_SP, params);
  return { unlocked: true };
}

module.exports = {
  listIuiRecords,
  loadIuiOutcome,
  getNextIuiId,
  saveIuiOutcome,
  unlockIuiCycle,
};
