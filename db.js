const { Pool } = require('pg');

const pool = new Pool({
  user: 'eventadmin',
  host: 'localhost',
  database: 'eventdb',
  password: 'claveSegura123',
  port: 5432,
});

module.exports = pool;