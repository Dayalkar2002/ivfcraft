const { executeDRL, executeDML, buildParams } = require('../db/spExecutor');
const masterService = require('./master.service');

const CYCLE_OUTCOME_SP = 'spCycOutComeExtDRL';
const BT_EXT_SP = 'spBTTransferNoteExtDRL';
const BT_TN_SP = 'spBTTransferNote';
const BT_BD_SP = 'spBTBlastocystDetailsGrid';
const BT_BDS_SP = 'spBTBlastocystDetailsSummary';

function num(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function boolByte(value) {
  return value ? 1 : 0;
}

async function listCycleDates({ patId, satId }) {
  const params = buildParams('@PatID,@SatID,@QueryIndex', [num(patId), num(satId), 1]);
  const result = await executeDRL(CYCLE_OUTCOME_SP, params);
  return (result.recordset || []).map((row) => ({
    cycId: String(row.CycID ?? ''),
    cycleDate: row.CycODate,
    label: row.CycODate,
  }));
}

async function checkBtExists({ patId, satId, cycId, cycleDate }) {
  const params = buildParams('@CycID,@BTCycleDate,@PatID,@SatID,@QueryIndex', [
    cycId || '',
    cycleDate ? new Date(cycleDate) : new Date(),
    num(patId),
    num(satId),
    1,
  ]);
  const result = await executeDRL(BT_EXT_SP, params);
  return (result.recordset || []).length > 0;
}

async function createBtId({ patId, satId }) {
  const params = buildParams('@CycID,@BTCycleDate,@PatID,@SatID,@QueryIndex', [
    '',
    new Date(),
    num(patId),
    num(satId),
    2,
  ]);
  const result = await executeDRL(BT_EXT_SP, params);
  const rowCount = num(result.recordset?.[0]?.[Object.keys(result.recordset[0] || {})[0]], 0);
  return `BT${satId}${patId}${rowCount + 1}`;
}

function buildTransferNoteParams(data, queryIndex) {
  return buildParams(
    '@BTID,@BTTNID,@PatID,@SatID,@CycID,@BTTNDate,@BTCycleDate,@BTTNDateOfCreation,@BTTNDiagnosis,@BTTNProc,@BTTNEmbryologist,@BTTNSurgeon,@BTTNAnesthesia,@BTTNAnesOther,@BTTNComplication,@BTTNCompNote,@BTTNFBE,@BTTNFAV,@BTTNFRV,@BTTNFAx,@BTTNFTR,@BTTNFMTD,@BTTNFDR,@BTTNFUG,@BTTNCCCD,@BTTNCLaboTech,@BTTNCSoftPass,@BTTNCCook,@BTTNCDNone,@BTTNCDSome,@BTTNCDModerate,@BTTNCDSignificant,@BTTNNCatheter,@BTTNNWallace,@BTTNNMarrs,@BTTNNDifficult,@BTTNNDNone,@BTTNNDSome,@BTTNNDModerate,@BTTNNDSignificant,@BTTNDepthOfPlacement,@BTTNBloodOnCatheter,@BTTNEmbryoRemaining,@BTTNOperTech,@BTTNComments,@QueryIndex',
    [
      data.btId || '',
      num(data.btTnId),
      num(data.patId),
      num(data.satId),
      data.cycId || '',
      data.transferDate ? new Date(data.transferDate) : new Date(),
      data.cycleDate ? new Date(data.cycleDate) : new Date(),
      data.dateOfCreation ? new Date(data.dateOfCreation) : new Date(),
      data.diagnosis || '',
      data.procedure || '',
      data.embryologist || '',
      num(data.surgeon),
      num(data.anesthesia),
      data.anesthesiaOther || '',
      num(data.complication),
      data.complicationNote || '',
      num(data.fbe),
      boolByte(data.fav),
      boolByte(data.frv),
      boolByte(data.fax),
      num(data.ftr),
      num(data.fmtd),
      num(data.fdr),
      num(data.fug),
      boolByte(data.catheterCcd),
      boolByte(data.catheterLaboTech),
      boolByte(data.catheterSoftPass),
      boolByte(data.catheterCook),
      boolByte(data.difficultyNone),
      boolByte(data.difficultySome),
      boolByte(data.difficultyModerate),
      boolByte(data.difficultySignificant),
      boolByte(data.nextCatheter),
      boolByte(data.nextWallace),
      boolByte(data.nextMarrs),
      boolByte(data.nextDifficult),
      boolByte(data.nextDifficultyNone),
      boolByte(data.nextDifficultySome),
      boolByte(data.nextDifficultyModerate),
      boolByte(data.nextDifficultySignificant),
      num(data.depthOfPlacement),
      num(data.bloodOnCatheter),
      num(data.embryoRemaining),
      data.operTech || '',
      data.comments || '',
      queryIndex,
    ]
  );
}

function buildBlastocystRowParams(data, row, queryIndex) {
  return buildParams(
    '@BTID,@BTBDID,@PatID,@SatID,@CycID,@BTCycleDate,@BTBDDateOfCreation,@BTBDSource,@BTBDCeller,@BTBDGrade,@BTTEGrade,@BTBDAction,@BTBDRemark,@BTBDDonPatID,@QueryIndex,@BTBDLocation,@BTBDProtocolUsed,@BTBDMediaUsed,@BTBDProcedureDoneBy,@BTBDInUse,@BTBDRecipientBT,@BTBDRecipientCycleBT',
    [
      data.btId || '',
      num(row.btBdId),
      num(data.patId),
      num(data.satId),
      data.cycId || '',
      data.cycleDate ? new Date(data.cycleDate) : new Date(),
      data.dateOfCreation ? new Date(data.dateOfCreation) : new Date(),
      row.source || '',
      num(row.celler),
      num(row.grade),
      num(row.teGrade),
      num(row.action),
      row.remark || '',
      num(row.donPatId),
      queryIndex,
      row.location || '',
      num(data.protocolUsed),
      num(data.mediaUsed),
      data.procedureDoneBy || '',
      row.inUse ? 1 : 0,
      num(row.recipientBt),
      row.recipientCycleBt || '',
    ]
  );
}

function buildSummaryParams(data, queryIndex) {
  return buildParams(
    '@BTID,@BTBDSID,@PatID,@SatID,@CycID,@BTCycleDate,@BTBDSDateOfCreation,@BTBDSTransfer,@BTBDSFreeze,@BTBDSBlastocyst,@BTBDSStuck,@BTBDSDiscard,@BTBDSDonate,@BTBDSRemark,@QueryIndex',
    [
      data.btId || '',
      num(data.btBdsId),
      num(data.patId),
      num(data.satId),
      data.cycId || '',
      data.cycleDate ? new Date(data.cycleDate) : new Date(),
      data.dateOfCreation ? new Date(data.dateOfCreation) : new Date(),
      num(data.summary?.transfer),
      num(data.summary?.freeze),
      num(data.summary?.blastocyst),
      num(data.summary?.stuck),
      num(data.summary?.discard),
      num(data.summary?.donate),
      data.summary?.remark || '',
      queryIndex,
    ]
  );
}

async function loadTransferNote(data) {
  const params = buildTransferNoteParams({ ...data, btTnId: 0 }, 2);
  const result = await executeDRL(BT_TN_SP, params);
  return result.recordset?.[0] || null;
}

async function loadBlastocystGrid(data) {
  const params = buildBlastocystRowParams(
    { ...data, protocolUsed: 0, mediaUsed: 0, procedureDoneBy: '' },
    { btBdId: 0, source: '', celler: 0, grade: 0, teGrade: 0, action: 0, remark: '', donPatId: 0, location: '', inUse: false, recipientBt: 0, recipientCycleBt: '' },
    2
  );
  const result = await executeDRL(BT_BD_SP, params);
  return result.recordset || [];
}

async function loadSummary(data) {
  const params = buildSummaryParams({ ...data, btBdsId: 0, summary: {} }, 2);
  const result = await executeDRL(BT_BDS_SP, params);
  return result.recordset?.[0] || null;
}

async function loadBtRecord(data) {
  const [transferNote, blastocystRows, summary] = await Promise.all([
    loadTransferNote(data),
    loadBlastocystGrid(data),
    loadSummary(data),
  ]);
  return { transferNote, blastocystRows, summary };
}

async function saveBtRecord(data) {
  const isUpdate = data.mode === 'update';
  const queryIndex = isUpdate ? 12 : 11;
  let btId = data.btId || '';

  if (!isUpdate && !btId) {
    btId = await createBtId({ patId: data.patId, satId: data.satId });
  }

  const payload = { ...data, btId, dateOfCreation: data.dateOfCreation || new Date() };

  const tnParams = buildTransferNoteParams(
    {
      ...payload,
      ...payload.transferNote,
      btId,
      patId: payload.patId,
      satId: payload.satId,
      cycId: payload.cycId,
      cycleDate: payload.cycleDate,
    },
    queryIndex
  );
  await executeDML(BT_TN_SP, tnParams);

  const rows = payload.blastocystRows || [];
  for (const row of rows) {
    const rowQueryIndex = row.isNew ? 11 : queryIndex;
    const bdParams = buildBlastocystRowParams(payload, row, rowQueryIndex);
    await executeDML(BT_BD_SP, bdParams);
  }

  const bdsParams = buildSummaryParams(payload, queryIndex);
  await executeDML(BT_BDS_SP, bdsParams);

  return { btId, queryIndex };
}

async function getLookups() {
  const doctors = await masterService.listDoctors();
  return { doctors };
}

module.exports = {
  listCycleDates,
  checkBtExists,
  loadBtRecord,
  saveBtRecord,
  getLookups,
};
