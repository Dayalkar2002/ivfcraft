const { executeDRL, executeDML, buildParams } = require('../db/spExecutor');
const { isDbConfigured } = require('../db/pool');
const masterService = require('./master.service');

const HISTORY_SP = 'spCycHistory';
const HISTORY_ATTEMPT_SP = 'spCycHistoryAttempt';
const HISTORY_ATTEMPT_EXT_SP = 'spCycHistoryAttemptExtDRL';
const SURVIVAL_SP = 'spCycSurvivalReport';
const MCCD_SP = 'spCycmonitoringchartCycleDay';
const MCRD_SP = 'spCycMonitoringChartRemDay';
const OUTCOME_SP = 'spCycOutCome';

function num(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function boolByte(value) {
  return value ? 1 : 0;
}

function parseDate(value) {
  if (!value) return new Date();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function mapRow(row) {
  if (!row) return null;
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    const key = k.charAt(0).toLowerCase() + k.slice(1);
    out[key] = v;
  }
  return out;
}

function defaultHistory() {
  return {
    cycHId: 0,
    height: 0,
    weight: 0,
    bmi: 0,
    allergyId: 0,
    medSurHistory: '',
    isg: 0,
    isp: 0,
    isAb: 0,
    isEct: 0,
    isDuration: 0,
    findings: {
      idiopathic: false,
      if: false,
      mf: false,
      dor: false,
      ovu: false,
      tf: false,
      cf: false,
      endo: false,
      other: false,
    },
    endoOpt: 0,
    otherTxt: '',
    indication: '',
    hispanic: { asian: false, black: false, white: false, other: false },
    hlmp: '',
    nonHispanic: { asian: false, black: false, white: false, unknown: false },
    hsg: '',
    stimProtId: 0,
    attemptCount: 0,
    attemptPrev: 0,
    attemptEw: 0,
    currentDate: new Date().toISOString().split('T')[0],
    comments: '',
    historyAttempts: [],
  };
}

function defaultSurvival() {
  return {
    cycSId: 0,
    conc: 0,
    motility: 0,
    nmph1: 0,
    nmph2: 0,
    date: new Date().toISOString().split('T')[0],
    recovery: '',
    antibodies: '',
    saResult: { positive: false, borderline: false, negative: false },
    gnrh: { none: false, stopLupron: false, luteal: false },
    dosage: false,
    spermSource: { donor: false, donorCryo: false, husband: false, husbandCryo: false },
    transferType: { ivf: false, gift: false, zift: false, cryoAll: false },
    consent: { icsi: false, hatching: false, cryo: false, immatures: false, apa: false },
    comments: '',
  };
}

function defaultMonitoring() {
  return {
    day0: {
      cycMccdId: 0,
      date: new Date().toISOString().split('T')[0],
      fshDrug1: 0,
      fshDrug1Dose: 0,
      fshDrug2: 0,
      fshDrug2Dose: 0,
      hmgDrug1: 0,
      hmgDrug1Dose: 0,
      hmgDrug2: 0,
      hmgDrug2Dose: 0,
      cloDrug1: 0,
      cloDrug1Dose: 0,
      antaDrug1: 0,
      antaDrug1Dose: 0,
      othDrug1: 0,
      othDrug1Dose: 0,
      gnrha: 0,
      e2: 0,
      lh: 0,
      fsh: 0,
      tsh: 0,
      prol: 0,
      prog: 0,
      remarks: '',
      ultrasound: '',
      endometrium: '',
    },
    remDays: [],
  };
}

function defaultOutcome(cycleType = '') {
  return {
    cycOId: 0,
    outcomeDate: new Date().toISOString().split('T')[0],
    bhcgDate: '',
    value: 0,
    noSacs: 0,
    ptDay: 0,
    outcome: 0,
    pregOpt: 0,
    pregDelOpt: 0,
    postTreatment: '',
    advice:
      '1. Bed Rest.\n2. No Sexual Relation\n3. Contact the clinic if:-\n   (i) Bleeding / spotting\n   (ii) Pain in abdomen\n   (iii) Fever\n   (iv) Other complains if any',
    treatment: '',
    cycleType,
  };
}

function buildHistoryParams(data, patId, satId, cycId, queryIndex) {
  const f = data.findings || {};
  const h = data.hispanic || {};
  const nh = data.nonHispanic || {};
  return buildParams(
    '@CycID,@CycHID,@PatID,@SatID,@CycHDateOfCreation,@CycHHeight,@CycHWeight,@CycHBMI,@AllergyID,@CycHMedSur,@CycHISG,@CycHISP,@CycHISAb,@CycHISEct,@CycHISDuration,@CycHIdio,@CycHIF,@CycHMF,@CycHDOR,@CycHOvu,@CycHTF,@CycHCF,@CycHEndo,@CycHEndoOpt,@CycHOther,@CycHOtherTXT,@CycHIndi,@CycHHAsian,@CycHHBlack,@CycHHWhite,@CycHHOther,@CycHHLMP,@CycHNHAsian,@CycHNHBlack,@CycHNHWhite,@CycHNHUnknown,@CycHHSG,@StimProtID,@CycHAttem,@CycHAttemPrev,@CycHAttemEW,@CycHCurrentDate,@CycHComments,@QueryIndex',
    [
      cycId,
      num(data.cycHId),
      num(patId),
      num(satId),
      new Date(),
      num(data.height),
      num(data.weight),
      num(data.bmi),
      num(data.allergyId),
      data.medSurHistory || '',
      num(data.isg),
      num(data.isp),
      num(data.isAb),
      num(data.isEct),
      num(data.isDuration),
      boolByte(f.idiopathic),
      boolByte(f.if),
      boolByte(f.mf),
      boolByte(f.dor),
      boolByte(f.ovu),
      boolByte(f.tf),
      boolByte(f.cf),
      boolByte(f.endo),
      num(data.endoOpt),
      boolByte(f.other),
      data.otherTxt || '',
      data.indication || '',
      boolByte(h.asian),
      boolByte(h.black),
      boolByte(h.white),
      boolByte(h.other),
      parseDate(data.hlmp),
      boolByte(nh.asian),
      boolByte(nh.black),
      boolByte(nh.white),
      boolByte(nh.unknown),
      data.hsg || '',
      num(data.stimProtId),
      num(data.attemptCount),
      num(data.attemptPrev),
      num(data.attemptEw),
      parseDate(data.currentDate),
      data.comments || '',
      queryIndex,
    ]
  );
}

function buildSurvivalParams(data, patId, satId, cycId, queryIndex) {
  const sa = data.saResult || {};
  const g = data.gnrh || {};
  const sp = data.spermSource || {};
  const tr = data.transferType || {};
  const c = data.consent || {};
  return buildParams(
    '@CycID,@CycSID,@PatID,@SatID,@CycSDateOfCreation,@CycSSConcSpearm,@CycSSMotility,@CycSSNMPH1,@CycSSNMPH2,@CycSSDate,@CycSSRecovery,@CycSSAntibodies,@CycSAPositive,@CycSABorderline,@CycSANegative,@CycSGNone,@CycSGStopLupron,@CycSGLuteal,@CycSDosage,@CycSSpDonor,@CycSSpDonorCryo,@CycSSpHusb,@CycSSpHusbCryo,@CycSTIVF,@CycSTGIFT,@CycSTZIFT,@CycSTCryoAll,@CycSCICSI,@CycSCHatching,@CycSCCryo,@CycSCImmatures,@CycSCAPA,@CycSComments,@QueryIndex',
    [
      cycId,
      num(data.cycSId),
      num(patId),
      num(satId),
      new Date(),
      num(data.conc),
      num(data.motility),
      num(data.nmph1),
      num(data.nmph2),
      parseDate(data.date),
      data.recovery || '',
      data.antibodies || '',
      boolByte(sa.positive),
      boolByte(sa.borderline),
      boolByte(sa.negative),
      boolByte(g.none),
      boolByte(g.stopLupron),
      boolByte(g.luteal),
      boolByte(data.dosage),
      boolByte(sp.donor),
      boolByte(sp.donorCryo),
      boolByte(sp.husband),
      boolByte(sp.husbandCryo),
      boolByte(tr.ivf),
      boolByte(tr.gift),
      boolByte(tr.zift),
      boolByte(tr.cryoAll),
      boolByte(c.icsi),
      boolByte(c.hatching),
      boolByte(c.cryo),
      boolByte(c.immatures),
      boolByte(c.apa),
      data.comments || '',
      queryIndex,
    ]
  );
}

function buildMccdParams(data, patId, satId, cycId, queryIndex) {
  const d = data.day0 || data;
  return buildParams(
    '@CycID,@CycMCCDID,@PatID,@SatID,@CycMCCDDate,@CycMCCDDateOfCreation,@CycMCCDFSHDrug1,@CycMCCDFSHDrug1Dose,@CycMCCDFSHDrug2,@CycMCCDFSHDrug2Dose,@CycMCCDHMGDrug1,@CycMCCDHMGDrug1Dose,@CycMCCDHMGDrug2,@CycMCCDHMGDrug2Dose,@CycMCCDCloDrug1,@CycMCCDCloDrug1Dose,@CycMCCDAntaDrug1,@CycMCCDAntaDrug1Dose,@CycMCCDOthDrug1,@CycMCCDOthDrug1Dose,@CycMCCDFGnRHa,@CycMCCDFE2,@CycMCCDFLH,@CycMCCDFFSH,@CycMCCDFTSH,@CycMCCDFProl,@CycMCCDFProg,@CycMCCDFRemarks,@CycMCCDFUltraSound,@CycMCCDFEndometrium,@QueryIndex',
    [
      cycId,
      num(d.cycMccdId),
      num(patId),
      num(satId),
      parseDate(d.date),
      new Date(),
      num(d.fshDrug1),
      num(d.fshDrug1Dose),
      num(d.fshDrug2),
      num(d.fshDrug2Dose),
      num(d.hmgDrug1),
      num(d.hmgDrug1Dose),
      num(d.hmgDrug2),
      num(d.hmgDrug2Dose),
      num(d.cloDrug1),
      num(d.cloDrug1Dose),
      num(d.antaDrug1),
      num(d.antaDrug1Dose),
      num(d.othDrug1),
      num(d.othDrug1Dose),
      num(d.gnrha),
      num(d.e2),
      num(d.lh),
      num(d.fsh),
      num(d.tsh),
      num(d.prol),
      num(d.prog),
      d.remarks || '',
      d.ultrasound || '',
      d.endometrium || '',
      queryIndex,
    ]
  );
}

function buildMcrdParams(row, patId, satId, cycId, queryIndex) {
  return buildParams(
    '@CycID,@CycMCRDID,@PatID,@SatID,@CycMCRDDate,@CycMCRDDay,@CycMCRDFSHDrug1,@CycMCRDFSHDrug2,@CycMCRDHMGDrug1,@CycMCRDHMGDrug2,@CycMCRDCloDrug1,@CycMCRDAntaDrug1,@CycMCRDOthDrug1,@CycMCRDHCG,@CycMCRDHCGDose,@CycMCRDHCGTime,@CycMCRDHCGDate,@CycMCRDOvum,@CycMCRDOvumTime,@CycMCRDOvumDate,@CycMCRDFGnRHa,@CycMCRDFE2,@CycMCRDFLH,@CycMCRDFFSH,@CycMCRDFTSH,@CycMCRDFProl,@CycMCRDFProg,@CycMCRDFRemarks,@CycMCRDFEndometrium,@CycMCRDFTLeft,@CycMCRDFTRight,@CycMCRDTerminate,@CycMCRDReason,@CycMCRDCycStimul,@CycMCRDNote,@CycMCRDColor,@CycMCRDGridVal,@QueryIndex,@CycMCRDUltraSound',
    [
      cycId,
      num(row.cycMcrdId),
      num(patId),
      num(satId),
      parseDate(row.date),
      num(row.day),
      num(row.fshDrug1),
      num(row.fshDrug2),
      num(row.hmgDrug1),
      num(row.hmgDrug2),
      num(row.cloDrug1),
      num(row.antaDrug1),
      num(row.othDrug1),
      boolByte(row.hcg),
      num(row.hcgDose),
      row.hcgTime || '00:00:00',
      parseDate(row.hcgDate),
      boolByte(row.ovum),
      row.ovumTime || '00:00:00',
      parseDate(row.ovumDate),
      num(row.gnrha),
      num(row.e2),
      num(row.lh),
      num(row.fsh),
      num(row.tsh),
      num(row.prol),
      num(row.prog),
      row.remarks || '',
      row.endometrium || '',
      num(row.follicleLeft),
      num(row.follicleRight),
      boolByte(row.terminate),
      row.reason || '',
      num(row.cycStimul),
      row.note || '',
      row.color || '',
      row.gridVal || '',
      queryIndex,
      row.ultrasound || '',
    ]
  );
}

function buildOutcomeParams(data, patId, satId, cycId, queryIndex) {
  return buildParams(
    '@CycID,@CycOID,@PatID,@SatID,@CycODate,@CycOBHCGDate,@CycODateOfCreation,@CycOValue,@CycONoSac,@CycOPTDay,@CycOOutcome,@CycOPregOpt,@CycOPregDelOpt,@CycOPostTreat,@CycOAdvice,@CycOTreatment,@QueryIndex,@CycOType',
    [
      cycId,
      num(data.cycOId),
      num(patId),
      num(satId),
      parseDate(data.outcomeDate),
      data.bhcgDate ? parseDate(data.bhcgDate) : new Date(1900, 0, 1),
      new Date(),
      num(data.value),
      num(data.noSacs),
      num(data.ptDay),
      num(data.outcome),
      num(data.pregOpt),
      num(data.pregDelOpt),
      data.postTreatment || '',
      data.advice || '',
      data.treatment || '',
      queryIndex,
      data.cycleType || '',
    ]
  );
}

function mapHistoryFromDb(row) {
  if (!row) return defaultHistory();
  return {
    cycHId: num(row.CycHID),
    height: num(row.CycHHeight),
    weight: num(row.CycHWeight),
    bmi: num(row.CycHBMI),
    allergyId: num(row.AllergyID),
    medSurHistory: row.CycHMedSur || '',
    isg: num(row.CycHISG),
    isp: num(row.CycHISP),
    isAb: num(row.CycHISAb),
    isEct: num(row.CycHISEct),
    isDuration: num(row.CycHISDuration),
    findings: {
      idiopathic: !!row.CycHIdio,
      if: !!row.CycHIF,
      mf: !!row.CycHMF,
      dor: !!row.CycHDOR,
      ovu: !!row.CycHOvu,
      tf: !!row.CycHTF,
      cf: !!row.CycHCF,
      endo: !!row.CycHEndo,
      other: !!row.CycHOther,
    },
    endoOpt: num(row.CycHEndoOpt),
    otherTxt: row.CycHOtherTXT || '',
    indication: row.CycHIndi || '',
    hispanic: {
      asian: !!row.CycHHAsian,
      black: !!row.CycHHBlack,
      white: !!row.CycHHWhite,
      other: !!row.CycHHOther,
    },
    hlmp: row.CycHHLMP || '',
    nonHispanic: {
      asian: !!row.CycHNHAsian,
      black: !!row.CycHNHBlack,
      white: !!row.CycHNHWhite,
      unknown: !!row.CycHNHUnknown,
    },
    hsg: row.CycHHSG || '',
    stimProtId: num(row.StimProtID),
    attemptCount: num(row.CycHAttem),
    attemptPrev: num(row.CycHAttemPrev),
    attemptEw: num(row.CycHAttemEW),
    currentDate: row.CycHCurrentDate || '',
    comments: row.CycHComments || '',
    historyAttempts: [],
  };
}

function mapSurvivalFromDb(row) {
  if (!row) return defaultSurvival();
  return {
    cycSId: num(row.CycSID),
    conc: num(row.CycSSConcSpearm),
    motility: num(row.CycSSMotility),
    nmph1: num(row.CycSSNMPH1),
    nmph2: num(row.CycSSNMPH2),
    date: row.CycSSDate || '',
    recovery: row.CycSSRecovery || '',
    antibodies: row.CycSSAntibodies || '',
    saResult: {
      positive: !!row.CycSAPositive,
      borderline: !!row.CycSABorderline,
      negative: !!row.CycSANegative,
    },
    gnrh: {
      none: !!row.CycSGNone,
      stopLupron: !!row.CycSGStopLupron,
      luteal: !!row.CycSGLuteal,
    },
    dosage: !!row.CycSDosage,
    spermSource: {
      donor: !!row.CycSSpDonor,
      donorCryo: !!row.CycSSpDonorCryo,
      husband: !!row.CycSSpHusb,
      husbandCryo: !!row.CycSSpHusbCryo,
    },
    transferType: {
      ivf: !!row.CycSTIVF,
      gift: !!row.CycSTGIFT,
      zift: !!row.CycSTZIFT,
      cryoAll: !!row.CycSTCryoAll,
    },
    consent: {
      icsi: !!row.CycSCICSI,
      hatching: !!row.CycSCHatching,
      cryo: !!row.CycSCCryo,
      immatures: !!row.CycSCImmatures,
      apa: !!row.CycSCAPA,
    },
    comments: row.CycSComments || '',
  };
}

function mapMccdFromDb(row) {
  if (!row) return defaultMonitoring().day0;
  return {
    cycMccdId: num(row.CycMCCDID),
    date: row.CycMCCDDate || '',
    fshDrug1: num(row.CycMCCDFSHDrug1),
    fshDrug1Dose: num(row.CycMCCDFSHDrug1Dose),
    fshDrug2: num(row.CycMCCDFSHDrug2),
    fshDrug2Dose: num(row.CycMCCDFSHDrug2Dose),
    hmgDrug1: num(row.CycMCCDHMGDrug1),
    hmgDrug1Dose: num(row.CycMCCDHMGDrug1Dose),
    hmgDrug2: num(row.CycMCCDHMGDrug2),
    hmgDrug2Dose: num(row.CycMCCDHMGDrug2Dose),
    cloDrug1: num(row.CycMCCDCloDrug1),
    cloDrug1Dose: num(row.CycMCCDCloDrug1Dose),
    antaDrug1: num(row.CycMCCDAntaDrug1),
    antaDrug1Dose: num(row.CycMCCDAntaDrug1Dose),
    othDrug1: num(row.CycMCCDOthDrug1),
    othDrug1Dose: num(row.CycMCCDOthDrug1Dose),
    gnrha: num(row.CycMCCDFGnRHa),
    e2: num(row.CycMCCDFE2),
    lh: num(row.CycMCCDFLH),
    fsh: num(row.CycMCCDFFSH),
    tsh: num(row.CycMCCDFTSH),
    prol: num(row.CycMCCDFProl),
    prog: num(row.CycMCCDFProg),
    remarks: row.CycMCCDFRemarks || '',
    ultrasound: row.CycMCCDFUltraSound || '',
    endometrium: row.CycMCCDFEndometrium || '',
  };
}

function mapOutcomeFromDb(row) {
  if (!row) return defaultOutcome();
  return {
    cycOId: num(row.CycOID),
    outcomeDate: row.CycODate || '',
    bhcgDate: row.CycOBHCGDate || '',
    value: num(row.CycOValue),
    noSacs: num(row.CycONoSac),
    ptDay: num(row.CycOPTDay),
    outcome: num(row.CycOOutcome),
    pregOpt: num(row.CycOPregOpt),
    pregDelOpt: num(row.CycOPregDelOpt),
    postTreatment: row.CycOPostTreat || '',
    advice: row.CycOAdvice || '',
    treatment: row.CycOTreatment || '',
    cycleType: row.CycOType || '',
  };
}

async function loadTabMasters() {
  const [allergies, stimProtocols, fshDrugs, hmgDrugs, cloDrugs, antaDrugs, otherDrugs, catheters] = await Promise.all([
    masterService.listCommonMaster(12).catch(() => []),
    masterService.listCommonMaster(13).catch(() => []),
    masterService.listCommonMaster(14).catch(() => []),
    masterService.listCommonMaster(15).catch(() => []),
    masterService.listCommonMaster(17).catch(() => []),
    masterService.listCommonMaster(18).catch(() => []),
    masterService.listCommonMaster(19).catch(() => []),
    masterService.listCommonMaster(9).catch(() => []),
  ]);
  return { allergies, stimProtocols, fshDrugs, hmgDrugs, cloDrugs, antaDrugs, otherDrugs, catheters };
}

async function loadHistory({ cycId, patId, satId, inMemoryData }) {
  const masters = await loadTabMasters();
  if (!isDbConfigured()) {
    return { data: inMemoryData || defaultHistory(), masters, source: 'memory' };
  }
  try {
    const params = buildHistoryParams(defaultHistory(), patId, satId, cycId, 2);
    const result = await executeDRL(HISTORY_SP, params);
    const row = result.recordset?.[0];
    const data = mapHistoryFromDb(row);
    const attemptParams = buildParams('@CycID,@CycHAID,@PatID,@SatID,@QueryIndex', [cycId, 0, num(patId), num(satId), 1]);
    const attemptResult = await executeDRL(HISTORY_ATTEMPT_EXT_SP, attemptParams);
    data.historyAttempts = (attemptResult.recordset || []).map((r) => ({
      cycHaId: num(r.CycHAID),
      cycleDate: r.CycHACycleDate || '',
      ivf: !!r.CycHAPIVF,
      icsi: !!r.CycHAPICSI,
      stimProtId: num(r.StimProtID),
      lmp: r.CycHALMP || '',
      stimDetails: r.CycHAStimDetails || '',
      he2: num(r.CycHAHE2),
      prgs: num(r.CycHAPrgs),
      lh: num(r.CycHALH),
      hcg: r.CycHAHCG || '',
      ovum: r.CycHAOvum || '',
      oocytes: num(r.CycHAOocytes),
      fertilized: num(r.CycHAFertilized),
      remark: r.CycHARemark || '',
    }));
    return { data, masters, source: 'db' };
  } catch {
    return { data: inMemoryData || defaultHistory(), masters, source: 'memory' };
  }
}

async function saveHistory({ cycId, patId, satId, payload }) {
  const queryIndex = payload.cycHId ? 12 : 11;
  if (isDbConfigured()) {
    const params = buildHistoryParams(payload, patId, satId, cycId, queryIndex);
    await executeDML(HISTORY_SP, params);
    for (const attempt of payload.historyAttempts || []) {
      const attemptParams = buildParams(
        '@CycID,@CycHAID,@PatID,@SatID,@CycHADateOfCreation,@CycHACycleDate,@CycHAPIVF,@CycHAPICSI,@StimProtID,@CycHALMP,@CycHAStimDetails,@CycHAHE2,@CycHAPrgs,@CycHALH,@CycHAHCG,@CycHAOvum,@CycHAOocytes,@CycHAFertilized,@CycHAOAllocatedIVF,@CycHAOAllocatedICSI,@CycHAOMIIIVF,@CycHAOMIIICSI,@CycHAOFertilizedIVF,@CycHAOFertilizedICSI,@CycHACEmbryosIVF,@CycHACEmbryosICSI,@CycHAETransferedIVF,@CycHAETransferedICSI,@CycHAEFrozenIVF,@CycHAEFrozenICSI,@CycHABTransferedIVF,@CycHABTransferedICSI,@CycHABFrozenIVF,@CycHABFrozenICSI,@CycHAETDoneOn,@ETCathID,@CycHAEGrdnCeller,@CycHABTDoneOn,@BTCathID,@CycHABGrd,@CycHABHcgDoneOne,@CycHARemark,@QueryIndex',
        [
          cycId,
          num(attempt.cycHaId),
          num(patId),
          num(satId),
          new Date(),
          parseDate(attempt.cycleDate),
          boolByte(attempt.ivf),
          boolByte(attempt.icsi),
          num(attempt.stimProtId),
          parseDate(attempt.lmp),
          attempt.stimDetails || '',
          num(attempt.he2),
          num(attempt.prgs),
          num(attempt.lh),
          attempt.hcg || '',
          attempt.ovum || '',
          num(attempt.oocytes),
          num(attempt.fertilized),
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          new Date(1900, 0, 1),
          0,
          '',
          new Date(1900, 0, 1),
          0,
          '',
          new Date(1900, 0, 1),
          attempt.remark || '',
          attempt.cycHaId ? 12 : 11,
        ]
      );
      await executeDML(HISTORY_ATTEMPT_SP, attemptParams);
    }
  }
  return payload;
}

async function loadSurvival({ cycId, patId, satId, inMemoryData }) {
  if (!isDbConfigured()) {
    return { data: inMemoryData || defaultSurvival(), source: 'memory' };
  }
  try {
    const params = buildSurvivalParams(defaultSurvival(), patId, satId, cycId, 2);
    const result = await executeDRL(SURVIVAL_SP, params);
    return { data: mapSurvivalFromDb(result.recordset?.[0]), source: 'db' };
  } catch {
    return { data: inMemoryData || defaultSurvival(), source: 'memory' };
  }
}

async function saveSurvival({ cycId, patId, satId, payload }) {
  if (isDbConfigured()) {
    const queryIndex = payload.cycSId ? 12 : 11;
    const params = buildSurvivalParams(payload, patId, satId, cycId, queryIndex);
    await executeDML(SURVIVAL_SP, params);
  }
  return payload;
}

async function loadMonitoring({ cycId, patId, satId, inMemoryData }) {
  const masters = await loadTabMasters();
  if (!isDbConfigured()) {
    return { data: inMemoryData || defaultMonitoring(), masters, source: 'memory' };
  }
  try {
    const mccdParams = buildMccdParams({ day0: defaultMonitoring().day0 }, patId, satId, cycId, 2);
    const mccdResult = await executeDRL(MCCD_SP, mccdParams);
    const day0 = mapMccdFromDb(mccdResult.recordset?.[0]);
    const mcrdParams = buildMcrdParams({ day: 0, date: new Date() }, patId, satId, cycId, 2);
    const mcrdResult = await executeDRL(MCRD_SP, mcrdParams);
    const remDays = (mcrdResult.recordset || []).map((r) => ({
      cycMcrdId: num(r.CycMCRDID),
      day: num(r.CycMCRDDay),
      date: r.CycMCRDDate || '',
      fshDrug1: num(r.CycMCRDFSHDrug1),
      fshDrug2: num(r.CycMCRDFSHDrug2),
      hmgDrug1: num(r.CycMCRDHMGDrug1),
      hmgDrug2: num(r.CycMCRDHMGDrug2),
      cloDrug1: num(r.CycMCRDCloDrug1),
      antaDrug1: num(r.CycMCRDAntaDrug1),
      othDrug1: num(r.CycMCRDOthDrug1),
      hcg: !!r.CycMCRDHCG,
      hcgDose: num(r.CycMCRDHCGDose),
      hcgDate: r.CycMCRDHCGDate || '',
      hcgTime: r.CycMCRDHCGTime || '',
      ovum: !!r.CycMCRDOvum,
      ovumDate: r.CycMCRDOvumDate || '',
      ovumTime: r.CycMCRDOvumTime || '',
      gnrha: num(r.CycMCRDFGnRHa),
      e2: num(r.CycMCRDFE2),
      lh: num(r.CycMCRDFLH),
      fsh: num(r.CycMCRDFFSH),
      tsh: num(r.CycMCRDFTSH),
      prol: num(r.CycMCRDFProl),
      prog: num(r.CycMCRDFProg),
      follicleLeft: num(r.CycMCRDFTLeft),
      follicleRight: num(r.CycMCRDFTRight),
      endometrium: r.CycMCRDFEndometrium || '',
      remarks: r.CycMCRDFRemarks || '',
      ultrasound: r.CycMCRDUltraSound || '',
      terminate: !!r.CycMCRDTerminate,
      reason: r.CycMCRDReason || '',
    }));
    return { data: { day0, remDays }, masters, source: 'db' };
  } catch {
    return { data: inMemoryData || defaultMonitoring(), masters, source: 'memory' };
  }
}

async function saveMonitoring({ cycId, patId, satId, payload }) {
  if (isDbConfigured()) {
    const day0Query = payload.day0?.cycMccdId ? 12 : 11;
    await executeDML(MCCD_SP, buildMccdParams(payload, patId, satId, cycId, day0Query));
    for (const row of payload.remDays || []) {
      const q = row.cycMcrdId ? 12 : 11;
      await executeDML(MCRD_SP, buildMcrdParams(row, patId, satId, cycId, q));
    }
  }
  return payload;
}

async function loadOutcome({ cycId, patId, satId, cycleType, inMemoryData }) {
  if (!isDbConfigured()) {
    return { data: inMemoryData || defaultOutcome(cycleType), source: 'memory' };
  }
  try {
    const params = buildOutcomeParams(defaultOutcome(cycleType), patId, satId, cycId, 2);
    const result = await executeDRL(OUTCOME_SP, params);
    return { data: mapOutcomeFromDb(result.recordset?.[0]), source: 'db' };
  } catch {
    return { data: inMemoryData || defaultOutcome(cycleType), source: 'memory' };
  }
}

async function saveOutcome({ cycId, patId, satId, payload }) {
  if (isDbConfigured()) {
    const queryIndex = payload.cycOId ? 12 : 11;
    const params = buildOutcomeParams(payload, patId, satId, cycId, queryIndex);
    await executeDML(OUTCOME_SP, params);
  }
  return payload;
}

module.exports = {
  defaultHistory,
  defaultSurvival,
  defaultMonitoring,
  defaultOutcome,
  loadHistory,
  saveHistory,
  loadSurvival,
  saveSurvival,
  loadMonitoring,
  saveMonitoring,
  loadOutcome,
  saveOutcome,
};
