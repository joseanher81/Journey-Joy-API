const express = require('express');
const { createTrip, createComment } = require('../controllers/tripController');
const router = express.Router();

// POST a new trip
router.post('/', createTrip);

// POST a new comment
router.post('/comment', createComment);

// POST a new document
//router.post('/comment', );

module.exports = router;