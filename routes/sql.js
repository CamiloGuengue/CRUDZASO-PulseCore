const express = require('express');
const { query } = require('../config/db');
const router = express.Router();

// Temporal comentado
// router.use(authMiddleware);

router.get('/users', async (req, res) => {  // Sin checkRole
  try {
    const result = await query('SELECT id, email, role FROM users');
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
