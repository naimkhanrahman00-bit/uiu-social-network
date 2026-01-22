const SectionExchangePost = require('../models/SectionExchangePost');

exports.createExchangeRequest = async (req, res) => {
    try {
        const { course_id, current_section, desired_section, note } = req.body;
        const user_id = req.user.id;

        if (!course_id || !current_section || !desired_section) {
            return res.status(400).json({ message: 'Please provide course, current section, and desired section.' });
        }

        const postId = await SectionExchangePost.create({
            user_id,
            course_id,
            current_section,
            desired_section,
            note
        });

        res.status(201).json({ message: 'Exchange request posted successfully', postId });
    } catch (error) {
        console.error('Error creating exchange request:', error);
        res.status(500).json({ message: 'Server error posting exchange request' });
    }
};

const SectionRequest = require('../models/SectionRequest');

exports.getExchangeRequests = async (req, res) => {
    try {
        const { courseId, search } = req.query;
        const posts = await SectionExchangePost.getAll({ course_id: courseId, search });
        res.json(posts);
    } catch (error) {
        console.error('Error fetching exchange requests:', error);
        res.status(500).json({ message: 'Server error fetching exchange requests' });
    }
};

exports.createNewSectionRequest = async (req, res) => {
    try {
        const { course_id, desired_section, reason } = req.body;
        const user_id = req.user.id;

        if (!course_id || !desired_section || !reason) {
            return res.status(400).json({ message: 'Please provide course, desired section, and reason.' });
        }

        const requestId = await SectionRequest.create({
            user_id,
            course_id,
            desired_section,
            reason
        });

        res.status(201).json({ message: 'New section request posted successfully', requestId });
    } catch (error) {
        console.error('Error posting new section request:', error);
        res.status(500).json({ message: 'Server error posting new section request' });
    }
};
