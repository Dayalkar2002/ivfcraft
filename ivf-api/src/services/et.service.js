const { executeDRL, executeDML, buildParams } = require('../db/spExecutor');
const masterService = require('./master.service');

const CYCLE_OUTCOME_SP = 'spCycOutComeExtDRL';
const ET_EXT_SP = 'spETTransferNoteExtDRL';
const ET_TN_SP = 'spETTransferNote';
const ET_ED_SP = 'spETEmbryoDetailsGrid';
const ET_EDS_SP = 'spETEmbryoDetailsSummary';

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

async function checkEtExists({ patId, satId, cycId, cycleDate }) {
  const params = buildParams('@CycID,@ETCycleDate,@PatID,@SatID,@QueryIndex', [
    cycId || '',
    cycleDate ? new Date(cycleDate) : new Date(),
    num(patId),
    num(satId),
    1,
  ]);
  const result = await executeDRL(ET_EXT_SP, params);
  return (result.recordset || []).length > 0;
}

async function createEtId({ patId, satId }) {
  const params = buildParams('@CycID,@ETCycleDate,@PatID,@SatID,@QueryIndex', [
    '',
    new Date(),
    num(patId),
    num(satId),
    2,
  ]);
  const result = await executeDRL(ET_EXT_SP, params);
  const rowCount = num(result.recordset?.[0]?.[Object.keys(result.recordset[0] || {})[0]], 0);
  return `ET${satId}${patId}${rowCount + 1}`;
}

function buildTransferNoteParams(data, queryIndex) {
  return buildParams(
    '@ETID,@ETTNID,@PatID,@SatID,@CycID,@ETTNDate,@ETCycleDate,@ETTNDateOfCreation,@ETTNDiagnosis,@ETTNProc,@ETTNEmbryologist,@ETTNSurgeon,@ETTNAnesthesia,@ETTNAnesOther,@ETTNComplication,@ETTNCompNote,@ETTNFBE,@ETTNFAV,@ETTNFRV,@ETTNFAx,@ETTNFTR,@ETTNFMTD,@ETTNFDR,@ETTNFUG,@ETTNCCCD,@ETTNCLaboTech,@ETTNCSoftPass,@ETTNCCook,@ETTNCDNone,@ETTNCDSome,@ETTNCDModerate,@ETTNCDSignificant,@ETTNNCatheter,@ETTNNWallace,@ETTNNMarrs,@ETTNNDifficult,@ETTNNDNone,@ETTNNDSome,@ETTNNDModerate,@ETTNNDSignificant,@ETTNDepthOfPlacement,@ETTNBloodOnCatheter,@ETTNEmbryoRemaining,@ETTNOperTech,@ETTNComments,@QueryIndex',
    [
      data.etId || '',
      num(data.etTnId),
      num(data.patId),
      num(data.satId),
      data.cycId || '',
      data.transferDate ? new Date(data.transferDate) : new Date(),
      data.cycleDate ? new Date(data.cycleDate) : new Date(),
      data.dateOfCreation ? new Date(data.dateOfCreation) : new Date(),
      data.diagnosis || '',
      data.procedure || '',
      data.embryologist || '',
      data.surgeon || '',
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

function buildEmbryoRowParams(data, row, queryIndex) {
  return buildParams(
    '@ETID,@ETEDID,@PatID,@SatID,@CycID,@ETCycleDate,@ETEDDateOfCreation,@ETEDSource,@ETEDCeller,@ETEDGrade,@ETEDAction,@ETEDRemark,@ETEDDonPatID,@QueryIndex,@ETEDLocation,@ETEDProtocolUsed,@ETEDMediaUsed,@ETEDProcedureDoneBy,@ETEDInUse,@ETEDRecipientET,@ETEDRecipientCycleET',
    [
      data.etId || '',
      num(row.etEdId),
      num(data.patId),
      num(data.satId),
      data.cycId || '',
      data.cycleDate ? new Date(data.cycleDate) : new Date(),
      data.dateOfCreation ? new Date(data.dateOfCreation) : new Date(),
      row.source || '',
      num(row.celler),
      num(row.grade),
      num(row.action),
      row.remark || '',
      num(row.donPatId),
      queryIndex,
      row.location || '',
      num(data.protocolUsed),
      num(data.mediaUsed),
      data.procedureDoneBy || '',
      row.inUse ? 1 : 0,
      num(row.recipientEt),
      row.recipientCycleEt || '',
    ]
  );
}

function buildSummaryParams(data, queryIndex) {
  return buildParams(
    '@ETID,@ETEDSID,@PatID,@SatID,@CycID,@ETCycleDate,@ETEDSDateOfCreation,@ETEDSTransfer,@ETEDSFreeze,@ETEDSBlastocyst,@ETEDSStuck,@ETEDSDiscard,@ETEDSDonate,@ETEDSDonateResearch,@ETEDSRemark,@ETDate,@QueryIndex',
    [
      data.etId || '',
      num(data.etEdsId),
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
      num(data.summary?.donateResearch),
      data.summary?.remark || '',
      data.etDate ? new Date(data.etDate) : new Date(),
      queryIndex,
    ]
  );
}

async function loadTransferNote(data) {
  const params = buildTransferNoteParams({ ...data, etTnId: 0 }, 2);
  const result = await executeDRL(ET_TN_SP, params);
  return result.recordset?.[0] || null;
}

async function loadEmbryoGrid(data) {
  const params = buildEmbryoRowParams(
    { ...data, protocolUsed: 0, mediaUsed: 0, procedureDoneBy: '' },
    { etEdId: 0, source: '', celler: 0, grade: 0, action: 0, remark: '', donPatId: 0, location: '', inUse: false, recipientEt: 0, recipientCycleEt: '' },
    2
  );
  const result = await executeDRL(ET_ED_SP, params);
  return result.recordset || [];
}

async function loadSummary(data) {
  const params = buildSummaryParams({ ...data, etEdsId: 0, summary: {}, etDate: data.cycleDate }, 2);
  const result = await executeDRL(ET_EDS_SP, params);
  return result.recordset?.[0] || null;
}

async function loadEtRecord(data) {
  const [transferNote, embryoRows, summary] = await Promise.all([
    loadTransferNote(data),
    loadEmbryoGrid(data),
    loadSummary(data),
  ]);
  return { transferNote, embryoRows, summary };
}

async function saveEtRecord(data) {
  const isUpdate = data.mode === 'update';
  const queryIndex = isUpdate ? 12 : 11;
  let etId = data.etId || '';

  if (!isUpdate && !etId) {
    etId = await createEtId({ patId: data.patId, satId: data.satId });
  }

  const payload = { ...data, etId, dateOfCreation: data.dateOfCreation || new Date() };

  const tnParams = buildTransferNoteParams(
    {
      ...payload,
      ...payload.transferNote,
      etId,
      patId: payload.patId,
      satId: payload.satId,
      cycId: payload.cycId,
      cycleDate: payload.cycleDate,
    },
    queryIndex
  );
  await executeDML(ET_TN_SP, tnParams);

  const rows = payload.embryoRows || [];
  for (const row of rows) {
    const rowQueryIndex = row.isNew ? 11 : queryIndex;
    const edParams = buildEmbryoRowParams(payload, row, rowQueryIndex);
    await executeDML(ET_ED_SP, edParams);
  }

  const edsParams = buildSummaryParams(payload, queryIndex);
  await executeDML(ET_EDS_SP, edsParams);

  return { etId, queryIndex };
}

async function getLookups() {
  const doctors = await masterService.listDoctors();
  return { doctors };
}

module.exports = {
  listCycleDates,
  checkEtExists,
  loadEtRecord,
  saveEtRecord,
  getLookups,
};
