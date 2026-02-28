
const express = require('express');
const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@test.com' && password === '123') {
    res.json({ token: 'fake-jwt-token' });
  } else {
    res.status(401).json({error: 'Credenciales inválidas'});
  }
});

module.exports = router;

