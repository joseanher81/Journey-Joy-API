const Activity = require('../models/activityModel');
const Day = require('../models/dayModel');
const mongoose = require('mongoose');
const { checkEmptyFields } = require('../helpers/utils');


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
        const activity = await Activity.create({ activityName, activityType, dayId });

        // Add activity to array in Trip and save
        day.activities.push(activity._id);
        day.save();

        return res.status(200).json(day);
        
    } catch (error) {
        res.status(400).json({error: error.message});    
    }
}

// Delete an activity
const deleteActivity = async (req, res) => {
    const { activityId } = req.params;

    // Check if the ID is valid
    if ( !mongoose.Types.ObjectId.isValid(activityId) ) {
        return res.status(404).json({error: 'Invalid day or activity'})
    }

    try {

        // Remove the activity from the database
        const deletedActivity = await Activity.findByIdAndDelete(activityId);
        if(!deletedActivity) {
            return res.status(404).json({ error: 'Activity not found'});
        }

        // Find the day document
        const day = await Day.findById(deletedActivity.dayId);
        if(!day) {
            return res.status(400).json({error: 'Day not found'});
        }

        // Remove the activity from the activities array on the day
        day.activities.pull(activityId);
        await day.save();

        res.status(200).json({ message: 'Activity removed successfully' });
        
    } catch (error) {
        res.status(400).json({ error: error.message });
    }

}

// Update an activity
const updateActivity = async (req, res) => {
    const { activityId } = req.params;
    const update = req.body;

    // Check if the ID is valid
    if (!mongoose.Types.ObjectId.isValid(activityId)) {
        return res.status(404).json({error: 'Invalid activity'})
    }

    try {
        // Update the activity
        const updatedActivity = await Activity.findByIdAndUpdate(activityId, update, { new: true });

        // Check if activity exists
        if(!updatedActivity) {
            return res.status(404).json({ error: 'Activity not found'});
        }

        res.status(200).json(updatedActivity);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

module.exports = { createActivity, deleteActivity, updateActivity }