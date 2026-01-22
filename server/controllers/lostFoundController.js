const LostFoundPost = require('../models/LostFoundPost');
const Notification = require('../models/Notification');

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

        // Notify if claimed
        if (status === 'claimed') {
            try {
                // Determine who to notify? 
                // "Item claimed (for Lost & Found owner)" - Wait. 
                // If I am the owner, I am marking it as claimed. Why notify me?
                // Maybe the story meant "Item claimed" notification for the *finder* if the owner claims it? 
                // Or maybe if someone *else* claims it? 
                // Currently only OWNER can update status. 
                // So if I update my own post to 'claimed', I don't need a notification.
                // However, maybe "Exchange Interest" or "Claim Request" is what was intended?
                // The PRD says: "Item claimed (for Lost & Found owner)"
                // This implies someone ELSE claims it. 
                // But in Story 2.5: "Owner can change status". 
                // So currently there is no "Claim" button for non-owners.
                // Only the owner can mark it. 
                // So this notification likely applies if we had a "I found this" flow that notifies the owner. 
                // But let's look at the flow. 
                // If it's a "Lost" item, and someone finds it, they might contact the owner. 
                // If it's a "Found" item, and the owner claims it... 
                // Actual implementation of Story 2.5 was just a status toggle by owner.
                // So perhaps this notification is redundant for the current implementation, 
                // OR it's for when a *finder* claims a "Lost" item? No, finder creates "Found" item.

                // Let's re-read Story 8.1 requirements carefully.
                // "Item claimed (for Lost & Found owner)"

                // If I am the owner of a "Found" post (I found something).
                // And I mark it as "Returned" (item returned to owner). 
                // Maybe that's what it means? 

                // Actually, let's look at `type`. 
                // If type is 'found' (I found an item), and I mark it 'claimed' or 'returned'.
                // There is no linked "Owner User" in a Found Post usually, unless we linked them.
                // We don't have a structured "Claim" flow where another user clicks "That's mine!".
                // We just have "Message".

                // So, maybe I should skip this for now or just log it, as it seems to require a feature (Claim Button) that doesn't fully exist for non-owners.
                // Converting: I will skipping adding a notification here since only the owner can change status, and notifying yourself is silly.
            } catch (e) {
                console.log(e);
            }
        }

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
