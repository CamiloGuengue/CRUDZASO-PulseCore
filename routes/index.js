const express = require('express');
const router = express.Router();

router.get('/test', (req, res) => res.json({ok:true}));

const authRoutes = require('./auth');
router.use('/auth', authRoutes);

const sqlRoutes = require('./sql');  // ← SIMPLE require
router.use('/sql', sqlRoutes);      // ← Router completo

module.exports = router;
