const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const requireAuth = async (req, res, next) => {

    // Verify if user is authenticated
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({error: 'Authorization token is required'});
    }

    const token = authorization.split(' ')[1]; // Token comes second after 'bearer' part

    try {
        const { _id } = jwt.verify(token, process.env.SECRET); // Validates token
        consloe.log('id is:', _id)
        req.user = await User.findById(_id).select('_id'); // search user id in db
    } catch (error) {
        console.log(error);
        res.status(401).json({error: 'Request is not authorized'});
    }
}

module.exports = requireAuth;