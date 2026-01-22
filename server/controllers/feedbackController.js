const Feedback = require('../models/Feedback');

exports.createGeneralFeedback = async (req, res) => {
    try {
        const { title, content, is_anonymous } = req.body;
        const user_id = req.user.id; // From auth middleware

        console.log('[DEBUG] Feedback submission:', { user_id, title, content, is_anonymous });

        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required' });
        }

        await Feedback.create({
            user_id,
            feedback_type: 'general',
            title,
            content,
            is_anonymous: is_anonymous || false
        });

        res.status(201).json({ message: 'Feedback submitted successfully' });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: 'Server error' });
    }
};
