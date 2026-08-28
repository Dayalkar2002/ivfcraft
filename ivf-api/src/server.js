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
const { isDbConfigured, getPool } = require('./db/pool');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
  origin: (process.env.CORS_ORIGIN || 'http://localhost:3001')
    .split(',')
    .map((origin) => origin.trim()),
  credentials: true,
}));
app.use(express.json());

app.get('/api/health', async (req, res) => {
  const health = {
    success: true,
    message: 'smART IVF API is running.',
    database: 'not_configured',
    routes: ['auth', 'patients', 'cycles', 'sp', 'masters', 'iui', 'ivf', 'icsi', 'et', 'bt'],
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

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`smART IVF API listening on http://localhost:${PORT}`);
});
