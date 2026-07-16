const express = require('express');
const btService = require('../services/bt.service');
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
    const data = await btService.getLookups();
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
    const data = await btService.listCycleDates({ patId, satId });
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
    const exists = await btService.checkBtExists({ patId, satId, cycId, cycleDate });
    if (!exists) {
      return res.json({ success: true, data: null, exists: false });
    }
    try {
      const data = await btService.loadBtRecord({ patId, satId, cycId, cycleDate });
      return res.json({ success: true, data, exists: true });
    } catch (loadError) {
      return res.json({ success: true, data: null, exists: false, warning: loadError.message });
    }
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    if (!dbRequired(res)) return;
    const result = await btService.saveBtRecord(req.body);
    return res.json({
      success: true,
      message: req.body.mode === 'update' ? 'BT updated successfully.' : 'BT saved successfully.',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
