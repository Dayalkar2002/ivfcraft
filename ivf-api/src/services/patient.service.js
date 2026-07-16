const { executeDRL, buildParams, executeText } = require('../db/spExecutor');

const SATELLITE_SP = 'spSatelliteMasterExtDRL';
const PATIENT_SP = 'spPatientMasterExtDRL';
const PATIENT_SEARCH_SP = 'spPatientMasterSearch';

function mapPatientListRow(row) {
  const name = [row.Name ?? row.PatName, row.PatCategory].filter(Boolean).join(' ').trim();
  const age = row.PatAge ?? row.patage ?? row.Age ?? null;
  return {
    id: row.ID ?? row.PatID,
    uhid: String(row.PatRefNo ?? row.RefNo ?? row.PatID ?? '').trim(),
    name,
    partner: row.PatHusbName ?? row.HusbName ?? '',
    age: age !== null && age !== undefined && age !== '' ? Number(age) : null,
    gender: row.PatGender ?? row.Patcategory ?? row.Gender ?? '',
    aadhar: row.PatAdhar ?? row.PatAadh ?? '',
    satelliteId: row.SatID ?? row.SatId ?? null,
    category: row.PatCategory ?? '',
    raw: row,
  };
}

function mapPatientDetailRow(row) {
  const age = row.PatAge ?? row.patage ?? row.Age ?? null;
  return {
    id: row.PatID ?? row.ID,
    uhid: String(row.PatRefNo ?? row.RefNo ?? row.PatID ?? '').trim(),
    name: [row.PatName ?? row.Name, row.PatCategory].filter(Boolean).join(' ').trim(),
    partner: row.PatHusbName ?? row.HusbName ?? '',
    age: age !== null && age !== undefined && age !== '' ? Number(age) : null,
    gender: row.PatGender ?? row.Patcategory ?? '',
    aadhar: row.PatAdhar ?? '',
    satelliteId: row.SatID ?? row.SatId ?? null,
    email: row.PatEmail ?? '',
    mobile: row.PatMobileNo ?? '',
    address: row.PatAddress ?? '',
    city: row.PatCity ?? '',
    category: row.PatCategory ?? '',
    raw: row,
  };
}

async function getSatellites() {
  const params = buildParams('@SatID,@QueryIndex', [0, 1]);
  const result = await executeDRL(SATELLITE_SP, params);
  const rows = result.recordset || [];

  return rows.map((row) => ({
    id: row.ID ?? row.SatID,
    name: row.Name ?? row.SatName,
    shortName: row.SatShortName ?? '',
    raw: row,
  }));
}

async function listPatientsBySatellite(satelliteId) {
  const params = buildParams('@PatID,@SatID,@QueryIndex', [0, Number(satelliteId), 3]);
  const result = await executeDRL(PATIENT_SP, params);
  const rows = result.recordset || [];
  return rows.map(mapPatientListRow);
}

async function getPatientById(patientId, satelliteId) {
  const params = buildParams('@PatID,@SatID,@QueryIndex', [Number(patientId), Number(satelliteId), 2]);
  const result = await executeDRL(PATIENT_SP, params);
  const rows = result.recordset || [];

  if (!rows.length) {
    return null;
  }

  return mapPatientDetailRow(rows[0]);
}

async function searchPatients({ search = '', satelliteId = 0, refId = 0 }) {
  const term = search.trim();

  // Same SP as PatientMaster.aspx.cs / DonorSemen search
  const params = buildParams('@PatName,@PatHusbName,@PatAadh,@SatID,@RefID', [
    term,
    term,
    term,
    Number(satelliteId) || 0,
    Number(refId) || 0,
  ]);

  const result = await executeDRL(PATIENT_SEARCH_SP, params);
  const rows = result.recordset || [];
  return rows.map((row) => mapPatientDetailRow(row));
}

async function getPatientAadhar(patientId) {
  if (!patientId) return '';
  const result = await executeText(
    "SELECT LTRIM(RTRIM(ISNULL(PatAdhar, ''))) AS PatAdhar FROM PatientMaster WHERE PatID = @PatID",
    [{ name: '@PatID', value: Number(patientId) }]
  );
  return String(result.recordset?.[0]?.PatAdhar ?? '').trim();
}

async function getDonorLockedRecipientPatId(donorPatId) {
  const donorAadhar = await getPatientAadhar(donorPatId);
  if (!donorAadhar) return 0;

  const result = await executeText(
    `SELECT TOP 1 r.CycRURcptPatID
     FROM CycRetrieval r
     INNER JOIN PatientMaster donor ON r.PatID = donor.PatID
     WHERE r.CycRUToRcpt = 1
       AND r.CycRURcptPatID IS NOT NULL
       AND r.CycRURcptPatID > 0
       AND LTRIM(RTRIM(ISNULL(donor.PatAdhar, ''))) = @DonorAadhar
     ORDER BY r.CycDateOfCreation DESC`,
    [{ name: '@DonorAadhar', value: donorAadhar }]
  );

  return Number(result.recordset?.[0]?.CycRURcptPatID) || 0;
}

async function checkOocyteDonorAadhar({ donorPatId, recipientPatId, excludeCycId = '' }) {
  const params = buildParams('@DonorPatID,@RecipientPatID,@ExcludeCycID', [
    Number(donorPatId),
    Number(recipientPatId),
    excludeCycId || '',
  ]);
  const result = await executeDRL('spCheckOocyteDonorAadhar', params);
  const row = result.recordset?.[0] || {};
  const allowedValue = String(row.IsAllowed ?? '1');
  return {
    isAllowed: allowedValue === '1' || allowedValue.toLowerCase() === 'true',
    message: row.Message ?? '',
    donorAadhar: row.DonorAadhar ?? '',
    recipientAadhar: row.RecipientAadhar ?? '',
    mappedRecipientName: row.MappedRecipientName ?? '',
  };
}

module.exports = {
  getSatellites,
  listPatientsBySatellite,
  getPatientById,
  searchPatients,
  getPatientAadhar,
  getDonorLockedRecipientPatId,
  checkOocyteDonorAadhar,
};
