const express = require('express');
const consentService = require('../services/consent.service');
const { isDbConfigured } = require('../db/pool');

const router = express.Router();

router.get('/presets', (req, res) => {
  res.json({ success: true, data: consentService.getPresets() });
});

router.get('/forms', (req, res) => {
  res.json({ success: true, data: consentService.getFormGroups() });
});

router.get('/presets/:id', (req, res) => {
  const preset = consentService.resolvePreset(req.params.id);
  if (!preset) {
    return res.status(404).json({ success: false, message: 'Preset not found.' });
  }
  return res.json({ success: true, data: preset });
});

router.get('/patient-context', async (req, res, next) => {
  try {
    if (!isDbConfigured()) {
      return res.status(503).json({ success: false, message: 'Database not configured.' });
    }

    const patId = Number(req.query.patId);
    const satId = Number(req.query.satId);
    if (!patId || !satId) {
      return res.status(400).json({ success: false, message: 'patId and satId are required.' });
    }

    const data = await consentService.getPatientConsentContext({ patId, satId });
    if (!data) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
});

router.get('/search', async (req, res, next) => {
  try {
    if (!isDbConfigured()) {
      return res.status(503).json({ success: false, message: 'Database not configured.' });
    }

    const data = await consentService.searchConsentPatients({
      search: String(req.query.search || ''),
      satelliteId: Number(req.query.satelliteId) || 0,
    });

    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
