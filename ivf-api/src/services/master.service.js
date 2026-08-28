const { executeDRL, executeDML, buildParams, executeText } = require('../db/spExecutor');
const { getCommonMasterByCatId } = require('../config/masterRegistry');

const COMMON_SP = 'spCommonMaster';
const PATIENT_SP = 'spPatientMaster';
const DOCTOR_SP = 'spDoctorMaster';
const DOCTOR_EXT_SP = 'spDoctorMasterExtDRL';
const SATELLITE_SP = 'spSatelliteMaster';
const SATELLITE_EXT_SP = 'spSatelliteMasterExtDRL';
const USER_SP = 'spUserMaster';

function mapLookupRow(row) {
  return {
    id: row.ID ?? row.CommID ?? row.DocID ?? row.SatID ?? row.UserID,
    name: row.Name ?? row.CommName ?? row.DocName ?? row.SatName ?? row.UserName ?? '',
    raw: row,
  };
}

function mapCommonRow(row) {
  return {
    id: row.ID ?? row.CommID,
    name: row.Name ?? row.CommName ?? '',
    raw: row,
  };
}

async function listCommonMaster(catId) {
  const params = buildParams('@CommID,@commName,@CatID,@QueryIndex', [0, '', Number(catId), 1]);
  const result = await executeDRL(COMMON_SP, params);
  return (result.recordset || []).map(mapCommonRow);
}

async function saveCommonMaster(catId, { id = 0, name, action = 'insert' }) {
  const queryIndexMap = { insert: 11, update: 12, delete: 13 };
  const queryIndex = queryIndexMap[action];
  if (!queryIndex) {
    throw new Error('Invalid action. Use insert, update, or delete.');
  }

  const params = buildParams('@CommID,@commName,@CatID,@QueryIndex', [
    Number(id) || 0,
    name ?? '',
    Number(catId),
    queryIndex,
  ]);

  await executeDML(COMMON_SP, params);
  return listCommonMaster(catId);
}

async function getPatMaritalStatus(patId) {
  if (!patId) return 'Married';
  try {
    const result = await executeText(
      "SELECT LTRIM(RTRIM(ISNULL(PatMaritalStatus, 'Married'))) AS PatMaritalStatus FROM PatientMaster WHERE PatID = @PatID",
      [{ name: '@PatID', value: Number(patId) }]
    );
    return String(result.recordset?.[0]?.PatMaritalStatus ?? 'Married').trim() || 'Married';
  } catch {
    return 'Married';
  }
}

async function savePatMaritalStatus(patId, maritalStatus) {
  if (!patId || !maritalStatus) return;
  await executeText(
    'UPDATE PatientMaster SET PatMaritalStatus = @PatMaritalStatus WHERE PatID = @PatID',
    [
      { name: '@PatMaritalStatus', value: maritalStatus },
      { name: '@PatID', value: Number(patId) },
    ]
  );
}

async function getPatientLookups() {
  const [satellites, doctors, diagnosis, refBy] = await Promise.all([
    executeDRL(SATELLITE_EXT_SP, buildParams('@SatID,@QueryIndex', [0, 1])),
    executeDRL(DOCTOR_EXT_SP, buildParams('@DocID,@QueryIndex', [0, 1])),
    listCommonMaster(20),
    listCommonMaster(21),
  ]);

  return {
    satellites: (satellites.recordset || []).map(mapLookupRow),
    doctors: (doctors.recordset || []).map(mapLookupRow),
    diagnosis,
    refBy,
  };
}

function defaultPatientPayload(overrides = {}) {
  const today = new Date();
  return {
    patId: 0,
    refNo: '',
    dateOfCreation: today,
    name: '',
    category: '',
    age: 0,
    dob: today,
    address: '',
    city: '',
    phone: '',
    mobile: '',
    email: '',
    docId: 0,
    diagId: 0,
    husbandName: '',
    husbandAge: 0,
    husbandDob: today,
    satId: 0,
    refId: 0,
    panCard: '',
    aadhar: '',
    husbandAadhar: '',
    husbandPan: '',
    husbandEmail: '',
    photo: '',
    ...overrides,
  };
}

function buildPatientParams(payload, queryIndex) {
  return buildParams(
    '@PatID,@PatRefNo,@PatDateOfCreation,@PatName,@Patcategory,@PatAge,@PatDob,@PatAddress,@PatCity,@PatPhoneNo,@PatMobileNo,@PatEmail,@DocID,@DiagID,@PatHusbName,@PatHusbAge,@PatHusbDob,@SatID,@RefID,@QueryIndex,@PatPancard,@PatAdhar,@HusbandAdhar,@HusbandPan,@HusbandEmail,@patPhoto',
    [
      Number(payload.patId) || 0,
      payload.refNo ?? '',
      payload.dateOfCreation ?? new Date(),
      payload.name ?? '',
      payload.category ?? '',
      Number(payload.age) || 0,
      payload.dob ?? new Date(),
      payload.address ?? '',
      payload.city ?? '',
      payload.phone ?? '',
      payload.mobile ?? '',
      payload.email ?? '',
      Number(payload.docId) || 0,
      Number(payload.diagId) || 0,
      payload.husbandName ?? '',
      Number(payload.husbandAge) || 0,
      payload.husbandDob ?? new Date(),
      Number(payload.satId) || 0,
      Number(payload.refId) || 0,
      queryIndex,
      payload.panCard ?? '',
      payload.aadhar ?? '',
      payload.husbandAadhar ?? '',
      payload.husbandPan ?? '',
      payload.husbandEmail ?? '',
      payload.photo ?? '',
    ]
  );
}

function mapPatientRow(row) {
  return {
    id: row.PatID ?? row.ID,
    refNo: row.PatRefNo ?? '',
    name: row.PatName ?? row.Name ?? '',
    category: row.PatCategory ?? row.Patcategory ?? '',
    husbandName: row.PatHusbName ?? '',
    address: row.PatAddress ?? '',
    dateOfCreation: row.PatDateOfCreation ?? null,
    raw: row,
  };
}

function mapPatientDetail(row) {
  return {
    id: row.PatID,
    refNo: row.PatRefNo ?? '',
    dateOfCreation: row.PatDateOfCreation ?? null,
    name: row.PatName ?? '',
    category: row.PatCategory ?? row.Patcategory ?? '',
    age: row.PatAge ?? 0,
    dob: row.PatDob ?? null,
    address: row.PatAddress ?? '',
    city: row.PatCity ?? '',
    phone: row.PatPhoneNo ?? '',
    mobile: row.PatMobileNo ?? '',
    email: row.PatEmail ?? '',
    docId: row.DocID ?? 0,
    diagId: row.DiagID ?? 0,
    husbandName: row.PatHusbName ?? '',
    husbandAge: row.PatHusbAge ?? 0,
    husbandDob: row.PatHusbDob ?? null,
    satId: row.SatID ?? 0,
    refId: row.RefID ?? 0,
    panCard: row.PatPancard ?? '',
    aadhar: row.PatAdhar ?? '',
    husbandAadhar: row.HusbandAdhar ?? '',
    husbandPan: row.HusbandPan ?? '',
    husbandEmail: row.HusbandEmail ?? '',
    photo: row.patPhoto ?? '',
    maritalStatus: row.PatMaritalStatus ?? 'Married',
    raw: row,
  };
}

async function listPatients(payload = {}) {
  const params = buildPatientParams(defaultPatientPayload(payload), 1);
  const result = await executeDRL(PATIENT_SP, params);
  return (result.recordset || []).map(mapPatientRow);
}

async function getPatientById(patId) {
  const params = buildPatientParams(defaultPatientPayload({ patId: Number(patId) }), 2);
  const result = await executeDRL(PATIENT_SP, params);
  const rows = result.recordset || [];
  if (!rows.length) return null;

  const detail = mapPatientDetail(rows[0]);
  detail.maritalStatus = await getPatMaritalStatus(detail.id);
  return detail;
}

function normalizePatientPayload(payload) {
  const maritalStatus = payload.maritalStatus || 'Married';
  const normalized = {
    ...payload,
    category: '',
    maritalStatus,
  };

  if (maritalStatus === 'Unmarried') {
    normalized.phone = '';
    normalized.husbandAadhar = '';
    normalized.husbandPan = '';
    normalized.husbandEmail = '';
  }

  return normalized;
}

async function savePatient(payload, action = 'insert') {
  const normalized = normalizePatientPayload(payload);
  const queryIndex = action === 'update' ? 12 : 11;
  const params = buildPatientParams(defaultPatientPayload(normalized), queryIndex);

  if (action === 'insert') {
    const dupParams = buildPatientParams(defaultPatientPayload(normalized), 10);
    const dupCheck = await executeDRL(PATIENT_SP, dupParams);
    if ((dupCheck.recordset || []).length > 0) {
      const err = new Error('Patient Aadhar already exists.');
      err.status = 409;
      throw err;
    }
  }

  const result = await executeDML(PATIENT_SP, params);
  const savedPatId =
    action === 'update'
      ? Number(normalized.patId) || 0
      : Number(result.returnValue) || Number(normalized.patId) || 0;

  if (savedPatId > 0 && normalized.maritalStatus) {
    await savePatMaritalStatus(savedPatId, normalized.maritalStatus);
  }

  return listPatients({ satId: normalized.satId });
}

async function deletePatient(patId) {
  const params = buildPatientParams(defaultPatientPayload({ patId: Number(patId) }), 13);
  await executeDML(PATIENT_SP, params);
  return { success: true };
}

function buildDoctorParams(payload, queryIndex) {
  return buildParams(
    '@DocID,@DocName,@DocAddress1,@DocAddress2,@DocAddress3,@DocCity,@DocPhone,@DocMobile,@DocPager,@DocEmail,@DocDegree,@DocSpeciality,@DocStartTime,@DocEndTime,@QueryIndex',
    [
      Number(payload.docId) || 0,
      payload.name ?? '',
      payload.address1 ?? '',
      payload.address2 ?? '',
      payload.address3 ?? '',
      payload.city ?? '',
      payload.phone ?? '',
      payload.mobile ?? '',
      payload.pager ?? '',
      payload.email ?? '',
      payload.degree ?? '',
      payload.speciality ?? '',
      payload.startTime ?? '1900-01-01T00:00:00',
      payload.endTime ?? '1900-01-01T23:45:00',
      queryIndex,
    ]
  );
}

function mapDoctorRow(row) {
  return {
    id: row.DocID ?? row.ID,
    name: row.DocName ?? row.Name ?? '',
    city: row.DocCity ?? '',
    phone: row.DocPhone ?? '',
    mobile: row.DocMobile ?? '',
    email: row.DocEmail ?? '',
    raw: row,
  };
}

function mapDoctorDetail(row) {
  return {
    id: row.DocID,
    name: row.DocName ?? '',
    address1: row.DocAddress1 ?? '',
    address2: row.DocAddress2 ?? '',
    address3: row.DocAddress3 ?? '',
    city: row.DocCity ?? '',
    phone: row.DocPhone ?? '',
    mobile: row.DocMobile ?? '',
    pager: row.DocPager ?? '',
    email: row.DocEmail ?? '',
    degree: row.DocDegree ?? '',
    speciality: row.DocSpeciality ?? '',
    startTime: row.DocStartTime ?? null,
    endTime: row.DocEndTime ?? null,
    raw: row,
  };
}

async function listDoctors() {
  const params = buildDoctorParams({}, 1);
  const result = await executeDRL(DOCTOR_SP, params);
  return (result.recordset || []).map(mapDoctorRow);
}

async function getDoctorById(docId) {
  const params = buildDoctorParams({ docId: Number(docId) }, 2);
  const result = await executeDRL(DOCTOR_SP, params);
  const rows = result.recordset || [];
  return rows.length ? mapDoctorDetail(rows[0]) : null;
}

async function saveDoctor(payload, action = 'insert') {
  const queryIndex = action === 'update' ? 12 : 11;
  const params = buildDoctorParams(payload, queryIndex);
  await executeDML(DOCTOR_SP, params);
  return listDoctors();
}

function buildSatelliteParams(payload, queryIndex) {
  return buildParams(
    '@SatID,@SatName,@SatShortName,@SatAddress1,@SatAddress2,@SatCity,@SatDrOne,@SatDrOneDeg,@SatDrTwo,@SatDrTwoDeg,@SatPhoneNo,@SatMobileNo,@SatFax,@SatEmail,@QueryIndex',
    [
      Number(payload.satId) || 0,
      payload.name ?? '',
      payload.shortName ?? '',
      payload.address1 ?? '',
      payload.address2 ?? '',
      payload.city ?? '',
      payload.drOne ?? '',
      payload.drOneDeg ?? '',
      payload.drTwo ?? '',
      payload.drTwoDeg ?? '',
      payload.phone ?? '',
      payload.mobile ?? '',
      payload.fax ?? '',
      payload.email ?? '',
      queryIndex,
    ]
  );
}

function mapSatelliteRow(row) {
  return {
    id: row.SatID ?? row.ID,
    name: row.SatName ?? row.Name ?? '',
    shortName: row.SatShortName ?? '',
    city: row.SatCity ?? '',
    phone: row.SatPhoneNo ?? '',
    raw: row,
  };
}

function mapSatelliteDetail(row) {
  return {
    id: row.SatID,
    name: row.SatName ?? '',
    shortName: row.SatShortName ?? '',
    address1: row.SatAddress1 ?? '',
    address2: row.SatAddress2 ?? '',
    city: row.SatCity ?? '',
    drOne: row.SatDrOne ?? '',
    drOneDeg: row.SatDrOneDeg ?? '',
    drTwo: row.SatDrTwo ?? '',
    drTwoDeg: row.SatDrTwoDeg ?? '',
    phone: row.SatPhoneNo ?? '',
    mobile: row.SatMobileNo ?? '',
    fax: row.SatFax ?? '',
    email: row.SatEmail ?? '',
    raw: row,
  };
}

async function listSatellitesMaster() {
  const params = buildSatelliteParams({}, 3);
  const result = await executeDRL(SATELLITE_SP, params);
  return (result.recordset || []).map(mapSatelliteRow);
}

async function getSatelliteById(satId) {
  const params = buildSatelliteParams({ satId: Number(satId) }, 2);
  const result = await executeDRL(SATELLITE_SP, params);
  const rows = result.recordset || [];
  return rows.length ? mapSatelliteDetail(rows[0]) : null;
}

async function saveSatellite(payload, action = 'insert') {
  const queryIndex = action === 'update' ? 12 : 11;
  const params = buildSatelliteParams(payload, queryIndex);
  await executeDML(SATELLITE_SP, params);
  return listSatellitesMaster();
}

async function listUsers() {
  const params = buildParams(
    '@UserID,@UserName,@UserLoginName,@UserPassword,@UserRitID,@AppointMentSchedule,@BT,@Cycle,@DoctorMaster,@ET,@ICSI,@IUI,@IVF,@Master,@Media,@OutComeDrugMaster,@PatientMaster,@RptConsentForms,@RptEmbryosPictures,@RptHSASummary,@RptIUISummary,@RptIVFSummary,@SatelliteMaster,@UserMaster,@QueryIndex',
    [0, '', '', '', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]
  );
  const result = await executeDRL(USER_SP, params);
  return (result.recordset || []).map((row) => ({
    id: row.UserID ?? row.ID,
    name: row.UserName ?? '',
    loginName: row.UserLoginName ?? '',
    roleId: row.UserRitID ?? 0,
    raw: row,
  }));
}

module.exports = {
  getCommonMasterByCatId,
  listCommonMaster,
  saveCommonMaster,
  getPatientLookups,
  listPatients,
  getPatientById,
  savePatient,
  deletePatient,
  listDoctors,
  getDoctorById,
  saveDoctor,
  listSatellitesMaster,
  getSatelliteById,
  saveSatellite,
  listUsers,
  getPatMaritalStatus,
  savePatMaritalStatus,
};
