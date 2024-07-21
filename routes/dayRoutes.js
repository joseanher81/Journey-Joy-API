const express = require('express');
const { updateDay } = require('../controllers/dayController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// require auth protection for all DAY routes (Only logged users can request)
router.use(requireAuth);

// UPDATE a day (order of activities)
router.patch('/:dayId', updateDay);

module.exports = router;