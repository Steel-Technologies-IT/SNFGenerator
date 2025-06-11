const Pool = require("pg").Pool;
const pool = new Pool({
  user: 'postgres',
  password: 'sttx1234',
  host: 'localhost',
  port: 5432,
  database: 'EDI',
});


module.exports = pool;