const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const activitySchema = new Schema({
    activityName: {
        type: String,
        required: true
    },    
    activityType: {
        type: String,
        required: true
    },
    dayId: {
        type: Schema.Types.ObjectId, 
        ref: 'Day',
        required: true 
    },
    pos: {
        type: Number,
        required: true
    },   
    start: Date
});

module.exports = mongoose.model('Activity', activitySchema);