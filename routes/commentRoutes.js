const express = require('express');
const { createComment, deleteComment } = require('../controllers/commentController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// require auth protection for all trip routes (Only logged users can request)
router.use(requireAuth);

// POST a new comment
router.post('/', createComment);

// DELETE a comment
router.delete('/:commentId', deleteComment);

module.exports = router;