const express = require('express');
const masterService = require('../services/master.service');
const { getRegistryWithRoutes, getCommonMasterByCatId } = require('../config/masterRegistry');
const { isDbConfigured } = require('../db/pool');

const router = express.Router();

function dbRequired(res) {
  if (!isDbConfigured()) {
    res.status(503).json({ success: false, message: 'Database not configured.' });
    return false;
  }
  return true;
}

router.get('/registry', (req, res) => {
  return res.json({ success: true, data: getRegistryWithRoutes() });
});

router.get('/common/:catId', async (req, res, next) => {
  try {
    if (!dbRequired(res)) return;

    const catId = Number(req.params.catId);
    const meta = getCommonMasterByCatId(catId);
    if (!meta) {
      return res.status(404).json({ success: false, message: 'Unknown common master category.' });
    }

    const data = await masterService.listCommonMaster(catId);
    return res.json({ success: true, meta: { ...meta, route: `/masters/common/${catId}` }, data });
  } catch (error) {
    return next(error);
  }
});

router.post('/common/:catId', async (req, res, next) => {
  try {
    if (!dbRequired(res)) return;

    const catId = Number(req.params.catId);
    const meta = getCommonMasterByCatId(catId);
    if (!meta) {
      return res.status(404).json({ success: false, message: 'Unknown common master category.' });
    }

    const { id, name, action } = req.body;
    const data = await masterService.saveCommonMaster(catId, { id, name, action });
    return res.json({ success: true, message: 'Saved successfully.', data });
  } catch (error) {
    return next(error);
  }
});

router.get('/patient/lookups', async (req, res, next) => {
  try {
    if (!dbRequired(res)) return;
    const data = await masterService.getPatientLookups();
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
});

router.get('/patient', async (req, res, next) => {
  try {
    if (!dbRequired(res)) return;
    const data = await masterService.listPatients({ satId: Number(req.query.satelliteId) || 0 });
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
});

router.get('/patient/:id', async (req, res, next) => {
  try {
    if (!dbRequired(res)) return;
    const patient = await masterService.getPatientById(Number(req.params.id));
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }
    return res.json({ success: true, data: patient });
  } catch (error) {
    return next(error);
  }
});

router.post('/patient', async (req, res, next) => {
  try {
    if (!dbRequired(res)) return;
    const action = req.body.patId ? 'update' : 'insert';
    const data = await masterService.savePatient(req.body, action);
    return res.json({ success: true, message: 'Patient saved.', data });
  } catch (error) {
    if (error.status === 409) {
      return res.status(409).json({ success: false, message: error.message });
    }
    return next(error);
  }
});

router.delete('/patient/:id', async (req, res, next) => {
  try {
    if (!dbRequired(res)) return;
    await masterService.deletePatient(Number(req.params.id));
    return res.json({ success: true, message: 'Patient deleted.' });
  } catch (error) {
    return next(error);
  }
});

router.get('/doctor', async (req, res, next) => {
  try {
    if (!dbRequired(res)) return;
    const data = await masterService.listDoctors();
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
});

router.get('/doctor/:id', async (req, res, next) => {
  try {
    if (!dbRequired(res)) return;
    const doctor = await masterService.getDoctorById(Number(req.params.id));
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }
    return res.json({ success: true, data: doctor });
  } catch (error) {
    return next(error);
  }
});

router.post('/doctor', async (req, res, next) => {
  try {
    if (!dbRequired(res)) return;
    const action = req.body.docId ? 'update' : 'insert';
    const data = await masterService.saveDoctor(req.body, action);
    return res.json({ success: true, message: 'Doctor saved.', data });
  } catch (error) {
    return next(error);
  }
});

router.get('/satellite', async (req, res, next) => {
  try {
    if (!dbRequired(res)) return;
    const data = await masterService.listSatellitesMaster();
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
});

router.get('/satellite/:id', async (req, res, next) => {
  try {
    if (!dbRequired(res)) return;
    const satellite = await masterService.getSatelliteById(Number(req.params.id));
    if (!satellite) {
      return res.status(404).json({ success: false, message: 'Satellite not found.' });
    }
    return res.json({ success: true, data: satellite });
  } catch (error) {
    return next(error);
  }
});

router.post('/satellite', async (req, res, next) => {
  try {
    if (!dbRequired(res)) return;
    const action = req.body.satId ? 'update' : 'insert';
    const data = await masterService.saveSatellite(req.body, action);
    return res.json({ success: true, message: 'Satellite saved.', data });
  } catch (error) {
    return next(error);
  }
});

router.get('/user', async (req, res, next) => {
  try {
    if (!dbRequired(res)) return;
    const data = await masterService.listUsers();
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
