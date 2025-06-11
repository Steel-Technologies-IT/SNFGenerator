const Pool = require("pg").Pool;
const pool = new Pool({
  user: 'postgres',
  password: 'extol',
  host: '10.203.0.25',
  port: 5432,
  database: 'postgres',
});


module.exports = pool;



