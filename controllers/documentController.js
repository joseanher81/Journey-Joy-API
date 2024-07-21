const Document = require('../models/documentModel');
const Trip = require('../models/tripModel');
const mongoose = require('mongoose');
const { checkEmptyFields } = require('../helpers/utils');
const { saveFileToStorage, deleteFileFromStorage } = require('../helpers/firebase');

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

        // Add document to array in Trip and save
        trip.documents.push(document._id);
        trip.save();

        return res.status(200).json(trip);
        
    } catch (error) {
        res.status(400).json({error: error.message});    
    }

}

// Delete a document TODO: in the future could check if the user has rights to delete the document, adding an author field to the model
const deleteDocument = async (req, res) => {
    const { documentId } = req.params; // document id to delete

    // Check if the ID is valid (NOT SURE IF NEEDED!)
    if (!mongoose.Types.ObjectId.isValid(documentId)) {
        return res.status(404).json({error: 'No such document'})
    }

    const document = await Document.findById(documentId);

    // Check if document exists
    if (!document) {
        return res.status(404).json({ message: 'Document not found' });
    }

    // Extract file URL to delete from Firebase Storage
    const fileUrl = document.fileUrl;

    // Delete the file from Firebase Storage
    await deleteFileFromStorage(fileUrl);

    // Find trip with that document
    const trip = await Trip.findOne({ documents: documentId });

    // Check if trip with that document exists 
    if (!trip) {
        return res.status(404).json({ error: 'Trip not found for the given document' });
    }

    // Delete document ref in trip
    trip.documents.pull(documentId);
    await trip.save();

    // Remove document from Document collection
    await document.deleteOne();
  

    res.status(200).json({ message:  "Document removed successfully" });
}

module.exports = { createDocument, deleteDocument }