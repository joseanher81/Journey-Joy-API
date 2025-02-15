const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const documentSchema = new Schema({
    fileUrl: {
        type: String,
        required: true
    },
    description: {
        type: String,  
        required: true 
    },
    type: {
        type: String,  
        required: true 
    }
});

module.exports = mongoose.model('Document', documentSchema);