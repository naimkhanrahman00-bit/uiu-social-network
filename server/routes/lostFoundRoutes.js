const express = require('express');
const router = express.Router();
const { createPost, getCategories, getAllPosts, getPostById, deletePost, updatePostStatus, getMyPosts, updatePost, renewPost } = require('../controllers/lostFoundController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Ensure this directory exists!
        cb(null, 'uploads/items/');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Images only!'));
    }
};

const uploadItem = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB
    fileFilter: fileFilter
});

router.post('/', protect, uploadItem.single('image'), createPost);
router.get('/categories', protect, getCategories);
router.get('/my-posts', protect, getMyPosts);
router.get('/', protect, getAllPosts);


router.get('/:id', protect, getPostById);
router.put('/:id', protect, uploadItem.single('image'), updatePost);
router.delete('/:id', protect, deletePost);
router.patch('/:id/status', protect, updatePostStatus);
router.patch('/:id/renew', protect, renewPost);

module.exports = router;
