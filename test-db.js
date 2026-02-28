require('dotenv').config();
const { query } = require('./config/db');

(async () => {
  try {
    const result = await query('SELECT 1 as ping');
    console.log('✅ DB OK:', result.rows);
  } catch (e) {
    console.error('❌ Error:', e.message);
  }
})();
