const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, '..', 'data', 'users.json');

router.post('/login', (req, res) => {
  const { userId, password } = req.body;
  const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (user.password !== password) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const { password: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

router.get('/users', (req, res) => {
  const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
  const safeUsers = users.map(({ password, ...rest }) => rest);
  res.json(safeUsers);
});

module.exports = router;
