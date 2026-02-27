// const express = require('express');
// const { query } = require('../config/db');
// const { authMiddleware, checkRole } = require('../config/auth');

// const router = express.Router();

// 🔥 PROTEGE TODOS LOS ENDPOINTS SQL
// router.use(authMiddleware);

// router.get('/users', checkRole(['ADMIN']), async (req, res) => {
//   const result = await query('SELECT id, email, role FROM users');
//   res.json(result.rows);
// });

// router.get('/campaigns', checkRole(['ADMIN', 'AGENT']), async (req, res) => {
//   const result = await query('SELECT * FROM campaigns');
//   res.json(result.rows);
// });

// router.get('/appointments', checkRole(['ADMIN', 'AGENT']), async (req, res) => {
//   const result = await query('SELECT * FROM appointments');
//   res.json(result.rows);
// });

// module.exports = router;
