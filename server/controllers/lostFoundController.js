const LostFoundPost = require('../models/LostFoundPost');

// @desc    Create a new lost/found post
// @route   POST /api/lost-found
// @access  Private
const createPost = async (req, res) => {
    try {
        const {
            category_id,
            type = 'lost', // default to lost for now
            title,
            description,
            name_on_card,
            card_student_id,
            card_department,
            location,
            date_lost_found,
            collection_location
        } = req.body;

        // Basic validation
        if (!category_id || !title || !location || !date_lost_found) {
            return res.status(400).json({ message: 'Please fill in all required fields' });
        }

        const image_path = req.file ? `/uploads/items/${req.file.filename}` : null;

        // Expiration defaults to 30 days from now
        const expires_at = new Date();
        expires_at.setDate(expires_at.getDate() + 30);

        const newPostId = await LostFoundPost.create({
            user_id: req.user.id,
            category_id,
            type,
            title,
            description,
            name_on_card,
            card_student_id,
            card_department,
            location,
            date_lost_found,
            image_path,
            status: type, // 'lost' or 'found'
            expires_at,
            collection_location
        });

        res.status(201).json({ message: 'Post created successfully', postId: newPostId });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Get all categories
// @route   GET /api/lost-found/categories
// @access  Private (or Public?)
const getCategories = async (req, res) => {
    try {
        const categories = await LostFoundPost.getCategories();
        res.json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Get all posts
// @route   GET /api/lost-found
// @access  Private
const getAllPosts = async (req, res) => {
    try {
        const { type, search } = req.query;
        const posts = await LostFoundPost.getAll({ type, search });
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Get single post by ID
// @route   GET /api/lost-found/:id
// @access  Private
const getPostById = async (req, res) => {
    try {
        const post = await LostFoundPost.getById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

module.exports = {
    createPost,
    getCategories,
    getAllPosts,
    getPostById
};
