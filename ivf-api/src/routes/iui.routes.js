const express = require('express');
const iuiService = require('../services/iui.service');
const { isDbConfigured } = require('../db/pool');

const router = express.Router();

function dbRequired(res) {
  if (!isDbConfigured()) {
    res.status(503).json({ success: false, message: 'Database not configured.' });
    return false;
  }
  return true;
}

router.get('/', async (req, res, next) => {
  try {
    if (!dbRequired(res)) return;

    const patId = Number(req.query.patId);
    const satId = Number(req.query.satId);

    if (!patId || !satId) {
      return res.status(400).json({ success: false, message: 'patId and satId are required.' });
    }

    const data = await iuiService.listIuiRecords({
      patId,
      satId,
      userId: req.user.userId,
    });

    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
});

router.get('/:iuiId', async (req, res, next) => {
  try {
    if (!dbRequired(res)) return;

    const patId = Number(req.query.patId);
    const satId = Number(req.query.satId);
    const iuiOId = Number(req.query.iuiOId);

    if (!patId || !satId || !iuiOId) {
      return res.status(400).json({ success: false, message: 'patId, satId, and iuiOId are required.' });
    }

    const data = await iuiService.loadIuiOutcome({
      iuiId: req.params.iuiId,
      iuiOId,
      patId,
      satId,
    });

    if (!data) {
      return res.status(404).json({ success: false, message: 'IUI record not found.' });
    }

    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    if (!dbRequired(res)) return;

    const result = await iuiService.saveIuiOutcome(req.body);
    return res.json({ success: true, message: 'IUI saved successfully.', data: result });
  } catch (error) {
    return next(error);
  }
});

router.post('/unlock', async (req, res, next) => {
  try {
    if (!dbRequired(res)) return;

    const { patId, cycleId, patName } = req.body;
    if (!patId || !cycleId) {
      return res.status(400).json({ success: false, message: 'patId and cycleId are required.' });
    }

    const data = await iuiService.unlockIuiCycle({
      patId,
      cycleId,
      patName,
      userId: req.user.userId,
    });

    return res.json({ success: true, message: 'Cycle unlocked successfully.', data });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
