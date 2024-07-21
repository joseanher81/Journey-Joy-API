const Trip = require('../models/tripModel');
const Comment = require('../models/commentModel');
const Document = require('../models/documentModel');
const Day = require('../models/dayModel');
const Activity = require('../models/activityModel');
const mongoose = require('mongoose');
const { differenceInDays } = require('date-fns');
const { deleteFileFromStorage } = require('../helpers/firebase');
const { checkEmptyFields, loadPlacePicture, findISOAndCountryByPlace, createDaysArray } = require('../helpers/utils');


// Get all trips
const getTrips = async (req, res) => {

    const userId = req.user._id; // user id from token in auth middleware

    const trips = await Trip.find({createdBy: userId}).sort({createdAt: -1}); // fin all user trips in db
    res.status(200).json(trips);
}

// Get a single trip
const getTrip = async (req, res) => {

    const { tripId } = req.params;

    // Check if the ID is valid
    if (!mongoose.Types.ObjectId.isValid(tripId)) {
        return res.status(404).json({error: 'Trip not found'})
    }

    const trip = await Trip.findById(tripId);

    if (!trip) {
        return res.status(404).json({error: 'Trip not found'});
    }

    return res.status(200).json(trip);
}

// Create a trip
const createTrip = async (req, res) => {
    
    const { title, place, startDate, endDate, description, companions } = req.body;
    const userId = req.user._id; // user id from token in auth middleware

    // List of required fields
    const requiredFields = { title, place, startDate, endDate, description };

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
        const days = createDaysArray(travelDuration); // Create days

        const trip = await Trip.create({createdBy: userId, title, place, startDate, endDate, description, iso, country, pictureUrl, travelDuration, companions, days});
       
        res.status(200).json(trip);
        
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

// Delete a trip
const deleteTrip = async (req, res) => {

    const userId = req.user._id; // user id from token in auth middleware
    const { tripId } = req.params; // trip id to delete

    // Check if the ID is valid
    if (!mongoose.Types.ObjectId.isValid(tripId)) {
        return res.status(404).json({error: 'No such trip'})
    }

    try {
        const trip = await Trip.findById(tripId)
            .populate('comments')
            .populate('documents')
            .populate({
                path: 'days',
                populate: {
                    path: 'activities'
                }
            });

        // Check if trip exists
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }
       
        // Check if the user is the creator of trip (Only the person who has created the trip can delete it)
        if ( userId.toString() !== trip.createdBy.toString() ) {
            return res.status(403).json({error: "Only trips created by user can be deleted"});
        }

        // Get document URLs from the trip
        const documentUrls = trip.documents.map(doc => doc.fileUrl);

        // Delete documents from Firebase Storage
        await Promise.all(documentUrls.map(url => deleteFileFromStorage(url)));

        // Remove all associated comments, documents, days and activities
        await Promise.all([
            Comment.deleteMany({ _id: { $in: trip.comments } }),
            Document.deleteMany({ _id: { $in: trip.documents } }),
            ...trip.days.map(async (day) => {
                await Activity.deleteMany({ _id: { $in: day.activities } });
                await Day.deleteOne({ _id: day._id });
            }),
            Trip.deleteOne({ _id: tripId }) // Finally, remove the trip itself
        ]);

        res.status(200).json("Trip removed successfully");
        
    } catch (error) {
        res.status(400).json({error: error.message});
    }

}

module.exports = { getTrips, getTrip, createTrip, deleteTrip }