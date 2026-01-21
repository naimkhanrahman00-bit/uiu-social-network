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
            date_lost_found
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
            expires_at
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

// @desc    Delete a post
// @route   DELETE /api/lost-found/:id
// @access  Private
const deletePost = async (req, res) => {
    try {
        const post = await LostFoundPost.getById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check user ownership
        if (post.user_id !== req.user.id) { // Assuming req.user is set by auth middleware
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }

        await LostFoundPost.delete(req.params.id);
        res.json({ message: 'Post removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Update post status
// @route   PATCH /api/lost-found/:id/status
// @access  Private
const updatePostStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['lost', 'found', 'claimed', 'returned'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const post = await LostFoundPost.getById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check user ownership
        if (post.user_id !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this post' });
        }

        await LostFoundPost.updateStatus(req.params.id, status);
        res.json({ message: 'Status updated', status });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Get current user's posts
// @route   GET /api/lost-found/my-posts
// @access  Private
const getMyPosts = async (req, res) => {
    try {
        // Include expired posts for the owner so they can renew them
        const posts = await LostFoundPost.getAll({
            user_id: req.user.id,
            include_expired: true
        });
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Renew a post
// @route   PATCH /api/lost-found/:id/renew
// @access  Private
const renewPost = async (req, res) => {
    try {
        const post = await LostFoundPost.getById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check user ownership
        if (post.user_id !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to renew this post' });
        }

        await LostFoundPost.renew(req.params.id);
        res.json({ message: 'Post renewed for 30 days' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Update a post
// @route   PUT /api/lost-found/:id
// @access  Private
const updatePost = async (req, res) => {
    try {
        const {
            category_id,
            title,
            description,
            name_on_card,
            card_student_id,
            card_department,
            location,
            date_lost_found
        } = req.body;

        const post = await LostFoundPost.getById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check user ownership
        if (post.user_id !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this post' });
        }

        const image_path = req.file ? `/uploads/items/${req.file.filename}` : null;

        await LostFoundPost.update(req.params.id, {
            category_id,
            title,
            description,
            name_on_card,
            card_student_id,
            card_department,
            location,
            date_lost_found,
            image_path
        });

        res.json({ message: 'Post updated successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

module.exports = {
    createPost,
    getCategories,
    getAllPosts,
    getPostById,
    deletePost,
    updatePostStatus,
    getMyPosts,
    updatePost,
    renewPost
};
