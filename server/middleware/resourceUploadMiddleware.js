const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = './uploads/resources/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set storage engine
const storage = multer.diskStorage({
    destination: uploadDir,
    filename: function (req, file, cb) {
        // Generate unique filename: fieldname-timestamp.ext
        // Clean original name to remove spaces etc
        const cleanName = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9]/g, '_');
        cb(null, cleanName + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Check file type
function checkFileType(file, cb) {
    const filetypes = /pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype === 'application/pdf';

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Error: PDFs Only!'));
    }
}

// Init upload
const uploadResource = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

module.exports = uploadResource;
