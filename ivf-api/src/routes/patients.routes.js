const express = require('express');
const patientService = require('../services/patient.service');
const { isDbConfigured } = require('../db/pool');

const router = express.Router();

router.get('/satellites', async (req, res, next) => {
  try {
    if (!isDbConfigured()) {
      return res.status(503).json({ success: false, message: 'Database not configured.' });
    }

    const data = await patientService.getSatellites();
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    if (!isDbConfigured()) {
      return res.status(503).json({ success: false, message: 'Database not configured.' });
    }

    const { search, satelliteId } = req.query;
    let data;

    if (search) {
      data = await patientService.searchPatients({
        search,
        satelliteId: satelliteId ? Number(satelliteId) : 0,
      });
    } else if (satelliteId) {
      data = await patientService.listPatientsBySatellite(Number(satelliteId));
    } else {
      data = [];
    }

    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!isDbConfigured()) {
      return res.status(503).json({ success: false, message: 'Database not configured.' });
    }

    const satelliteId = Number(req.query.satelliteId);
    if (!satelliteId) {
      return res.status(400).json({ success: false, message: 'satelliteId query parameter is required.' });
    }

    const patient = await patientService.getPatientById(Number(req.params.id), satelliteId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    return res.json({ success: true, data: patient });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
