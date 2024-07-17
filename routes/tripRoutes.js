const express = require('express');
const { createTrip, createComment, getTrips, getTrip } = require('../controllers/tripController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// require auth protection for all trip routes (Only logged users can request)
router.use(requireAuth);

// GET all user trips
router.get('/', getTrips);

// GET a single trip
router.get('/:id', getTrip);

// POST a new trip
router.post('/', createTrip);

// POST a new comment
router.post('/comment', createComment);

// POST a new document
//router.post('/comment', );

module.exports = router;