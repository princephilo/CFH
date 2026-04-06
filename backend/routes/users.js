const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

router.get('/leaderboard', (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

router.put('/profile', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Profile updated',
    data: req.body
  });
});

module.exports = router;