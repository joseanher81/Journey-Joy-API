const Trip = require('../models/tripModel');
const Comment = require('../models/commentModel');
const Document = require('../models/documentModel');
const Day = require('../models/dayModel');
const Activity = require('../models/activityModel');
const mongoose = require('mongoose');
const { differenceInDays } = require('date-fns');
const { checkEmptyFields, loadPlacePicture, findISOAndCountryByPlace, createDaysArray } = require('../helpers/utils');
const { saveFileToStorage } = require('../helpers/firebase');

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
        const days = createDaysArray(travelDuration); // Create days

        const trip = await Trip.create({createdBy, title, place, startDate, endDate, description, iso, country, pictureUrl, travelDuration, companions, days});
       
        res.status(200).json(trip);
        
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

// Delete a trip
const deleteTrip = async (req, res) => {

    const userId = req.user._id; // user id from token in auth middleware
    const { id } = req.params; // trip id to delete

    // Check if the ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'No such trip'})
    }

    try {
        const trip = await Trip.findById(id)
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

        // Remove trip
        await trip.deleteOne();

        // Remove all associated comments, documents, days and activities
        await Promise.all([
            Comment.deleteMany({ _id: { $in: trip.comments } }),
            Document.deleteMany({ _id: { $in: trip.documents } }),
            ...trip.days.map(async (day) => {
                await Activity.deleteMany({ _id: { $in: day.activities } });
                await Day.deleteOne({ _id: day._id });
            })
        ]);

        res.status(200).json("Trip removed successfully");
        
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

// Delete comment
const deleteComment = async (req, res) => {
    const userId = req.user._id; // user id from token in auth middleware
    const { id } = req.params; // comment id to delete

    // Check if the ID is valid (NOT SURE IF NEEDED!)
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'No such trip'})
    }

    const comment = await Comment.findById(id);

    // Check if comment exists
    if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
    }
   
    // Check if the user is the creator of comment (Only the person who has created the comment can delete it)
    if ( userId.toString() !== comment.author.toString() ) {
        return res.status(403).json({error: "Only comments created by user can be deleted"});
    }

    // Remove comment
    await comment.deleteOne();

    res.status(200).json("Comment removed successfully");

}

// Create a new document
const createDocument = async (req, res) => {
    const { tripId, description, type } = req.body;

    // List of required fields
    const requiredFields = { tripId, description, type};

    // Check empty required fields
    const emptyFields = checkEmptyFields(requiredFields);

    if (emptyFields.length > 0) {
        return res.status(400).json({ error: 'Please fill in all fields', emptyFields });
    }

    try {

        // Check file to upliad
        if (!req.file) {
            return res.status(400).json({ error: 'No file to upload' });
        }

        // Save file to storage
        const fileUrl = await saveFileToStorage(req.file.buffer, req.file.originalname, req.file.mimetype);
        console.log('fileurl', fileUrl)

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

// Delete a document TODO: in the future could check if the user has rights to delete the document, adding an author field to the model
const deleteDocument = async (req, res) => {
    const { id } = req.params; // comment id to delete

    // Check if the ID is valid (NOT SURE IF NEEDED!)
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'No such document'})
    }

    const document = await Document.findByIdAndDelete(id);

    // Check if comment exists
    if (!document) {
        return res.status(404).json({ message: 'Document not found' });
    }

    res.status(200).json({ message:  "Document removed successfully" });
}

// Create an activity
const createActivity = async (req, res) => {
    const { dayId, activityName, activityType } = req.body; 

    // List of required fields
    const requiredFields = { dayId, activityName, activityType };

    // Check empty required fields
    const emptyFields = checkEmptyFields(requiredFields);

    if (emptyFields.length > 0) {
        return res.status(400).json({ error: 'Please fill in all fields', emptyFields });
    }

    try {

        // Find day by ID
        const day = await Day.findById(dayId);

        if(!day) {
            return res.status(400).json({ error: 'Day not found' });
        }

        // Create a new activity instance
        const activity = await Activity.create({ activityName, activityType, position: day.activities.length }); // initial position at the end of day

        // Add comment to array in Trip and save
        day.activities.push(activity._id);
        day.save();

        return res.status(200).json(day);
        
    } catch (error) {
        res.status(400).json({error: error.message});    
    }
}

// Delete an activity
const deleteActivity = async (req, res) => {
    const { dayId, activityId } = req.params;

    // Check if the ID is valid
    if (!mongoose.Types.ObjectId.isValid(dayId) || !mongoose.Types.ObjectId.isValid(activityId) ) {
        return res.status(404).json({error: 'Invalid day or activity'})
    }

    try {

        // Find the day document
        const day = await Day.findById(dayId);
        if(!day) {
            return res.status(400).json({error: 'Day not found'});
        }

        // Remove the activity from the activities array
        day.activities.pull(activityId);
        await day.save();

        // Remove the activity from the database
        await Activity.findByIdAndDelete(activityId);

        res.status(200).json({ message: 'Activity removed successfully' });
        
    } catch (error) {
        res.status(400).json({ error: error.message });
    }

}

// Update an activity
const updateActivity = async (req, res) => {
    const { id } = req.params;
    const update = req.body;

    // Check if the ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'Invalid activity'})
    }

    try {
        // Update the activity
        const updatedActivity = await Activity.findByIdAndUpdate(id, update, { new: true });

        // Check if activity exists
        if(!updatedActivity) {
            return res.status(404).json({ error: 'Activity not found'});
        }

        res.status(200).json(updatedActivity);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

module.exports = { getTrips, getTrip, createTrip, deleteTrip, createComment, deleteComment, createDocument, deleteDocument, createActivity, deleteActivity, updateActivity }