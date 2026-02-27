const postgres = require('postgres');
require('dotenv').config();

const sql = postgres(process.env.DB_URL, { ssl: 'require' });

module.exports = { query: sql };
