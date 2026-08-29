const sql = require('mssql');

let pool = null;
let poolPromise = null;

function getConfig() {
  const connectionTimeout = Number(process.env.DB_CONNECTION_TIMEOUT_MS) || 8000;
  const requestTimeout = Number(process.env.DB_REQUEST_TIMEOUT_MS) || 30000;
  const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined;

  // Support "host,port" in DB_SERVER (same style as Web.config Data Source)
  let server = process.env.DB_SERVER || '';
  let resolvedPort = port;
  if (server.includes(',') && !resolvedPort) {
    const [host, portPart] = server.split(',');
    server = host.trim();
    resolvedPort = Number(portPart.trim()) || undefined;
  }

  const config = {
    server,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectionTimeout,
    requestTimeout,
    options: {
      encrypt: process.env.DB_ENCRYPT !== 'false',
      trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
      enableArithAbort: true,
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  };

  if (resolvedPort) {
    config.port = resolvedPort;
  }

  return config;
}

function isDbConfigured() {
  return Boolean(
    process.env.DB_SERVER && process.env.DB_DATABASE && process.env.DB_USER && process.env.DB_PASSWORD
  );
}

async function getPool() {
  if (!isDbConfigured()) {
    throw new Error('Database is not configured. Set DB_SERVER, DB_DATABASE, DB_USER, DB_PASSWORD in .env');
  }

  if (pool) return pool;

  if (!poolPromise) {
    poolPromise = sql
      .connect(getConfig())
      .then((connected) => {
        pool = connected;
        pool.on('error', (err) => {
          console.error('[db] pool error:', err.message);
          pool = null;
          poolPromise = null;
        });
        return connected;
      })
      .catch((err) => {
        pool = null;
        poolPromise = null;
        throw err;
      });
  }

  return poolPromise;
}

async function closePool() {
  if (pool) {
    await pool.close();
    pool = null;
    poolPromise = null;
  }
}

/** Race a DB call against a timeout so UI can fall back to demo mode quickly. */
function withTimeout(promise, ms, label = 'DB operation') {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

module.exports = {
  sql,
  getPool,
  closePool,
  isDbConfigured,
  withTimeout,
};
