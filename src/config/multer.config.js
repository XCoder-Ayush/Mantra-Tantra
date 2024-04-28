const multer = require('multer');

// Set up storage for uploaded files
// Disk Storage has been used to eliminate the RAM Buffer problem.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/temp/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

module.exports = storage;
