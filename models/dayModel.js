const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const daySchema = new Schema({
    dayNumber: {
        type: Number,
        required: true
    },
    dayDate: {
        type: Date,
        required: true  // Puedes quitar esto si no siempre se va a definir
    },
    activities: [{
        type: Schema.Types.ObjectId, 
        ref: 'Activity'
    }]
});

module.exports = mongoose.model('Day', daySchema);