const db = require('../config/db');

/**
 * @desc    Get admin dashboard statistics
 * @route   GET /api/admin/dashboard
 * @access  Private/Admin
 */
const getDashboardStats = async (req, res) => {
    try {
        // Get total users count
        const [usersResult] = await db.execute('SELECT COUNT(*) as count FROM users');
        const totalUsers = usersResult[0].count;

        // Get total posts count (aggregate from multiple tables)
        const [lostFoundResult] = await db.execute('SELECT COUNT(*) as count FROM lost_found_posts');
        const [marketplaceResult] = await db.execute('SELECT COUNT(*) as count FROM marketplace_listings');
        const [feedbackResult] = await db.execute('SELECT COUNT(*) as count FROM feedback_posts');
        const [sectionExchangeResult] = await db.execute('SELECT COUNT(*) as count FROM section_exchange_posts');
        const [sectionRequestsResult] = await db.execute('SELECT COUNT(*) as count FROM section_requests');

        const totalPosts = lostFoundResult[0].count +
            marketplaceResult[0].count +
            feedbackResult[0].count +
            sectionExchangeResult[0].count +
            sectionRequestsResult[0].count;

        // Get total downloads count
        const [downloadsResult] = await db.execute('SELECT COUNT(*) as count FROM resource_downloads');
        const totalDownloads = downloadsResult[0].count;

        // Get pending approvals counts
        const [pendingFeedbackResult] = await db.execute(
            "SELECT COUNT(*) as count FROM feedback_posts WHERE status = 'pending'"
        );
        const [pendingSectionExchangeResult] = await db.execute(
            "SELECT COUNT(*) as count FROM section_exchange_posts WHERE status = 'pending'"
        );
        const [pendingSectionRequestsResult] = await db.execute(
            "SELECT COUNT(*) as count FROM section_requests WHERE status = 'pending'"
        );

        const pendingApprovals = {
            feedback: pendingFeedbackResult[0].count,
            sectionExchange: pendingSectionExchangeResult[0].count,
            sectionRequests: pendingSectionRequestsResult[0].count,
            total: pendingFeedbackResult[0].count +
                pendingSectionExchangeResult[0].count +
                pendingSectionRequestsResult[0].count
        };

        // Get recent activity (last 10 items across different modules)
        const recentActivity = [];

        // Recent users
        const [recentUsers] = await db.execute(
            'SELECT id, full_name, email, created_at FROM users ORDER BY created_at DESC LIMIT 3'
        );
        recentUsers.forEach(user => {
            recentActivity.push({
                type: 'user_registered',
                description: `New user registered: ${user.full_name}`,
                timestamp: user.created_at,
                link: null
            });
        });

        // Recent posts (Lost & Found)
        const [recentLF] = await db.execute(
            `SELECT lf.id, lf.title, lf.type, lf.created_at, u.full_name 
             FROM lost_found_posts lf 
             JOIN users u ON lf.user_id = u.id 
             ORDER BY lf.created_at DESC LIMIT 3`
        );
        recentLF.forEach(post => {
            recentActivity.push({
                type: 'lost_found_post',
                description: `${post.full_name} posted a ${post.type} item: ${post.title}`,
                timestamp: post.created_at,
                link: `/lost-found/${post.id}`
            });
        });

        // Recent marketplace listings
        const [recentMarketplace] = await db.execute(
            `SELECT m.id, m.title, m.created_at, u.full_name 
             FROM marketplace_listings m 
             JOIN users u ON m.user_id = u.id 
             ORDER BY m.created_at DESC LIMIT 2`
        );
        recentMarketplace.forEach(listing => {
            recentActivity.push({
                type: 'marketplace_listing',
                description: `${listing.full_name} listed: ${listing.title}`,
                timestamp: listing.created_at,
                link: `/marketplace/${listing.id}`
            });
        });

        // Recent feedback
        const [recentFeedback] = await db.execute(
            `SELECT f.id, f.title, f.feedback_type, f.created_at, u.full_name, f.is_anonymous 
             FROM feedback_posts f 
             JOIN users u ON f.user_id = u.id 
             WHERE f.status = 'approved'
             ORDER BY f.created_at DESC LIMIT 2`
        );
        recentFeedback.forEach(feedback => {
            const author = feedback.is_anonymous ? 'Anonymous' : feedback.full_name;
            recentActivity.push({
                type: 'feedback_post',
                description: `${author} posted ${feedback.feedback_type} feedback: ${feedback.title}`,
                timestamp: feedback.created_at,
                link: `/feedback`
            });
        });

        // Sort all activities by timestamp and take top 10
        recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const topRecentActivity = recentActivity.slice(0, 10);

        res.json({
            success: true,
            data: {
                totalUsers,
                totalPosts,
                totalDownloads,
                pendingApprovals,
                recentActivity: topRecentActivity
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics',
            error: error.message
        });
    }
};

/**
 * @desc    Get all users with search, filter, and pagination
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
const getUsers = async (req, res) => {
    try {
        const { search, role, status, limit = 20, offset = 0 } = req.query;

        const User = require('../models/userModel');
        const result = await User.getAll({ search, role, status, limit, offset });

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
};

/**
 * @desc    Update user role
 * @route   PATCH /api/admin/users/:id/role
 * @access  Private/Admin
 */
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!role) {
            return res.status(400).json({
                success: false,
                message: 'Role is required'
            });
        }

        const User = require('../models/userModel');

        // Prevent admin from demoting themselves
        if (parseInt(id) === req.user.id && role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'You cannot change your own role'
            });
        }

        await User.updateRole(id, role);
        const updatedUser = await User.findById(id);

        res.json({
            success: true,
            message: `User role updated to ${role}`,
            data: updatedUser
        });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error updating user role'
        });
    }
};

/**
 * @desc    Suspend or unsuspend a user
 * @route   PATCH /api/admin/users/:id/suspend
 * @access  Private/Admin
 */
const suspendUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent admin from suspending themselves
        if (parseInt(id) === req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You cannot suspend yourself'
            });
        }

        const User = require('../models/userModel');
        const updatedUser = await User.toggleSuspension(id);

        const action = updatedUser.is_suspended ? 'suspended' : 'unsuspended';

        res.json({
            success: true,
            message: `User ${action} successfully`,
            data: updatedUser
        });
    } catch (error) {
        console.error('Error toggling user suspension:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user suspension status',
            error: error.message
        });
    }
};

/**
 * @desc    Get user activity statistics
 * @route   GET /api/admin/users/:id/activity
 * @access  Private/Admin
 */
const getUserActivity = async (req, res) => {
    try {
        const { id } = req.params;

        const User = require('../models/userModel');
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const activity = await User.getUserActivity(id);

        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    full_name: user.full_name,
                    email: user.email
                },
                activity
            }
        });
    } catch (error) {
        console.error('Error fetching user activity:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user activity',
            error: error.message
        });
    }
};

module.exports = {
    getDashboardStats,
    getUsers,
    updateUserRole,
    suspendUser,
    getUserActivity
};
