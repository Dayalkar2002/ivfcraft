require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth.routes');
const patientRoutes = require('./routes/patients.routes');
const cycleRoutes = require('./routes/cycles.routes');
const spRoutes = require('./routes/sp.routes');
const mastersRoutes = require('./routes/masters.routes');
const iuiRoutes = require('./routes/iui.routes');
const ivfRoutes = require('./routes/ivf.routes');
const icsiRoutes = require('./routes/icsi.routes');
const etRoutes = require('./routes/et.routes');
const btRoutes = require('./routes/bt.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const consentRoutes = require('./routes/consent.routes');
const { isDbConfigured, getPool } = require('./db/pool');

const app = express();
const PORT = process.env.PORT || 3000;

const defaultOrigins = [
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'https://ivfcraft.vercel.app',
];

const allowedOrigins = new Set(
  (process.env.CORS_ORIGIN || defaultOrigins.join(','))
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(morgan('dev'));
app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser / same-origin tools (no Origin header)
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      console.warn(`[cors] blocked origin: ${origin}`);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', async (req, res) => {
  const health = {
    success: true,
    message: 'smART IVF API is running.',
    database: 'not_configured',
    routes: [
      'auth',
      'patients',
      'cycles',
      'sp',
      'masters',
      'iui',
      'ivf',
      'icsi',
      'et',
      'bt',
      'dashboard',
      'consent',
    ],
  };

  if (isDbConfigured()) {
    try {
      await getPool();
      health.database = 'connected';
    } catch (error) {
      health.database = 'error';
      health.databaseError = error.message;
    }
  }

  res.json(health);
});

app.use('/api/auth', authRoutes);
app.use('/api/patients', authMiddleware, patientRoutes);
app.use('/api/cycles', authMiddleware, cycleRoutes);
app.use('/api/sp', authMiddleware, spRoutes);
app.use('/api/masters', authMiddleware, mastersRoutes);
app.use('/api/iui', authMiddleware, iuiRoutes);
app.use('/api/ivf', authMiddleware, ivfRoutes);
app.use('/api/icsi', authMiddleware, icsiRoutes);
app.use('/api/et', authMiddleware, etRoutes);
app.use('/api/bt', authMiddleware, btRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/consent', authMiddleware, consentRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`smART IVF API listening on http://localhost:${PORT}`);
});
