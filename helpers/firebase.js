const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.resolve(__dirname, '../config/serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'journey-joy-v2.appspot.com'
});

const bucket = admin.storage().bucket();

async function saveFileToStorage(fileBuffer, originalName, mimeType) {
    const fileName = `${Date.now()}_${path.basename(originalName)}`;
    const file = bucket.file(fileName);
  
    const stream = file.createWriteStream({
      metadata: {
        contentType: mimeType,
      },
      resumable: false,
    });
  
    return new Promise((resolve, reject) => {
      stream.on('error', (err) => {
        reject(err);
      });
  
      stream.on('finish', async () => {
        try {
          await file.makePublic();
          const fileUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
          resolve(fileUrl);
        } catch (err) {
          reject(err);
        }
      });
  
      stream.end(fileBuffer);
    });
  }

async function deleteFileFromStorage(fileUrl) {
  // Get file name from URL
  const fileName = fileUrl.split('/').pop().split('?')[0];

  const file = bucket.file(fileName);

  try {
      await file.delete();
      console.log(`File ${fileName} deleted successfully.`);
  } catch (error) {
      console.error(`Error deleting file ${fileName}:`, error);
      throw new Error(`Failed to delete file from storage: ${error.message}`);
  }
}
  
  module.exports = {
    saveFileToStorage,
    deleteFileFromStorage
  };
