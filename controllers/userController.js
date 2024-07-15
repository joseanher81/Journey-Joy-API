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

        // TODO Send personalized error if user is not found? -> findByIdAndUpdate throws an error if wrong id

        const {password, ...user} = updatedUser._doc; // avoid returning sensible data such as password
        res.status(200).send({ message: 'User updated successfully', user })
        
    } catch (error) {
        res.status(500).send({message: 'Error updating user', error});
    }

}

// GET USER INFO
const getUser = async (req, res) => {

    const {id} = req.params;

    try {
        const userFound = await User.findById(id);
       
        if(!userFound) {
            return res.status(404).send({ message: 'User not found' });
        }
        
        const {password, ...user} = userFound._doc; // avoid returning sensible data such as password
        res.status(200).send(user);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

module.exports = { loginUser, signupUser, updateUser, getUser }