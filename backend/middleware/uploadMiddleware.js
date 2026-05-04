const multer = require('multer');
const storage = require('../config/cloudinary');

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit 5MB per image
});

module.exports = { upload, uploadSlip: upload };
