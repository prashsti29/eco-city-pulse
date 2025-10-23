const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { 
  compareWards, 
  getWardLeaderboard, 
  getWardDetails 
} = require('../controllers/ward.controller');

const router = express.Router();

router.post('/compare', protect, compareWards);
router.post('/leaderboard', protect, getWardLeaderboard);
router.get('/:wardId', protect, getWardDetails);

module.exports = router;