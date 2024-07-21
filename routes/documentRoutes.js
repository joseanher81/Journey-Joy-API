const express = require('express');
const { createDocument, deleteDocument } = require('../controllers/documentController');
const requireAuth = require('../middleware/requireAuth');
const multer = require('multer');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// require auth protection for all DOCUMENT routes (Only logged users can request)
router.use(requireAuth);

// POST a new document
router.post('/', upload.single('file'), createDocument);

// DELETE a document
router.delete('/:documentId', deleteDocument);

module.exports = router;