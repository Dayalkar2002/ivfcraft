const express = require('express');
const ivfService = require('../services/ivf.service');
const patientService = require('../services/patient.service');
const { isDbConfigured } = require('../db/pool');

const router = express.Router();

function dbRequired(res) {
  if (!isDbConfigured()) {
    res.status(503).json({ success: false, message: 'Database not configured.' });
    return false;
  }
  return true;
}

router.get('/lookups', async (req, res, next) => {
  try {
    if (!dbRequired(res)) return;
    const data = await ivfService.getLookups();
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
});

router.get('/cycle-dates', async (req, res, next) => {
  try {
    if (!dbRequired(res)) return;

    const patId = Number(req.query.patId);
    const satId = Number(req.query.satId);

    if (!patId || !satId) {
      return res.status(400).json({ success: false, message: 'patId and satId are required.' });
    }

    const data = await ivfService.listCycleDates({ patId, satId });
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
});

router.get('/monitoring', async (req, res, next) => {
  try {
    if (!dbRequired(res)) return;

    const patId = Number(req.query.patId);
    const satId = Number(req.query.satId);
    const cycId = req.query.cycId;
    const cycleDate = req.query.cycleDate;

    if (!patId || !satId || !cycId) {
      return res.status(400).json({ success: false, message: 'patId, satId, and cycId are required.' });
    }

    const data = await ivfService.loadMonitoringChart({ patId, satId, cycId, cycleDate });
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
});

router.get('/load', async (req, res, next) => {
  try {
    if (!dbRequired(res)) return;

    const patId = Number(req.query.patId);
    const satId = Number(req.query.satId);
    const cycId = req.query.cycId;
    const cycleDate = req.query.cycleDate;

    if (!patId || !satId || !cycId) {
      return res.status(400).json({ success: false, message: 'patId, satId, and cycId are required.' });
    }

    const exists = await ivfService.checkIvfExists({ patId, satId, cycId, cycleDate });
    if (!exists) {
      return res.json({ success: true, data: null, exists: false });
    }

    try {
      const data = await ivfService.loadIvfRecord({ patId, satId, cycId, cycleDate });
      return res.json({ success: true, data, exists: true });
    } catch (loadError) {
      return res.json({
        success: true,
        data: null,
        exists: false,
        warning: loadError.message,
      });
    }
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    if (!dbRequired(res)) return;

    const patId = Number(req.body.patId);
    const satId = Number(req.body.satId);
    if (patId && satId) {
      const patient = await patientService.getPatientById(patId, satId);
      if (patient?.age && patient.age > 50) {
        return res.status(400).json({
          success: false,
          message: 'IVF is not allowed for patients with age greater than 50.',
        });
      }
    }

    const result = await ivfService.saveIvfRecord(req.body);
    return res.json({
      success: true,
      message: req.body.mode === 'update' ? 'IVF updated successfully.' : 'IVF saved successfully.',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
