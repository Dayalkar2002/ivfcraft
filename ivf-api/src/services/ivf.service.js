const { executeDRL, executeDML, buildParams } = require('../db/spExecutor');
const masterService = require('./master.service');

const IVF_EXT_SP = 'spIVFExtDRL';
const IVF_SP = 'spIVF';
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

async function checkIvfExists({ patId, satId, cycId, cycleDate }) {
  const params = buildParams('@PatID,@SatID,@CycID,@IVFCycleDate,@QueryIndex', [
    num(patId),
    num(satId),
    cycId || '',
    cycleDate ? new Date(cycleDate) : new Date(),
    1,
  ]);
  const result = await executeDRL(IVF_EXT_SP, params);
  return (result.recordset || []).length > 0;
}

async function createIvfId({ patId, satId, cycId, cycleDate }) {
  const params = buildParams('@PatID,@SatID,@CycID,@IVFCycleDate,@QueryIndex', [
    num(patId),
    num(satId),
    cycId || '',
    cycleDate ? new Date(cycleDate) : new Date(),
    2,
  ]);
  const result = await executeDRL(IVF_EXT_SP, params);
  const rowCount = num(result.recordset?.[0]?.[Object.keys(result.recordset[0] || {})[0]], 0);
  return `IVF${satId}${patId}${rowCount + 1}`;
}

function buildIvfParams(data, queryIndex) {
  return buildParams(
    '@IVFID,@PatID,@SatID,@CycID,@IVFCycleDate,@IVFDateOfCreation,@IVFSGnRN,@IVFSLuteal,@IVFSStopL,@IVFSNone,@MCCDFSHDrug1,@MCCDFSHDrug2,@MCCDHMGDrug1,@MCCDHMGDrgu2,@IVFSOther,@IVFSOtherVal,@IVFSNaturalCycle,@IVFSE2Pattern1,@IVFSE2Pattern2,@IVFSE2Pattern3,@IVFSE2Pattern4,@IVFSNODStimulation,@IVFSIntervalToHCG,@IVFSIntervalFromHCGHrs,@IVFSIntervalFromHCGMin,@IVFPInsemination,@IVFPConcStandard,@IVFPHigh,@IVFPICSI,@IVFPSpAssHatch,@IVFPSpEBiopsy,@IVFPSpCTrans,@IVFPRetPerID,@IVFPTransPerID,@LabOptID,@MediaBrand,@MediaSeries,@IncubatorUsed,@Gas,@IVFSType1,@IVFSType2,@IVFSType3,@IVFSType4,@IVFOIMetaII,@IVFOIMetaI,@IVFOIGV,@IVFOIDEG,@IVFPMetaIDEG,@IVFFMetaI0pb,@IVFFMetaI0PN,@IVFFMetaI1PN,@IVFFMetaI2PN,@IVFFMetaI3PN,@IVFFMetaIStuck,@IVFFMetaICont,@IVFFMetaICleaved,@IVFRIMetaIAllocated,@IVFRIMetaIRescued,@IVFPMetaIIDEG,@IVFFMetaII0pb,@IVFFMetaII0PN,@IVFFMetaII1PN,@IVFFMetaII2PN,@IVFFMetaII3PN,@IVFFMetaIIStuck,@IVFFMetaIICont,@IVFFMetaIICleaved,@IVFRIMetaIIAllocated,@IVFRIMetaIIRescued,@IVFPGVDEG,@IVFFGV0pb,@IVFFGV0PN,@IVFFGV1PN,@IVFFGV2PN,@IVFFGV3PN,@IVFFGVStuck,@IVFFGVCont,@IVFFGVCleaved,@IVFRIGVAllocated,@IVFRIGVRescued,@QueryIndex',
    [
      data.ivfId || '',
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
      num(data.inseminationHours),
      boolByte(data.concStandard),
      boolByte(data.concHigh),
      boolByte(data.concIcsi),
      boolByte(data.spAssHatch),
      boolByte(data.spEmbryoBiopsy),
      boolByte(data.spImsi),
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
      num(data.riMetaIAllocated),
      num(data.riMetaIRescued),
      num(data.pMetaIIDeg),
      num(data.fMetaII0pb),
      num(data.fMetaII0PN),
      num(data.fMetaII1PN),
      num(data.fMetaII2PN),
      num(data.fMetaII3PN),
      num(data.fMetaIIStuck),
      boolByte(data.fMetaIICont),
      num(data.fMetaIICleaved),
      num(data.riMetaIIAllocated),
      num(data.riMetaIIRescued),
      num(data.pGVDeg),
      num(data.fGV0pb),
      num(data.fGV0PN),
      num(data.fGV1PN),
      num(data.fGV2PN),
      num(data.fGV3PN),
      num(data.fGVStuck),
      boolByte(data.fGVCont),
      num(data.fGVCleaved),
      num(data.riGVAllocated),
      num(data.riGVRescued),
      queryIndex,
    ]
  );
}

async function loadIvfRecord(data) {
  const params = buildIvfParams(data, 2);
  const result = await executeDRL(IVF_SP, params);
  return result.recordset?.[0] || null;
}

async function saveIvfRecord(data) {
  const isUpdate = data.mode === 'update';
  const queryIndex = isUpdate ? 12 : 11;
  let ivfId = data.ivfId || '';

  if (!isUpdate && !ivfId) {
    ivfId = await createIvfId({
      patId: data.patId,
      satId: data.satId,
      cycId: data.cycId,
      cycleDate: data.cycleDate,
    });
  }

  const payload = { ...data, ivfId };
  const params = buildIvfParams(payload, queryIndex);
  await executeDML(IVF_SP, params);
  return { ivfId, queryIndex };
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
  checkIvfExists,
  loadIvfRecord,
  saveIvfRecord,
  getLookups,
};
