const Feedback = require('../models/Feedback');
const db = require('../config/db');

exports.createGeneralFeedback = async (req, res) => {
    try {
        const { title, content, is_anonymous } = req.body;
        const user_id = req.user.id; // From auth middleware

        console.log('[DEBUG] General Feedback submission:', { user_id, title, content, is_anonymous });

        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required' });
        }

        await Feedback.create({
            user_id,
            feedback_type: 'general',
            title,
            content,
            is_anonymous: is_anonymous === 'true' || is_anonymous === true
        });

        res.status(201).json({ message: 'Feedback submitted successfully' });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createCanteenFeedback = async (req, res) => {
    try {
        const { title, content, is_anonymous } = req.body;
        const user_id = req.user.id;

        console.log('[DEBUG] Canteen Feedback submission:', { user_id, title, content, is_anonymous, files: req.files });

        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required' });
        }

        // Process uploaded files
        const image_paths = req.files ? req.files.map(file => `/uploads/feedback/${file.filename}`) : [];

        await Feedback.create({
            user_id,
            feedback_type: 'canteen',
            title,
            content,
            is_anonymous: is_anonymous === 'true' || is_anonymous === true,
            image_paths
        });

        res.status(201).json({ message: 'Canteen feedback submitted successfully' });
    } catch (error) {
        console.error('Error submitting canteen feedback:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getFeedbacks = async (req, res) => {
    try {
        const { type, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const { feedbacks, total } = await Feedback.getAll({
            type,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            feedbacks,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Error fetching feedbacks:', error);
        res.status(500).json({ message: 'Server error fetching feedbacks' });
    }
};

exports.getPendingFeedbacks = async (req, res) => {
    try {
        // Reuse getAll but filter for pending
        // Since getAll was designed for approved, we might need to adjust it or write a simpler query here.
        // Let's write a targeted query for moderation to get everything.

        const [rows] = await db.execute(`
            SELECT 
                f.*, 
                u.full_name as author_name, 
                u.profile_picture as author_avatar,
                d.name as author_department
            FROM feedback_posts f
            LEFT JOIN users u ON f.user_id = u.id
            LEFT JOIN departments d ON u.department_id = d.id
            WHERE f.status = 'pending'
            ORDER BY f.created_at ASC
        `);

        // Attach images for canteen feedback
        for (let feedback of rows) {
            if (feedback.is_anonymous) {
                feedback.author_name = "Anonymous Student";
                feedback.author_avatar = null;
                feedback.author_department = null;
            }

            if (feedback.feedback_type === 'canteen') {
                const [images] = await db.execute(
                    'SELECT image_path FROM feedback_images WHERE feedback_id = ?',
                    [feedback.id]
                );
                feedback.images = images.map(img => img.image_path);
            } else {
                feedback.images = [];
            }
        }

        res.json(rows);
    } catch (error) {
        console.error('Error fetching pending feedbacks:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateFeedbackStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        await db.execute(
            'UPDATE feedback_posts SET status = ? WHERE id = ?',
            [status, id]
        );

        res.json({ message: `Feedback ${status} successfully` });
    } catch (error) {
        console.error('Error updating feedback status:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.respondToFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const { response } = req.body;
        const admin_id = req.user.id;

        if (!response) {
            return res.status(400).json({ message: 'Response content is required' });
        }

        // Check if response already exists (optional: prevent duplicate responses)
        // For simplicity, we'll allow multiple or just assume one for now.
        // Let's assume one-to-one for this iteration as per UI design implies single response.

        // Insert response
        await db.execute(
            'INSERT INTO admin_responses (feedback_id, admin_id, response) VALUES (?, ?, ?)',
            [id, admin_id, response]
        );

        res.status(201).json({ message: 'Response posted successfully' });
    } catch (error) {
        console.error('Error posting admin response:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
