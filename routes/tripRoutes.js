const express = require('express');
const { createTrip, getTrips, getTrip, deleteTrip } = require('../controllers/tripController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// require auth protection for all trip routes (Only logged users can request)
router.use(requireAuth);

// GET all user trips
router.get('/', getTrips);

// GET a single trip
router.get('/:tripId', getTrip);

// POST a new trip
router.post('/', createTrip);

// DELETE a trip
router.delete('/:tripId', deleteTrip);

module.exports = router;