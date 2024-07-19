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
    start: Date
});

module.exports = mongoose.model('Activity', activitySchema);