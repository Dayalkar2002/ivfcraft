const { executeDRL, executeDML, buildParams } = require('../db/spExecutor');
const masterService = require('./master.service');

const ICSI_EXT_SP = 'spICSIExtDRL';
const ICSI_SP = 'spICSI';
const CYCLE_DAY_SP = 'spCycMonitoringChartCycleDayExtDRL';

function num(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function boolByte(value) {
  return value ? 1 : 0;
}

async function listCycleDates({ patId, satId }) {
  const params = buildParams('@CycID,@PatID,@SatID,@CycMCCDDate,@QueryIndex', [
    '',
    num(patId),
    num(satId),
    new Date(),
    3,
  ]);
  const result = await executeDRL(CYCLE_DAY_SP, params);
  const rows = result.recordset || [];
  const seen = new Set();
  return rows
    .filter((row) => {
      const key = `${row.CycID}|${row.CycMCCDDate}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((row) => ({
      cycId: String(row.CycID ?? ''),
      cycleDate: row.CycMCCDDate,
      label: row.CycMCCDDate,
    }));
}

async function loadMonitoringChart({ patId, satId, cycId, cycleDate }) {
  const params = buildParams('@CycID,@PatID,@SatID,@CycMCCDDate,@QueryIndex', [
    cycId || '',
    num(patId),
    num(satId),
    cycleDate ? new Date(cycleDate) : new Date(),
    2,
  ]);
  const result = await executeDRL(CYCLE_DAY_SP, params);
  return result.recordset?.[0] || null;
}

async function checkIcsiExists({ patId, satId, cycId, cycleDate }) {
  const params = buildParams('@PatID,@SatID,@CycID,@ICSICycleDate,@QueryIndex', [
    num(patId),
    num(satId),
    cycId || '',
    cycleDate ? new Date(cycleDate) : new Date(),
    1,
  ]);
  const result = await executeDRL(ICSI_EXT_SP, params);
  return (result.recordset || []).length > 0;
}

async function createIcsiId({ patId, satId, cycId, cycleDate }) {
  const params = buildParams('@PatID,@SatID,@CycID,@ICSICycleDate,@QueryIndex', [
    num(patId),
    num(satId),
    cycId || '',
    cycleDate ? new Date(cycleDate) : new Date(),
    2,
  ]);
  const result = await executeDRL(ICSI_EXT_SP, params);
  const rowCount = num(result.recordset?.[0]?.[Object.keys(result.recordset[0] || {})[0]], 0);
  return `ICSI${satId}${patId}${rowCount + 1}`;
}

function buildIcsiParams(data, queryIndex) {
  return buildParams(
    '@ICSIID,@PatID,@SatID,@CycID,@ICSICycleDate,@ICSIDateOfCreation,@ICSISGnRN,@ICSISLuteal,@ICSISStopL,@ICSISNone,@MCCDFSHDrug1,@MCCDFSHDrug2,@MCCDHMGDrug1,@MCCDHMGDrgu2,@ICSISOther,@ICSISOtherVal,@ICSISNaturalCycle,@ICSISE2Pattern1,@ICSISE2Pattern2,@ICSISE2Pattern3,@ICSISE2Pattern4,@ICSISNODStimulation,@ICSISIntervalToHCG,@ICSISIntervalFromHCGHrs,@ICSISIntervalFromHCGMin,@ICSIPRetPerID,@ICSIPTransPerID,@LabOptID,@MediaBrand,@MediaSeries,@IncubatorUsed,@Gas,@ICSISType1,@ICSISType2,@ICSISType3,@ICSISType4,@ICSIOIMetaII,@ICSIOIMetaI,@ICSIOIGV,@ICSIOIDEG,@ICSIPMetaIDEG,@ICSIFMetaI0pb,@ICSIFMetaI0PN,@ICSIFMetaI1PN,@ICSIFMetaI2PN,@ICSIFMetaI3PN,@ICSIFMetaIStuck,@ICSIFMetaICont,@ICSIFMetaICleaved,@ICSIPMetaIIDEG,@ICSIFMetaII0pb,@ICSIFMetaII0PN,@ICSIFMetaII1PN,@ICSIFMetaII2PN,@ICSIFMetaII3PN,@ICSIFMetaIIStuck,@ICSIFMetaIICont,@ICSIFMetaIICleaved,@ICSIPGVDEG,@ICSIFGV0pb,@ICSIFGV0PN,@ICSIFGV1PN,@ICSIFGV2PN,@ICSIFGV3PN,@ICSIFGVStuck,@ICSIFGVCont,@ICSIFGVCleaved,@QueryIndex',
    [
      data.icsiId || '',
      num(data.patId),
      num(data.satId),
      data.cycId || '',
      data.cycleDate ? new Date(data.cycleDate) : new Date(),
      data.dateOfCreation ? new Date(data.dateOfCreation) : new Date(),
      boolByte(data.gnrhFollicular),
      boolByte(data.gnrhLuteal),
      boolByte(data.gnrhStopL),
      boolByte(data.gnrhNone),
      num(data.fshDrug1),
      num(data.fshDrug2),
      num(data.hmgDrug1),
      num(data.hmgDrug2),
      boolByte(data.otherCycle),
      num(data.otherCycleVal),
      boolByte(data.naturalCycle),
      num(data.e2Pattern1),
      num(data.e2Pattern2),
      num(data.e2Pattern3),
      num(data.e2Pattern4),
      num(data.daysStimulation),
      num(data.intervalToHcg),
      num(data.intervalFromHcgHrs),
      num(data.intervalFromHcgMin),
      num(data.retPerId),
      num(data.transPerId),
      num(data.labOptId),
      num(data.mediaBrand),
      num(data.mediaSeries),
      num(data.incubatorUsed),
      num(data.gas),
      num(data.semenType1),
      num(data.semenType2),
      num(data.semenType3),
      num(data.semenType4),
      num(data.oiMetaII),
      num(data.oiMetaI),
      num(data.oiGV),
      num(data.oiDeg),
      num(data.pMetaIDeg),
      num(data.fMetaI0pb),
      num(data.fMetaI0PN),
      num(data.fMetaI1PN),
      num(data.fMetaI2PN),
      num(data.fMetaI3PN),
      num(data.fMetaIStuck),
      boolByte(data.fMetaICont),
      num(data.fMetaICleaved),
      num(data.pMetaIIDeg),
      num(data.fMetaII0pb),
      num(data.fMetaII0PN),
      num(data.fMetaII1PN),
      num(data.fMetaII2PN),
      num(data.fMetaII3PN),
      num(data.fMetaIIStuck),
      boolByte(data.fMetaIICont),
      num(data.fMetaIICleaved),
      num(data.pGVDeg),
      num(data.fGV0pb),
      num(data.fGV0PN),
      num(data.fGV1PN),
      num(data.fGV2PN),
      num(data.fGV3PN),
      num(data.fGVStuck),
      boolByte(data.fGVCont),
      num(data.fGVCleaved),
      queryIndex,
    ]
  );
}

async function loadIcsiRecord(data) {
  const params = buildIcsiParams(data, 2);
  const result = await executeDRL(ICSI_SP, params);
  return result.recordset?.[0] || null;
}

async function saveIcsiRecord(data) {
  const isUpdate = data.mode === 'update';
  const queryIndex = isUpdate ? 12 : 11;
  let icsiId = data.icsiId || '';

  if (!isUpdate && !icsiId) {
    icsiId = await createIcsiId({
      patId: data.patId,
      satId: data.satId,
      cycId: data.cycId,
      cycleDate: data.cycleDate,
    });
  }

  const payload = { ...data, icsiId };
  const params = buildIcsiParams(payload, queryIndex);
  await executeDML(ICSI_SP, params);
  return { icsiId, queryIndex };
}

async function getLookups() {
  const [doctors, labOptions, mediaBrand, mediaSeries, incubator, gas] = await Promise.all([
    masterService.listCommonMaster(16),
    masterService.listCommonMaster(2),
    masterService.listCommonMaster(28),
    masterService.listCommonMaster(29),
    masterService.listCommonMaster(30),
    masterService.listCommonMaster(31),
  ]);

  return { doctors, labOptions, mediaBrand, mediaSeries, incubator, gas };
}

module.exports = {
  listCycleDates,
  loadMonitoringChart,
  checkIcsiExists,
  loadIcsiRecord,
  saveIcsiRecord,
  getLookups,
};
