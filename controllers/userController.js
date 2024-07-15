const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const createToken = (_id) => {
    return jwt.sign({_id}, process.env.SECRET, { expiresIn: '3d' });
}

// LOGIN
const loginUser = async (req, res) => {

    const {email, password} = req.body;

    try {
        const user = await User.login(email, password);

        // create a token
        const token = createToken(user._id);

        res.status(200).json({email, token});
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

// SIGNUP
const signupUser = async (req, res) => {

    const {email, password, displayName, photoURL} = req.body;

    try {
        const user = await User.signup(email, password, displayName, photoURL);

        // create a token
        const token = createToken(user._id);

        res.status(200).json({email, token});
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

// UPDATE
const updateUser = async (req, res) => {
    
    const {id, displayName, photoURL, theme} = req.body;  // TODO check if user is logged in

    try {
        const updatedUser = await User.findByIdAndUpdate(id, { displayName, photoURL, theme }, { new: true, runValidators: true});
        const { password, ...userWithoutPassword } = updatedUser;


        // TODO Send personalized error if user is not found? -> findByIdAndUpdate throws an error if wrong id

        res.status(200).send({ message: 'User updated successfully', user: {id: updatedUser.id, theme: updatedUser.theme, photoURL: updatedUser.photoURL} })
        
    } catch (error) {
        res.status(500).send({message: 'Error updating user', error});
    }

}

module.exports = { loginUser, signupUser, updateUser }