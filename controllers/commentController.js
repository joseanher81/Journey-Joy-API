const Comment = require('../models/commentModel');
const Trip = require('../models/tripModel');
const mongoose = require('mongoose');
const { checkEmptyFields } = require('../helpers/utils');

// Create a comment
const createComment = async (req, res) => {

    const { content, tripId } = req.body; 
    const userId = req.user._id; // user id from token in auth middleware

    // List of required fields
    const requiredFields = { content, userId };

    // Check empty required fields
    const emptyFields = checkEmptyFields(requiredFields);

    if (emptyFields.length > 0) {
        return res.status(400).json({ error: 'Please fill in all fields', emptyFields });
    }

    try {

        // Create a new comment instance
        const comment = await Comment.create({ content, userId});

        // Find trip by ID
        const trip = await Trip.findById(tripId);

        if(!trip) {
            return res.status(400).json({ error: 'Trip not found' });
        }

        // Add comment to array in Trip and save
        trip.comments.push(comment._id);
        await trip.save();

        return res.status(200).json(trip);
        
    } catch (error) {
        res.status(400).json({error: error.message});    
    }

}

// Delete comment
const deleteComment = async (req, res) => {
    const userId = req.user._id; // user id from token in auth middleware
    const { commentId } = req.params; // comment id to delete

    // Check if the ID is valid (NOT SURE IF NEEDED!)
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        return res.status(404).json({error: 'No such trip'})
    }

    const comment = await Comment.findById(commentId);

    // Check if comment exists
    if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
    }
   
    // Check if the user is the creator of comment (Only the person who has created the comment can delete it)
    if ( userId.toString() !== comment.userId.toString() ) {
        return res.status(403).json({error: "Only comments created by user can be deleted"});
    }

    // Find trip with that comment
    const trip = await Trip.findOne({ comments: commentId });

    // Check if trip with that comment exists 
    if (!trip) {
        return res.status(404).json({ error: 'Trip not found for the given comment' });
    }

    // Delete comment ref in trip
    trip.comments.pull(commentId);
    await trip.save();

    // Remove comment from Comment collection
    await comment.deleteOne();

    res.status(200).json("Comment removed successfully");

}

module.exports = { createComment, deleteComment }