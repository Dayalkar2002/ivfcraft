const { executeDML, executeDRL, executeText, buildParams } = require('../db/spExecutor');
const { isDbConfigured } = require('../db/pool');
const patientCategoryService = require('./patient-category.service');

const RETRIEVAL_SP = 'spCycRetrieval';
const RETRIEVAL_EXT_SP = 'spCycRetrievalExtDRL';
const RETRIEVAL_PARAMS =
  '@CycID,@CycRID,@PatID,@SatID,@CycDateOfCreation,@CycRSelf,@CycRFromDonor,@CycRDonPatID,@CycRUSelf,@CycRUToRcpt,@CycRURcptPatID,@CycRFD,@CycRFDLOvary,@CycRFDROvary,@CycRIVF,@CycRICSI,@CycRGift,@CycRZift,@CycRDamaged,@CycRToRcpt,@QueryIndex,@TotalEggCount,@RecptCycId';

function num(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseDate(value) {
  if (!value) return new Date();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function rowHasValues(row) {
  if (!row) return false;
  return [
    row.leftOvary,
    row.rightOvary,
    row.ivf,
    row.icsi,
    row.gift,
    row.zift,
    row.damaged,
    row.total,
    row.recipientPatientId,
  ].some((v) => v !== null && v !== undefined && v !== '');
}

function buildSpParams(cycId, cycRId, patId, satId, cycleDate, entity, queryIndex) {
  return buildParams(RETRIEVAL_PARAMS, [
    cycId,
    num(cycRId),
    num(patId),
    num(satId),
    parseDate(cycleDate),
    entity.bCycRSelf ? 1 : 0,
    entity.bCycRFromDonor ? 1 : 0,
    num(entity.iCycRDonPatID),
    entity.bCycRUSelf ? 1 : 0,
    entity.bCycRUToRcpt ? 1 : 0,
    num(entity.iCycRURcptPatID),
    num(entity.iCycRFD),
    num(entity.iCycRFDLOvary),
    num(entity.iCycRFDROvary),
    num(entity.iCycRIVF),
    num(entity.iCycRICSI),
    num(entity.iCycRGift),
    num(entity.iCycRZift),
    num(entity.iCycRDamaged),
    num(entity.iCycRToRcpt),
    queryIndex,
    num(entity.iTotalEggCount),
    entity.sRecptCycId || '',
  ]);
}

function mapSelfToSelfEntities(rows) {
  return (rows || [])
    .filter(rowHasValues)
    .map((row) => ({
      bCycRSelf: true,
      bCycRUSelf: true,
      bCycRFromDonor: false,
      bCycRUToRcpt: false,
      iCycRDonPatID: 0,
      iCycRURcptPatID: 0,
      iCycRFD: 0,
      iCycRFDLOvary: num(row.leftOvary),
      iCycRFDROvary: num(row.rightOvary),
      iCycRIVF: num(row.ivf),
      iCycRICSI: num(row.icsi),
      iCycRGift: num(row.gift),
      iCycRZift: num(row.zift),
      iCycRDamaged: num(row.damaged),
      iCycRToRcpt: 0,
      iTotalEggCount: num(row.total),
      sRecptCycId: '',
    }));
}

function mapDonorToRecipientEntities(rows, donorPatId) {
  return (rows || [])
    .filter((row) => rowHasValues(row) && row.recipientPatientId)
    .map((row) => ({
      bCycRSelf: true,
      bCycRUSelf: true,
      bCycRFromDonor: true,
      bCycRUToRcpt: true,
      iCycRDonPatID: num(donorPatId),
      iCycRURcptPatID: num(row.recipientPatientId),
      iCycRFD: 0,
      iCycRFDLOvary: num(row.leftOvary),
      iCycRFDROvary: num(row.rightOvary),
      iCycRIVF: num(row.ivf),
      iCycRICSI: num(row.icsi),
      iCycRGift: num(row.gift),
      iCycRZift: num(row.zift),
      iCycRDamaged: num(row.damaged),
      iCycRToRcpt: 0,
      iTotalEggCount: num(row.total),
      sRecptCycId: row.recipientCycleId || '',
    }));
}

function mapDbRowsToRetrievalData(rows, patId) {
  const selfToSelf = [];
  const donorToRecipient = [];

  for (const dr of rows || []) {
    const mapped = {
      leftOvary: num(dr.CycRFDLOvary),
      rightOvary: num(dr.CycRFDROvary),
      ivf: num(dr.CycRIVF),
      icsi: num(dr.CycRICSI),
      gift: num(dr.CycRGift),
      zift: num(dr.CycRZift),
      damaged: num(dr.CycRDamaged),
      total: num(dr.TotalEggCount),
      recipientPatientId: num(dr.CycRURcptPatID) || null,
      recipientCycleId: dr.RecptCycId || '',
    };

    const isDonorToRecipient = dr.CycRFromDonor === true || dr.CycRFromDonor === 1;
    const isToRecipient = dr.CycRUToRcpt === true || dr.CycRUToRcpt === 1;

    if (isDonorToRecipient && isToRecipient && mapped.recipientPatientId) {
      donorToRecipient.push(mapped);
    } else if ((dr.CycRSelf === true || dr.CycRSelf === 1) && (dr.CycRUSelf === true || dr.CycRUSelf === 1)) {
      selfToSelf.push(mapped);
    }
  }

  const data = {};
  if (selfToSelf.length) data.selfToSelf = selfToSelf;
  if (donorToRecipient.length) data.donorToRecipient = donorToRecipient;
  return data;
}

async function resolveCycRId(cycId, patId, satId) {
  const params = buildParams('@CycID,@PatID,@SatID,@QueryIndex', [cycId, num(patId), num(satId), 3]);
  const result = await executeDRL(RETRIEVAL_EXT_SP, params);
  const count = num(result.recordset?.[0]?.[0] ?? result.recordset?.[0]?.Count, 0);
  return count + 1;
}

async function deleteExistingRetrieval(cycId, cycRId, patId, satId) {
  const params = buildSpParams(
    cycId,
    cycRId,
    patId,
    satId,
    new Date(),
    {
      bCycRSelf: false,
      bCycRFromDonor: false,
      bCycRUSelf: false,
      bCycRUToRcpt: false,
      iCycRDonPatID: 0,
      iCycRURcptPatID: 0,
      iCycRFD: 0,
      iCycRFDLOvary: 0,
      iCycRFDROvary: 0,
      iCycRIVF: 0,
      iCycRICSI: 0,
      iCycRGift: 0,
      iCycRZift: 0,
      iCycRDamaged: 0,
      iCycRToRcpt: 0,
      iTotalEggCount: 0,
      sRecptCycId: '',
    },
    13
  );
  await executeDML(RETRIEVAL_SP, params);
}

async function loadRetrieval({ cycId, patId, satId }) {
  if (!isDbConfigured()) return null;

  try {
    const result = await executeText(
      `SELECT *
       FROM CycRetrieval
       WHERE LTRIM(RTRIM(CycID)) = @CycID
         AND PatID = @PatID
       ORDER BY CycRID`,
      [
        { name: '@CycID', value: String(cycId).trim() },
        { name: '@PatID', value: num(patId) },
      ]
    );
    const rows = result.recordset || [];
    if (!rows.length) return null;
    return mapDbRowsToRetrievalData(rows, patId);
  } catch {
    return null;
  }
}

async function saveRetrieval({ cycId, patId, satId, cycleDate, sections }) {
  if (!isDbConfigured()) return null;

  const entities = [
    ...mapSelfToSelfEntities(sections?.selfToSelf),
    ...mapDonorToRecipientEntities(sections?.donorToRecipient, patId),
  ];

  if (!entities.length) {
    return { selfToSelf: sections?.selfToSelf, donorToRecipient: sections?.donorToRecipient };
  }

  const cycRId = await resolveCycRId(cycId, patId, satId);
  await deleteExistingRetrieval(cycId, cycRId, patId, satId);

  for (const entity of entities) {
    await executeDML(RETRIEVAL_SP, buildSpParams(cycId, cycRId, patId, satId, cycleDate, entity, 11));
  }

  const donationDate = parseDate(cycleDate);
  for (const entity of entities) {
    if (entity.bCycRUToRcpt && entity.iCycRURcptPatID > 0 && entity.iCycRDonPatID > 0) {
      await patientCategoryService.updateDonorCategoryAfterDonation(
        entity.iCycRDonPatID,
        entity.iCycRURcptPatID,
        donationDate
      );
    }
  }

  return {
    selfToSelf: sections?.selfToSelf,
    donorToRecipient: sections?.donorToRecipient,
  };
}

module.exports = {
  loadRetrieval,
  saveRetrieval,
};
