const express = require('express');
const { loginUser, signupUser, updateUser } = require('../controllers/userController');

const router = express.Router();

// Login route
router.post('/login', loginUser);

// Signup route
router.post('/signup', signupUser);

// Update user
router.patch('/update', updateUser);

module.exports = router;