const db = require('../config/db');

class User {
    static async create({ full_name, email, password_hash, student_id, department_id, batch }) {
        const sql = `
      INSERT INTO users (full_name, email, password_hash, student_id, department_id, batch)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
        const [result] = await db.execute(sql, [full_name, email, password_hash, student_id, department_id, batch]);
        return result.insertId;
    }

    static async findByEmail(email) {
        const sql = `SELECT * FROM users WHERE email = ?`;
        const [rows] = await db.execute(sql, [email]);
        return rows[0];
    }

    static async findByStudentId(student_id) {
        const sql = `SELECT * FROM users WHERE student_id = ?`;
        const [rows] = await db.execute(sql, [student_id]);
        return rows[0];
    }

    static async findById(id) {
        const sql = `SELECT * FROM users WHERE id = ?`;
        const [rows] = await db.execute(sql, [id]);
        return rows[0];
    }

    static async update(id, { full_name, batch, contact_info, department_id, profile_picture }) {
        const sql = `
            UPDATE users 
            SET full_name = ?, batch = ?, contact_info = ?, department_id = ?, profile_picture = ?
            WHERE id = ?
        `;
        const [result] = await db.execute(sql, [full_name, batch, contact_info, department_id, profile_picture, id]);
        return result;
    }

    static async updatePassword(id, password_hash) {
        const sql = `UPDATE users SET password_hash = ? WHERE id = ?`;
        const [result] = await db.execute(sql, [password_hash, id]);
        return result;
    }

    // Get all users with search, filter, and pagination
    static async getAll({ search = '', role = '', status = '', limit = 20, offset = 0 }) {
        let sql = `
            SELECT u.id, u.email, u.student_id, u.full_name, u.role, u.is_suspended, u.is_verified, 
                   u.batch, u.contact_info, u.created_at, d.name as department_name
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            WHERE 1=1
        `;
        const params = [];

        // Search filter
        if (search) {
            sql += ` AND (u.full_name LIKE ? OR u.email LIKE ? OR u.student_id LIKE ?)`;
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam);
        }

        // Role filter
        if (role) {
            sql += ` AND u.role = ?`;
            params.push(role);
        }

        // Status filter (active/suspended)
        if (status === 'active') {
            sql += ` AND u.is_suspended = 0`;
        } else if (status === 'suspended') {
            sql += ` AND u.is_suspended = 1`;
        }

        // Get total count before pagination
        const countSql = `SELECT COUNT(*) as total FROM (${sql}) as filtered_users`;
        const [countResult] = await db.execute(countSql, params);
        const total = countResult[0].total;

        // Add pagination
        sql += ` ORDER BY u.created_at DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        const [rows] = await db.execute(sql, params);

        return {
            users: rows,
            total,
            limit: parseInt(limit),
            offset: parseInt(offset)
        };
    }

    // Update user role
    static async updateRole(userId, newRole) {
        const validRoles = ['admin', 'moderator', 'student'];
        if (!validRoles.includes(newRole)) {
            throw new Error('Invalid role');
        }

        const sql = `UPDATE users SET role = ? WHERE id = ?`;
        const [result] = await db.execute(sql, [newRole, userId]);
        return result;
    }

    // Toggle user suspension status
    static async toggleSuspension(userId) {
        const sql = `UPDATE users SET is_suspended = NOT is_suspended WHERE id = ?`;
        const [result] = await db.execute(sql, [userId]);

        // Get updated user to return new status
        const user = await this.findById(userId);
        return user;
    }

    // Get user activity statistics
    static async getUserActivity(userId) {
        // Count lost & found posts
        const [lfPosts] = await db.execute(
            'SELECT COUNT(*) as count FROM lost_found_posts WHERE user_id = ?',
            [userId]
        );

        // Count marketplace listings
        const [mpListings] = await db.execute(
            'SELECT COUNT(*) as count FROM marketplace_listings WHERE user_id = ?',
            [userId]
        );

        // Count feedback posts
        const [feedbackPosts] = await db.execute(
            'SELECT COUNT(*) as count FROM feedback_posts WHERE user_id = ?',
            [userId]
        );

        // Count resource downloads
        const [downloads] = await db.execute(
            'SELECT COUNT(*) as count FROM resource_downloads WHERE user_id = ?',
            [userId]
        );

        // Count section exchange posts
        const [sectionPosts] = await db.execute(
            'SELECT COUNT(*) as count FROM section_exchange_posts WHERE user_id = ?',
            [userId]
        );

        return {
            lostFoundPosts: lfPosts[0].count,
            marketplaceListings: mpListings[0].count,
            feedbackPosts: feedbackPosts[0].count,
            resourceDownloads: downloads[0].count,
            sectionExchangePosts: sectionPosts[0].count,
            totalPosts: lfPosts[0].count + mpListings[0].count + feedbackPosts[0].count + sectionPosts[0].count
        };
    }
}

module.exports = User;
