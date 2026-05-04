const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folderName = 'itp_kandy_vehicles';
    
    if (file.fieldname === 'bankSlip') {
      folderName = 'itp_kandy_payment_slips';
    } else if (file.mimetype === 'application/pdf') {
      folderName = 'itp_kandy_vehicles_reports';
    }

    if (file.mimetype === 'application/pdf') {
      return {
        folder: folderName,
        allowed_formats: ['pdf'],
        resource_type: 'raw' // Required for PDFs to avoid 401 Unauthorized
      };
    }
    
    return {
      folder: folderName,
      allowed_formats: ['jpg', 'png', 'jpeg'],
      transformation: [{ width: 800, height: 600, crop: 'limit' }]
    };
  },
});

module.exports = storage;
