const sql = require('mssql');

let pool = null;

function getConfig() {
  return {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
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
}

function isDbConfigured() {
  return Boolean(process.env.DB_SERVER && process.env.DB_DATABASE && process.env.DB_USER && process.env.DB_PASSWORD);
}

async function getPool() {
  if (!isDbConfigured()) {
    throw new Error('Database is not configured. Set DB_SERVER, DB_DATABASE, DB_USER, DB_PASSWORD in .env');
  }

  if (!pool) {
    pool = await sql.connect(getConfig());
  }

  return pool;
}

async function closePool() {
  if (pool) {
    await pool.close();
    pool = null;
  }
}

module.exports = {
  sql,
  getPool,
  closePool,
  isDbConfigured,
};
