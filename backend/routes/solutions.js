const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Solutions route working'
  });
});

router.post('/', (req, res) => {
  res.json({
    success: true,
    message: 'Create solution route working'
  });
});

module.exports = router;