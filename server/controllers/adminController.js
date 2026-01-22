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

/**
 * @desc    Get all content across modules with filtering and search
 * @route   GET /api/admin/content
 * @access  Private/Admin
 */
const getAllContent = async (req, res) => {
    try {
        const {
            type = 'all',
            status = 'all',
            search = '',
            sortBy = 'newest',
            limit = 20,
            offset = 0
        } = req.query;

        const contentTypes = [];

        // Build queries based on content type filter
        if (type === 'all' || type === 'lost_found') {
            const lfQuery = `
                SELECT 
                    lf.id,
                    'lost_found' as content_type,
                    lf.title,
                    lf.description as content,
                    u.full_name as author_name,
                    u.id as author_id,
                    lf.status,
                    lf.type as subtype,
                    lf.created_at
                FROM lost_found_posts lf
                JOIN users u ON lf.user_id = u.id
                WHERE (? = 'all' OR lf.status = ?)
                ${search ? "AND (lf.title LIKE ? OR lf.description LIKE ?)" : ""}
            `;
            const params = [status, status];
            if (search) {
                params.push(`%${search}%`, `%${search}%`);
            }
            const [lfResults] = await db.execute(lfQuery, params);
            contentTypes.push(...lfResults);
        }

        if (type === 'all' || type === 'marketplace') {
            const mpQuery = `
                SELECT 
                    m.id,
                    'marketplace' as content_type,
                    m.title,
                    m.description as content,
                    u.full_name as author_name,
                    u.id as author_id,
                    m.status,
                    m.listing_type as subtype,
                    m.created_at
                FROM marketplace_listings m
                JOIN users u ON m.user_id = u.id
                WHERE (? = 'all' OR m.status = ?)
                ${search ? "AND (m.title LIKE ? OR m.description LIKE ?)" : ""}
            `;
            const params = [status, status];
            if (search) {
                params.push(`%${search}%`, `%${search}%`);
            }
            const [mpResults] = await db.execute(mpQuery, params);
            contentTypes.push(...mpResults);
        }

        if (type === 'all' || type === 'feedback') {
            const fbQuery = `
                SELECT 
                    f.id,
                    'feedback' as content_type,
                    f.title,
                    f.content,
                    CASE WHEN f.is_anonymous = 1 THEN 'Anonymous' ELSE u.full_name END as author_name,
                    u.id as author_id,
                    f.status,
                    f.feedback_type as subtype,
                    f.created_at
                FROM feedback_posts f
                JOIN users u ON f.user_id = u.id
                WHERE (? = 'all' OR f.status = ?)
                ${search ? "AND (f.title LIKE ? OR f.content LIKE ?)" : ""}
            `;
            const params = [status, status];
            if (search) {
                params.push(`%${search}%`, `%${search}%`);
            }
            const [fbResults] = await db.execute(fbQuery, params);
            contentTypes.push(...fbResults);
        }

        if (type === 'all' || type === 'section_exchange') {
            const seQuery = `
                SELECT 
                    se.id,
                    'section_exchange' as content_type,
                    CONCAT('Section Exchange: ', c.code, ' (', se.current_section, ' → ', se.desired_section, ')') as title,
                    se.note as content,
                    u.full_name as author_name,
                    u.id as author_id,
                    se.status,
                    'exchange' as subtype,
                    se.created_at
                FROM section_exchange_posts se
                JOIN users u ON se.user_id = u.id
                JOIN courses c ON se.course_id = c.id
                WHERE (? = 'all' OR se.status = ?)
                ${search ? "AND (c.code LIKE ? OR se.note LIKE ?)" : ""}
            `;
            const params = [status, status];
            if (search) {
                params.push(`%${search}%`, `%${search}%`);
            }
            const [seResults] = await db.execute(seQuery, params);
            contentTypes.push(...seResults);
        }

        if (type === 'all' || type === 'section_request') {
            const srQuery = `
                SELECT 
                    sr.id,
                    'section_request' as content_type,
                    CONCAT('New Section Request: ', c.code, ' - ', sr.desired_section) as title,
                    sr.reason as content,
                    u.full_name as author_name,
                    u.id as author_id,
                    sr.status,
                    'new_section' as subtype,
                    sr.created_at
                FROM section_requests sr
                JOIN users u ON sr.user_id = u.id
                JOIN courses c ON sr.course_id = c.id
                WHERE (? = 'all' OR sr.status = ?)
                ${search ? "AND (c.code LIKE ? OR sr.reason LIKE ?)" : ""}
            `;
            const params = [status, status];
            if (search) {
                params.push(`%${search}%`, `%${search}%`);
            }
            const [srResults] = await db.execute(srQuery, params);
            contentTypes.push(...srResults);
        }

        // Sort all content by date
        contentTypes.sort((a, b) => {
            if (sortBy === 'newest') {
                return new Date(b.created_at) - new Date(a.created_at);
            } else {
                return new Date(a.created_at) - new Date(b.created_at);
            }
        });

        // Apply pagination
        const total = contentTypes.length;
        const limitNum = parseInt(limit);
        const offsetNum = parseInt(offset);
        const paginatedContent = contentTypes.slice(offsetNum, offsetNum + limitNum);

        res.json({
            success: true,
            data: {
                content: paginatedContent,
                total,
                limit: limitNum,
                offset: offsetNum
            }
        });

    } catch (error) {
        console.error('Error fetching content:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching content',
            error: error.message
        });
    }
};

/**
 * @desc    Delete content by type and ID
 * @route   DELETE /api/admin/content/:type/:id
 * @access  Private/Admin
 */
const deleteContent = async (req, res) => {
    try {
        const { type, id } = req.params;
        const adminId = req.user.id;

        // Validate content type
        const validTypes = ['lost_found', 'marketplace', 'feedback', 'section_exchange', 'section_request'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid content type'
            });
        }

        let query;
        let deletionType;

        // Perform soft delete for marketplace and lost_found
        if (type === 'marketplace') {
            query = "UPDATE marketplace_listings SET status = 'deleted' WHERE id = ?";
            deletionType = 'soft';
        } else if (type === 'lost_found') {
            query = "UPDATE lost_found_posts SET status = 'deleted' WHERE id = ?";
            deletionType = 'soft';
        }
        // Perform hard delete for feedback and section posts
        else if (type === 'feedback') {
            query = "DELETE FROM feedback_posts WHERE id = ?";
            deletionType = 'hard';
        } else if (type === 'section_exchange') {
            query = "DELETE FROM section_exchange_posts WHERE id = ?";
            deletionType = 'hard';
        } else if (type === 'section_request') {
            query = "DELETE FROM section_requests WHERE id = ?";
            deletionType = 'hard';
        }

        const [result] = await db.execute(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Content not found'
            });
        }

        // Log deletion action
        console.log(`[AUDIT] Admin ${adminId} ${deletionType}-deleted ${type} content #${id} at ${new Date().toISOString()}`);

        res.json({
            success: true,
            message: `Content deleted successfully (${deletionType} delete)`,
            data: {
                type,
                id,
                deletionType
            }
        });

    } catch (error) {
        console.error('Error deleting content:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting content',
            error: error.message
        });
    }
};

module.exports = {
    getDashboardStats,
    getUsers,
    updateUserRole,
    suspendUser,
    getUserActivity,
    getAllContent,
    deleteContent,

    /**
     * @desc    Get analytics data for charts
     * @route   GET /api/admin/analytics
     * @access  Private/Admin
     */
    getAnalytics: async (req, res) => {
        try {
            // 1. User Registrations (Last 30 Days)
            // Group by date to show growth trend
            const [userGrowth] = await db.execute(`
                SELECT DATE(created_at) as date, COUNT(*) as count 
                FROM users 
                WHERE created_at >= DATE(NOW()) - INTERVAL 30 DAY 
                GROUP BY DATE(created_at) 
                ORDER BY DATE(created_at) ASC
            `);

            // 2. Marketplace Listings by Category
            const [listingsByCategory] = await db.execute(`
                SELECT c.name, COUNT(l.id) as count 
                FROM marketplace_listings l
                JOIN marketplace_categories c ON l.category_id = c.id
                WHERE l.status = 'active'
                GROUP BY c.name
            `);

            // 3. Lost vs Found Posts Ratio
            const [lostFoundRatio] = await db.execute(`
                SELECT type, COUNT(*) as count 
                FROM lost_found_posts 
                WHERE status IN ('lost', 'found')
                GROUP BY type
            `);

            // 4. Top 5 Downloaded Resources
            const [topResources] = await db.execute(`
                SELECT title, download_count 
                FROM resources 
                ORDER BY download_count DESC 
                LIMIT 5
            `);

            res.json({
                success: true,
                data: {
                    userGrowth,
                    listingsByCategory,
                    lostFoundRatio,
                    topResources
                }
            });

        } catch (error) {
            console.error('Error fetching analytics:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching analytics data',
                error: error.message
            });
        }
    }
};
