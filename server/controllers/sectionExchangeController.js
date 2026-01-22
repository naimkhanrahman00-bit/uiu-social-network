const SectionExchangePost = require('../models/SectionExchangePost');
const SectionRequest = require('../models/SectionRequest');
const Notification = require('../models/Notification');
const db = require('../config/db'); // Needed for user lookups

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

exports.getExchangeRequests = async (req, res) => {
    try {
        const { courseId, search } = req.query;
        // Default to showing only approved posts for normal feed
        const posts = await SectionExchangePost.getAll({ course_id: courseId, search, status: 'approved' });
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

exports.getSectionRequests = async (req, res) => {
    try {
        const { courseId, search } = req.query;
        const userId = req.user.id;
        const requests = await SectionRequest.getAll({ course_id: courseId, search, user_id: userId, status: 'approved' });
        res.json(requests);
    } catch (error) {
        console.error('Error fetching section requests:', error);
        res.status(500).json({ message: 'Server error fetching section requests' });
    }
};

exports.toggleSupport = async (req, res) => {
    try {
        const requestId = req.params.id;
        const userId = req.user.id;

        const action = await SectionRequest.toggleSupport(requestId, userId);
        res.json({ message: `Support ${action} successfully`, action });
    } catch (error) {
        console.error('Error toggling support:', error);
        res.status(500).json({ message: 'Server error toggling support' });
    }
};

exports.getPendingPosts = async (req, res) => {
    try {
        const exchangePosts = await SectionExchangePost.getAll({ status: 'pending' });
        const sectionRequests = await SectionRequest.getAll({ status: 'pending', user_id: req.user.id });

        res.json({
            exchangePosts,
            sectionRequests
        });
    } catch (error) {
        console.error('Error fetching pending posts:', error);
        res.status(500).json({ message: 'Server error fetching pending posts' });
    }
};

exports.updatePostStatus = async (req, res) => {
    try {
        const { type, id } = req.params;
        const { status } = req.body; // 'approved' or 'rejected'
        const approved_by = req.user.id;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        if (type === 'exchange') {
            await SectionExchangePost.updateStatus(id, status, approved_by);

            // Notify User
            if (status !== 'pending') {
                const [rows] = await db.execute('SELECT user_id, current_section, desired_section FROM section_exchange_posts WHERE id = ?', [id]);
                if (rows.length > 0) {
                    const post = rows[0];
                    await Notification.create({
                        userId: post.user_id,
                        type: status === 'approved' ? 'post_approved' : 'post_rejected',
                        title: `Section Exchange ${status === 'approved' ? 'Approved' : 'Rejected'}`,
                        message: `Your exchange request (Sec ${post.current_section} -> ${post.desired_section}) has been ${status}.`,
                        link: '/section-issue/exchange'
                    });
                }
            }

        } else if (type === 'new-section') {
            await SectionRequest.updateStatus(id, status, approved_by);

            // Notify User
            if (status !== 'pending') {
                const [rows] = await db.execute('SELECT user_id, desired_section FROM section_requests WHERE id = ?', [id]);
                if (rows.length > 0) {
                    const reqPost = rows[0];
                    await Notification.create({
                        userId: reqPost.user_id,
                        type: status === 'approved' ? 'post_approved' : 'post_rejected',
                        title: `Section Request ${status === 'approved' ? 'Approved' : 'Rejected'}`,
                        message: `Your request for new section ${reqPost.desired_section} has been ${status}.`,
                        link: '/section-issue/new-section'
                    });
                }
            }

        } else {
            return res.status(400).json({ message: 'Invalid type' });
        }

        res.json({ message: `Post ${status} successfully` });
    } catch (error) {
        console.error('Error updating post status:', error);
        res.status(500).json({ message: 'Server error updating post status' });
    }
};
