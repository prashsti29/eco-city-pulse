// routes/overview.routes.js
const express = require('express');
const { getOverviewData } = require('../controllers/overview.controller');

const router = express.Router();

router.get('/', getOverviewData);

module.exports = router;
