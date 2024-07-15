const express = require('express');
const { loginUser, signupUser, updateUser, getUser } = require('../controllers/userController');

const router = express.Router();

// Get user
router.get('/:id', getUser);

// Login route
router.post('/login', loginUser);

// Signup route
router.post('/signup', signupUser);

// Update user
router.patch('/update', updateUser);

module.exports = router;