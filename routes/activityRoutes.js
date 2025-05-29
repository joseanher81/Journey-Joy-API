const express = require('express');
const { createActivity, deleteActivity, updateActivity, updateMultipleActivities } = require('../controllers/activityController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// require auth protection for all ACTIVITY routes (Only logged users can request)
router.use(requireAuth);

// POST a new activity
router.post('/', createActivity);

// DELETE an activity
router.delete('/:activityId', deleteActivity);

// UPDATE multiple activities
router.patch('/bulk-update', updateMultipleActivities);

// UPDATE an activity
router.patch('/:activityId', updateActivity);



module.exports = router;