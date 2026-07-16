const express = require('express');
const { executeDRL, executeDML, buildParams } = require('../db/spExecutor');
const { isDbConfigured } = require('../db/pool');

const router = express.Router();

/**
 * Generic stored-procedure executor – mirrors ASP.NET DataAccessLayer pattern.
 *
 * POST /api/sp/drl
 * Body: {
 *   "procName": "spUserLogin",
 *   "paramNames": "@UserLoginName,@UserPassword,@QueryIndex",
 *   "values": ["admin", "pass", 1]
 * }
 */
router.post('/drl', async (req, res, next) => {
  try {
    if (!isDbConfigured()) {
      return res.status(503).json({ success: false, message: 'Database not configured.' });
    }

    const { procName, paramNames, values = [] } = req.body;

    if (!procName || !paramNames) {
      return res.status(400).json({
        success: false,
        message: 'procName and paramNames are required.',
      });
    }

    const params = buildParams(paramNames, values);
    const result = await executeDRL(procName, params);

    return res.json({
      success: true,
      data: result.recordsets.length === 1 ? result.recordset : result.recordsets,
      rowsAffected: result.rowsAffected,
      returnValue: result.returnValue,
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/dml', async (req, res, next) => {
  try {
    if (!isDbConfigured()) {
      return res.status(503).json({ success: false, message: 'Database not configured.' });
    }

    const { procName, paramNames, values = [] } = req.body;

    if (!procName || !paramNames) {
      return res.status(400).json({
        success: false,
        message: 'procName and paramNames are required.',
      });
    }

    const params = buildParams(paramNames, values);
    const result = await executeDML(procName, params);

    return res.json({
      success: true,
      data: result.recordsets.length === 1 ? result.recordset : result.recordsets,
      rowsAffected: result.rowsAffected,
      returnValue: result.returnValue,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
