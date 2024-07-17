const Trip = require('../models/tripModel');
const Comment = require('../models/commentModel');
const Document = require('../models/documentModel');
const mongoose = require('mongoose');
const { differenceInDays } = require('date-fns');
const { checkEmptyFields, loadPlacePicture, findISOAndCountryByPlace } = require('../helpers/utils');

// Get all trips
const getTrips = async (req, res) => {

    const userId = req.user._id; // user id from token in auth middleware

    const trips = await Trip.find({createdBy: userId}).sort({createdAt: -1}); // fin all user trips in db
    res.status(200).json(trips);
}

// Get a single trip
const getTrip = async (req, res) => {

    const { id } = req.params;

    // Check if the ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'Trip not found'})
    }

    const trip = await Trip.findById(id);

    if (!trip) {
        return res.status(404).json({error: 'Trip not found'});
    }

    return res.status(200).json(trip);
}

// Create a trip
const createTrip = async (req, res) => {
    
    const { createdBy, title, place, startDate, endDate, description, companions } = req.body;

    // List of required fields
    const requiredFields = { createdBy, title, place, startDate, endDate, description };

    // Check empty required fields
    const emptyFields = checkEmptyFields(requiredFields);

    if (emptyFields.length > 0) {
        return res.status(400).json({ error: 'Please fill in all fields', emptyFields });
    }

    try {
        
        // Fill dinamic fields
        const [iso, country] = await findISOAndCountryByPlace(place);  // Get country ISO (needed for map representation)
        const pictureUrl = await loadPlacePicture(place);  // Get image for place
        const travelDuration = differenceInDays(new Date(endDate), new Date(startDate)) + 1; // Calculate number of trip days

        const trip = await Trip.create({createdBy, title, place, startDate, endDate, description, iso, country, pictureUrl, travelDuration, companions});
        res.status(200).json(trip);
        
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

// Create a comment
const createComment = async (req, res) => {

    const { content, tripId, author } = req.body; // TODO Author deberá venir de un middleware de usuario
    //const author = req.user._id; // user id from token in auth middleware

    // List of required fields
    const requiredFields = { content, author };

    // Check empty required fields
    const emptyFields = checkEmptyFields(requiredFields);

    if (emptyFields.length > 0) {
        return res.status(400).json({ error: 'Please fill in all fields', emptyFields });
    }

    try {

        // Create a new comment instance
        const comment = await Comment.create({ content, author});

        // Find trip by ID
        const trip = await Trip.findById(tripId);

        if(!trip) {
            return res.status(400).json({ error: 'Trip not found' });
        }

        // Add comment to array in Trip and save
        trip.comments.push(comment._id);
        trip.save();

        return res.status(200).json(trip);
        
    } catch (error) {
        res.status(400).json({error: error.message});    
    }


}

// Create a new document
const createDocument = async (req, res) => {
    const { tripId, fileUrl, description, type } = req.body;

    // List of required fields
    const requiredFields = { tripId, fileUrl, description, type};

    // Check empty required fields
    const emptyFields = checkEmptyFields(requiredFields);

    if (emptyFields.length > 0) {
        return res.status(400).json({ error: 'Please fill in all fields', emptyFields });
    }

    try {

        // Create a new document instance
        const document = await Document.create({ fileUrl, description, type });

        // Find trip by ID
        const trip = await Trip.findById(tripId);

        if(!trip) {
            return res.status(400).json({ error: 'Trip not found' });
        }

        // Add comment to array in Trip and save
        trip.documents.push(document._id);
        trip.save();

        return res.status(200).json(trip);
        
    } catch (error) {
        res.status(400).json({error: error.message});    
    }

}

module.exports = { getTrips, getTrip, createTrip, createComment, createDocument }