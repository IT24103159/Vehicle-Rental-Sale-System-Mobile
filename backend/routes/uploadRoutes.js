const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = require('../config/cloudinary');

const upload = multer({ storage });

router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image provided' });
    }
    // multer-storage-cloudinary adds the Cloudinary URL in req.file.path
    res.json({ imageUrl: req.file.path });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
});

module.exports = router;
