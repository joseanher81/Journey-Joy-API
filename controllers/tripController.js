const Trip = require('../models/tripModel');
const Comment = require('../models/commentModel');
const { differenceInDays } = require('date-fns');
const { checkEmptyFields, loadPlacePicture, findISOAndCountryByPlace } = require('../helpers/utils');

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

module.exports = { createTrip, createComment }