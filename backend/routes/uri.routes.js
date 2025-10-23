const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { 
  getUrbanResilienceIndex, 
  getURIWithEncroachment 
} = require('../controllers/uri.controller');

const router = express.Router();

router.post('/calculate', protect, getUrbanResilienceIndex);
router.post('/encroachment', protect, getURIWithEncroachment);

module.exports = router;