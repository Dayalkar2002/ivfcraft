const express = require('express');
const dashboardService = require('../services/dashboard.service');
const { isDbConfigured } = require('../db/pool');

const router = express.Router();

router.get('/summary', async (req, res, next) => {
  try {
    if (!isDbConfigured()) {
      return res.json({
        success: true,
        demo: true,
        data: {
          kpis: {
            patients: 1284,
            satellites: 2,
            cycles: 356,
            iui: 210,
            ivf: 148,
            et: 96,
            bt: 42,
          },
          recentCycles: [],
          recentIui: [],
          modules: [
            { key: 'iui', label: 'IUI', href: '/iui', count: 210 },
            { key: 'cycle', label: 'Cycles', href: '/cycle/entry', count: 356 },
            { key: 'ivf', label: 'IVF', href: '/ivf', count: 148 },
            { key: 'icsi', label: 'ICSI', href: '/icsi', count: 88 },
            { key: 'et', label: 'ET', href: '/et', count: 96 },
            { key: 'bt', label: 'BT', href: '/bt', count: 42 },
          ],
        },
      });
    }

    const data = await dashboardService.getSummary({
      patId: Number(req.query.patId) || 0,
      satId: Number(req.query.satId) || 0,
      userId: Number(req.user?.userId) || 0,
    });

    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
