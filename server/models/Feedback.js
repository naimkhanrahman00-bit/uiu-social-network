const db = require('../config/db');

class Feedback {
    static async create({ user_id, feedback_type, title, content, is_anonymous, image_paths = [] }) {
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const [result] = await connection.execute(
                'INSERT INTO feedback_posts (user_id, feedback_type, title, content, is_anonymous, status) VALUES (?, ?, ?, ?, ?, ?)',
                [user_id, feedback_type, title, content, is_anonymous, 'pending']
            );

            const feedbackId = result.insertId;

            // Insert images if any (for canteen feedback)
            if (image_paths && image_paths.length > 0) {
                const imageSql = `INSERT INTO feedback_images (feedback_id, image_path) VALUES (?, ?)`;
                for (const imagePath of image_paths) {
                    await connection.execute(imageSql, [feedbackId, imagePath]);
                }
            }

            await connection.commit();
            return feedbackId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
    static async getAll(filters = {}) {
        let query = `
            SELECT 
                f.*, 
                u.full_name as author_name, 
                u.profile_picture as author_avatar,
                d.name as author_department,
                ar.response as admin_response,
                ar.created_at as admin_response_at,
                au.full_name as admin_responder_name
            FROM feedback_posts f
            LEFT JOIN users u ON f.user_id = u.id
            LEFT JOIN departments d ON u.department_id = d.id
            LEFT JOIN admin_responses ar ON f.id = ar.feedback_id
            LEFT JOIN users au ON ar.admin_id = au.id
            WHERE f.status = 'approved'
        `;

        const params = [];

        if (filters.type) {
            query += ` AND f.feedback_type = ?`;
            params.push(filters.type);
        }

        query += ` ORDER BY f.created_at DESC`;

        // Pagination
        if (filters.limit && filters.offset !== undefined) {
            query += ` LIMIT ${parseInt(filters.limit)} OFFSET ${parseInt(filters.offset)}`;
        }

        const [rows] = await db.execute(query, params);

        // Fetch images for canteen feedbacks
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

        // Count for pagination
        let countQuery = `SELECT COUNT(*) as total FROM feedback_posts f WHERE f.status = 'approved'`;
        const countParams = [];

        if (filters.type) {
            countQuery += ` AND f.feedback_type = ?`;
            countParams.push(filters.type);
        }

        const [countResult] = await db.execute(countQuery, countParams);

        return { feedbacks: rows, total: countResult[0].total };
    }
}

module.exports = Feedback;
