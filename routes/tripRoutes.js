const express = require('express');
const { createTrip, createComment, getTrips, getTrip, createDocument, deleteTrip, deleteComment, deleteDocument, createActivity } = require('../controllers/tripController');
const requireAuth = require('../middleware/requireAuth');
const multer = require('multer');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// require auth protection for all trip routes (Only logged users can request)
router.use(requireAuth);

// GET all user trips
router.get('/', getTrips);

// GET a single trip
router.get('/:id', getTrip);

// POST a new trip
router.post('/', createTrip);

// DELETE a trip
router.delete('/:id', deleteTrip);

// POST a new comment
router.post('/comment', createComment);

// DELETE a comment
router.delete('/comment/:id', deleteComment);

// POST a new document
router.post('/document', upload.single('file'), createDocument);

// DELETE a document
router.delete('/document/:id', deleteDocument);

// POST a new activity
router.post('/activity', createActivity);

module.exports = router;