require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

console.log('🚀 Iniciando PulseCore...');
console.log('DB_URL cargada:', !!process.env.DB_URL);

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', require('./routes'));

// Ruta test básica
app.get('/', (req, res) => {
  res.json({ 
    message: 'estas aqui por algo',
    endpoints: ['/api/auth/login', '/api/auth/register']
  });
});

// Test DB (temporal)
app.get('/db-test', async (req, res) => {
  try {
    const { query } = require('./config/db');
    const result = await query('SELECT NOW()');
    res.json({ status: '✅ Supabase OK', time: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, (error) => {
  if (error) {
    console.error('❌ Error servidor:', error);
  } else {
    console.log(`✅ PulseCore corriendo http://localhost:${PORT}`);
    console.log(`📱 Test: curl localhost:${PORT}`);
  }
});
