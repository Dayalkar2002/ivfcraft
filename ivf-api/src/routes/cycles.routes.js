const express = require('express');
const {
  getCycles,
  setCycles,
  resolveCycleType,
  nextCycleId,
} = require('../data/store');
const patientService = require('../services/patient.service');
const cycleDetailService = require('../services/cycle-detail.service');
const cycleRetrievalService = require('../services/cycle-retrieval.service');
const { isDbConfigured } = require('../db/pool');

const router = express.Router();

function getRetrievalSections(oocyteSource, semenSource) {
  const sections = {
    showSelfToSelf: false,
    showSelfToRecipient: false,
    showDonorToSelf: false,
    showDonorToRecipient: false,
    showEmbryoRecipient: false,
    lockOocyteDonation: false,
    lockSemenCryo: false,
    showOocyteReceivedFrom: false,
    showSemenSampleId: false,
  };

  // Version B: only Self To Self and Donor To Recipient for standard cycles.
  switch (oocyteSource) {
    case 'self_oocyte':
      sections.showSelfToSelf = true;
      break;
    case 'donor_oocyte':
      sections.showDonorToRecipient = true;
      break;
    case 'oocyte_recipient':
      sections.showOocyteReceivedFrom = true;
      sections.lockOocyteDonation = true;
      break;
    case 'embryo_recipient':
      sections.showEmbryoRecipient = true;
      sections.lockOocyteDonation = true;
      sections.lockSemenCryo = true;
      sections.showOocyteReceivedFrom = true;
      sections.showSemenSampleId = true;
      break;
    default:
      break;
  }

  if (semenSource === 'husband_cryo' || semenSource === 'donor_cryo' || semenSource === 'surgical_frozen') {
    sections.lockSemenCryo = true;
  }

  return sections;
}

async function validateDonorToRecipientRetrieval({ donorPatId, cycleId, rows }) {
  const activeRows = (rows || []).filter((row) => row?.recipientPatientId);
  if (!activeRows.length) {
    return { valid: true };
  }

  const recipientIds = [...new Set(activeRows.map((row) => Number(row.recipientPatientId)).filter(Boolean))];
  if (recipientIds.length > 1) {
    return {
      valid: false,
      message: 'As per government norms, one oocyte donor can donate to only one recipient per cycle.',
    };
  }

  if (!isDbConfigured()) {
    return { valid: true };
  }

    for (const row of activeRows) {
    const check = await patientService.checkOocyteDonorAadhar({
      donorPatId,
      recipientPatId: Number(row.recipientPatientId),
      excludeCycId: cycleId,
    });
    if (!check.isAllowed) {
      return { valid: false, message: check.message || 'Oocyte donor Aadhaar validation failed.' };
    }
    if (check.message && check.message.toLowerCase().includes('warning:')) {
      // Recipient Aadhaar missing is a warning only (10-Jul-2026 legacy behavior).
    }
  }

  return { valid: true };
}

router.get('/types', (req, res) => {
  res.json({
    success: true,
    data: {
      oocyteSources: [
        { id: 'self_oocyte', label: 'Self Oocyte', description: 'Patient\'s own oocytes' },
        { id: 'donor_oocyte', label: 'Donor Oocyte', description: 'Oocytes from registered donor' },
        { id: 'oocyte_recipient', label: 'Oocyte Recipient', description: 'Received oocytes from donor' },
        { id: 'embryo_recipient', label: 'Embryo Recipient', description: 'Received embryos from donor couple' },
      ],
      semenSources: [
        { id: 'husband_fresh', label: 'Husband – Fresh Sample', description: 'Fresh semen from partner' },
        { id: 'husband_cryo', label: 'Husband – Cryopreserved (Frozen)', description: 'From survival / cryo bank' },
        { id: 'donor_fresh', label: 'Donor – Fresh Sample', description: 'Fresh donor semen sample' },
        { id: 'donor_cryo', label: 'Donor – Cryopreserved (Frozen)', description: 'From survival / cryo bank' },
        { id: 'surgical_fresh', label: 'Surgical Sperm (PESA / TESA / TESE)', description: 'Surgically retrieved sperm' },
        { id: 'surgical_frozen', label: 'Surgical Sperm – Frozen', description: 'Frozen surgical sample' },
      ],
    },
  });
});

router.get('/patient/:patientId', (req, res) => {
  const patientId = Number(req.params.patientId);
  const cycles = getCycles().filter((c) => c.patientId === patientId);
  res.json({ success: true, data: cycles });
});

router.get('/donor-aadhar-check', async (req, res, next) => {
  try {
    if (!isDbConfigured()) {
      return res.status(503).json({ success: false, message: 'Database not configured.' });
    }
    const donorPatId = Number(req.query.donorPatId);
    const recipientPatId = Number(req.query.recipientPatId);
    const excludeCycId = req.query.excludeCycId || '';
    if (!donorPatId || !recipientPatId) {
      return res.status(400).json({ success: false, message: 'donorPatId and recipientPatId are required.' });
    }
    const data = await patientService.checkOocyteDonorAadhar({ donorPatId, recipientPatId, excludeCycId });
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
});

router.get('/:cycleId', (req, res) => {
  const cycle = getCycles().find((c) => c.cycleId === req.params.cycleId);
  if (!cycle) {
    return res.status(404).json({ success: false, message: 'Cycle not found.' });
  }
  return res.json({ success: true, data: cycle });
});

router.post('/entry', async (req, res, next) => {
  try {
    const {
      patientId,
      satelliteId,
      oocyteSource,
      semenSource,
      cycleDate,
      donorOocyteDetails,
      oocyteRecipientDetails,
      embryoRecipientDetails,
      semenDonorDetails,
    } = req.body;

    if (!patientId || !satelliteId) {
      return res.status(400).json({ success: false, message: 'patientId and satelliteId are required.' });
    }

    const patient = await patientService.getPatientById(Number(patientId), Number(satelliteId));
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    if (!oocyteSource || !semenSource) {
      return res.status(400).json({ success: false, message: 'Oocyte and semen source are required.' });
    }

    const cycleId = nextCycleId();
    const cycleType = resolveCycleType(oocyteSource, semenSource);
    const retrievalSections = getRetrievalSections(oocyteSource, semenSource);

    const cycle = {
      cycleId,
      patientId: patient.id,
      satelliteId: Number(satelliteId),
      patientName: patient.name,
      uhid: patient.uhid,
      cycleDate: cycleDate || new Date().toISOString().split('T')[0],
      oocyteSource,
      semenSource,
      cycleType,
      donorOocyteDetails: donorOocyteDetails || null,
      oocyteRecipientDetails: oocyteRecipientDetails || null,
      embryoRecipientDetails: embryoRecipientDetails || null,
      semenDonorDetails: semenDonorDetails || null,
      retrievalSections,
      retrieval: null,
      status: 'entry_complete',
      createdBy: req.user.userName,
      createdAt: new Date().toISOString(),
    };

    const allCycles = getCycles();
    allCycles.push(cycle);
    setCycles(allCycles);

    return res.status(201).json({ success: true, data: cycle, message: 'Cycle entry saved successfully.' });
  } catch (error) {
    return next(error);
  }
});

router.post('/:cycleId/retrieval', async (req, res, next) => {
  try {
    const { cycleId } = req.params;
    const { sections } = req.body;
    const cycles = getCycles();
    const index = cycles.findIndex((c) => c.cycleId === cycleId);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Cycle not found.' });
    }

    const cycle = cycles[index];
    const retrievalSections = cycle.retrievalSections || getRetrievalSections(cycle.oocyteSource, cycle.semenSource);

    if (retrievalSections.showDonorToRecipient) {
      const validation = await validateDonorToRecipientRetrieval({
        donorPatId: cycle.patientId,
        cycleId,
        rows: sections?.donorToRecipient,
      });
      if (!validation.valid) {
        return res.status(400).json({ success: false, message: validation.message });
      }
    }

    let savedSections = sections;
    if (isDbConfigured()) {
      try {
        const dbSaved = await cycleRetrievalService.saveRetrieval({
          cycId: cycleId,
          patId: cycle.patientId,
          satId: cycle.satelliteId,
          cycleDate: cycle.cycleDate,
          sections,
        });
        if (dbSaved) savedSections = dbSaved;
      } catch (dbError) {
        return res.status(500).json({
          success: false,
          message: dbError.message || 'Failed to save retrieval to database.',
        });
      }
    }

    cycles[index].retrieval = savedSections;
    cycles[index].status = 'retrieval_saved';
    cycles[index].updatedAt = new Date().toISOString();
    cycles[index].updatedBy = req.user.userName;
    setCycles(cycles);

    return res.json({ success: true, data: cycles[index], message: 'Retrieval data saved successfully.' });
  } catch (error) {
    return next(error);
  }
});

function getCycleOr404(cycleId, res) {
  const cycle = getCycles().find((c) => c.cycleId === cycleId);
  if (!cycle) {
    res.status(404).json({ success: false, message: 'Cycle not found.' });
    return null;
  }
  return cycle;
}

router.get('/:cycleId/history', async (req, res, next) => {
  try {
    const cycle = getCycleOr404(req.params.cycleId, res);
    if (!cycle) return undefined;
    const result = await cycleDetailService.loadHistory({
      cycId: cycle.cycleId,
      patId: cycle.patientId,
      satId: cycle.satelliteId,
      inMemoryData: cycle.history,
    });
    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
});

router.post('/:cycleId/history', async (req, res, next) => {
  try {
    const { cycleId } = req.params;
    const cycles = getCycles();
    const index = cycles.findIndex((c) => c.cycleId === cycleId);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Cycle not found.' });
    }
    const saved = await cycleDetailService.saveHistory({
      cycId: cycleId,
      patId: cycles[index].patientId,
      satId: cycles[index].satelliteId,
      payload: req.body,
    });
    cycles[index].history = saved;
    cycles[index].updatedAt = new Date().toISOString();
    cycles[index].updatedBy = req.user.userName;
    setCycles(cycles);
    return res.json({ success: true, data: saved, message: 'History saved successfully.' });
  } catch (error) {
    return next(error);
  }
});

router.get('/:cycleId/survival', async (req, res, next) => {
  try {
    const cycle = getCycleOr404(req.params.cycleId, res);
    if (!cycle) return undefined;
    const result = await cycleDetailService.loadSurvival({
      cycId: cycle.cycleId,
      patId: cycle.patientId,
      satId: cycle.satelliteId,
      inMemoryData: cycle.survival,
    });
    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
});

router.post('/:cycleId/survival', async (req, res, next) => {
  try {
    const { cycleId } = req.params;
    const cycles = getCycles();
    const index = cycles.findIndex((c) => c.cycleId === cycleId);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Cycle not found.' });
    }
    const saved = await cycleDetailService.saveSurvival({
      cycId: cycleId,
      patId: cycles[index].patientId,
      satId: cycles[index].satelliteId,
      payload: req.body,
    });
    cycles[index].survival = saved;
    cycles[index].updatedAt = new Date().toISOString();
    cycles[index].updatedBy = req.user.userName;
    setCycles(cycles);
    return res.json({ success: true, data: saved, message: 'Survival report saved successfully.' });
  } catch (error) {
    return next(error);
  }
});

router.get('/:cycleId/monitoring', async (req, res, next) => {
  try {
    const cycle = getCycleOr404(req.params.cycleId, res);
    if (!cycle) return undefined;
    const result = await cycleDetailService.loadMonitoring({
      cycId: cycle.cycleId,
      patId: cycle.patientId,
      satId: cycle.satelliteId,
      inMemoryData: cycle.monitoring,
    });
    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
});

router.post('/:cycleId/monitoring', async (req, res, next) => {
  try {
    const { cycleId } = req.params;
    const cycles = getCycles();
    const index = cycles.findIndex((c) => c.cycleId === cycleId);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Cycle not found.' });
    }
    const saved = await cycleDetailService.saveMonitoring({
      cycId: cycleId,
      patId: cycles[index].patientId,
      satId: cycles[index].satelliteId,
      payload: req.body,
    });
    cycles[index].monitoring = saved;
    cycles[index].updatedAt = new Date().toISOString();
    cycles[index].updatedBy = req.user.userName;
    setCycles(cycles);
    return res.json({ success: true, data: saved, message: 'Monitoring chart saved successfully.' });
  } catch (error) {
    return next(error);
  }
});

router.get('/:cycleId/outcome', async (req, res, next) => {
  try {
    const cycle = getCycleOr404(req.params.cycleId, res);
    if (!cycle) return undefined;
    const result = await cycleDetailService.loadOutcome({
      cycId: cycle.cycleId,
      patId: cycle.patientId,
      satId: cycle.satelliteId,
      cycleType: cycle.cycleType,
      inMemoryData: cycle.outcome,
    });
    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
});

router.post('/:cycleId/outcome', async (req, res, next) => {
  try {
    const { cycleId } = req.params;
    const cycles = getCycles();
    const index = cycles.findIndex((c) => c.cycleId === cycleId);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Cycle not found.' });
    }
    const payload = { ...req.body, cycleType: cycles[index].cycleType };
    const saved = await cycleDetailService.saveOutcome({
      cycId: cycleId,
      patId: cycles[index].patientId,
      satId: cycles[index].satelliteId,
      payload,
    });
    cycles[index].outcome = saved;
    cycles[index].updatedAt = new Date().toISOString();
    cycles[index].updatedBy = req.user.userName;
    setCycles(cycles);
    return res.json({ success: true, data: saved, message: 'Outcome saved successfully.' });
  } catch (error) {
    return next(error);
  }
});

router.get('/:cycleId/retrieval-config', async (req, res, next) => {
  try {
    const cycle = getCycles().find((c) => c.cycleId === req.params.cycleId);
    if (!cycle) {
      return res.status(404).json({ success: false, message: 'Cycle not found.' });
    }

    const satelliteId = cycle.satelliteId || Number(req.query.satelliteId);
    let patient = null;
    let availableRecipients = [];
    let lockedRecipients = [];

    if (satelliteId) {
      patient = await patientService.getPatientById(cycle.patientId, satelliteId);
      availableRecipients = await patientService.listPatientsBySatellite(satelliteId);
      availableRecipients = availableRecipients.filter((p) => p.id !== cycle.patientId);

      if (isDbConfigured()) {
        const lockedRecipientPatId = await patientService.getDonorLockedRecipientPatId(cycle.patientId);
        if (lockedRecipientPatId) {
          const lockedPatient = await patientService.getPatientById(lockedRecipientPatId, satelliteId);
          if (lockedPatient) {
            lockedRecipients = [
              {
                recipientId: lockedPatient.id,
                recipientName: lockedPatient.name,
                recipientAadhar: lockedPatient.aadhar || '',
                cycleId: cycle.cycleId,
              },
            ];
          }
        }
      }
    }

    let existingRetrieval = cycle.retrieval;
    if (isDbConfigured()) {
      const dbRetrieval = await cycleRetrievalService.loadRetrieval({
        cycId: cycle.cycleId,
        patId: cycle.patientId,
        satId: cycle.satelliteId,
      });
      if (dbRetrieval) existingRetrieval = dbRetrieval;
    }

    const config = {
      cycle,
      sections: cycle.retrievalSections || getRetrievalSections(cycle.oocyteSource, cycle.semenSource),
      patient,
      availableRecipients,
      lockedRecipients,
      donorAadhar: patient?.aadhar || '',
      existingRetrieval,
    };

    return res.json({ success: true, data: config });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
