const Day = require('../models/dayModel');
const Activity = require('../models/activityModel');
const mongoose = require('mongoose');

// Update a day (order of activities within the day) //This expects a new array of Actities Ids in the new order
const updateDay = async (req, res) => {
    const { dayId } = req.params;
    const { activities } = req.body;

    // Check if the ID is valid
    if (!mongoose.Types.ObjectId.isValid(dayId)) {
        return res.status(404).json({error: 'Invalid day'})
    }

    try {
        // Update the activities of the day
        const updatedDay = await Day.findByIdAndUpdate(
            dayId,
            { $set: { activities: activities } },
            { new: true }
        );

        // Check if day exists
        if(!updatedDay) {
            return res.status(404).json({ error: 'Day not found'});
        }

        // Populate day to check if any activity belonged to another day
        const populatedUpdatedDay = await Day.findById(dayId).populate('activities');

        for(let i = 0; i < populatedUpdatedDay.activities.length; i++) {
            const activity = populatedUpdatedDay.activities[i];
            if(activity.dayId.toString() !== dayId.toString()) { // activity belonged to another day
                //Delete activity from former day
                const formerDay = await Day.findById(activity.dayId).populate('activities');
                formerDay.activities.pull(activity._id);
                formerDay.save();

                // Update day id of activity in current day
                await Activity.findByIdAndUpdate(activity._id, { dayId }, { new: true, runValidators: true});
            }
        }

        res.status(200).json(updatedDay);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }

}

module.exports = { updateDay }