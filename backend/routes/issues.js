const express = require('express');
const router = express.Router();

const {
  createIssue,
  getIssues,
  getIssueById
} = require('../controllers/issueController');

const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getIssues);
router.get('/:id', getIssueById);
router.post('/', protect, upload.array('circuitImage', 5), createIssue);

module.exports = router;