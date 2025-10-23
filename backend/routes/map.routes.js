const express = require('express');
const router = express.Router();
const mapController = require('../controllers/map.controller');

// GET /api/map?city=Bengaluru
router.get('/', mapController.getMapData);

module.exports = router;