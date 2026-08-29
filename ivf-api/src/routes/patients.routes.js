const express = require('express');
const patientService = require('../services/patient.service');
const { isDbConfigured } = require('../db/pool');
const {
  getDemoSatellites,
  getDemoPatients,
  getDemoPatientById,
} = require('../data/demoClinic');

const router = express.Router();

function allowDemo() {
  return process.env.ALLOW_DEMO_LOGIN !== 'false';
}

router.get('/satellites', async (req, res, next) => {
  try {
    if (!isDbConfigured()) {
      if (allowDemo()) {
        return res.json({ success: true, demo: true, data: getDemoSatellites() });
      }
      return res.status(503).json({ success: false, message: 'Database not configured.' });
    }

    try {
      const data = await patientService.getSatellites();
      return res.json({ success: true, data });
    } catch (error) {
      if (allowDemo()) {
        console.error('[patients] satellites SP failed, demo fallback:', error.message);
        return res.json({ success: true, demo: true, data: getDemoSatellites() });
      }
      throw error;
    }
  } catch (error) {
    return next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { search, satelliteId } = req.query;

    if (!isDbConfigured()) {
      if (allowDemo()) {
        return res.json({
          success: true,
          demo: true,
          data: getDemoPatients(satelliteId, search),
        });
      }
      return res.status(503).json({ success: false, message: 'Database not configured.' });
    }

    try {
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
      if (allowDemo()) {
        console.error('[patients] list/search failed, demo fallback:', error.message);
        return res.json({
          success: true,
          demo: true,
          data: getDemoPatients(satelliteId, search),
        });
      }
      throw error;
    }
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const satelliteId = Number(req.query.satelliteId);

    if (!isDbConfigured()) {
      if (allowDemo()) {
        const patient = getDemoPatientById(req.params.id, satelliteId);
        if (!patient) {
          return res.status(404).json({ success: false, message: 'Patient not found.' });
        }
        return res.json({ success: true, demo: true, data: patient });
      }
      return res.status(503).json({ success: false, message: 'Database not configured.' });
    }

    if (!satelliteId) {
      return res.status(400).json({ success: false, message: 'satelliteId query parameter is required.' });
    }

    try {
      const patient = await patientService.getPatientById(Number(req.params.id), satelliteId);
      if (!patient) {
        return res.status(404).json({ success: false, message: 'Patient not found.' });
      }
      return res.json({ success: true, data: patient });
    } catch (error) {
      if (allowDemo()) {
        const patient = getDemoPatientById(req.params.id, satelliteId);
        if (patient) {
          return res.json({ success: true, demo: true, data: patient });
        }
      }
      throw error;
    }
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
