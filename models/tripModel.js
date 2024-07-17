const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const tripSchema = new Schema({
    iso: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    description: {
        type: String,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    pictureUrl: {
        type: String,
        required: true
    },
    place: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    travelDuration: {
        type: Number,
        required: true
    },
    comments: [{
        type: Schema.Types.ObjectId, 
        ref: 'Comment'
    }],
    companions: [{
        type: Schema.Types.ObjectId, 
        ref: 'User'
    }],
    documents: [{
        type: Schema.Types.ObjectId, 
        ref: 'Document'
    }],
    days: [{
        type: Schema.Types.ObjectId, 
        ref: 'Day'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);