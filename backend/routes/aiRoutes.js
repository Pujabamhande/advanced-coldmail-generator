const express = require('express');
const router = express.Router();
const { generateEmail, getHistory } = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/generate-email', protect, generateEmail);
router.get('/history', protect, getHistory);

module.exports = router;