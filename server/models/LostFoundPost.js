const db = require('../config/db');

class LostFoundPost {
    static async create(postData) {
        const {
            user_id,
            category_id,
            type,
            title,
            description,
            name_on_card,
            card_student_id,
            card_department,
            location,
            date_lost_found,
            image_path
        } = postData;

        // Default 'lost' or 'found' status based on type
        const initialStatus = type === 'found' ? 'found' : 'lost';

        const sql = `
            INSERT INTO lost_found_posts 
            (user_id, category_id, type, title, description, name_on_card, card_student_id, card_department, location, date_lost_found, image_path, status, expires_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))
        `;

        const [result] = await db.execute(sql, [
            user_id,
            category_id,
            type,
            title,
            description || null,
            name_on_card || null,
            card_student_id || null,
            card_department || null,
            location,
            date_lost_found,
            image_path || null,
            initialStatus
        ]);

        return result.insertId;
    }

    static async getCategories() {
        const sql = `SELECT * FROM lost_found_categories`;
        const [rows] = await db.execute(sql);
        return rows;
    }

    static async getAll(filters = {}) {
        let sql = `
            SELECT p.*, u.full_name, c.name as category_name 
            FROM lost_found_posts p
            JOIN users u ON p.user_id = u.id
            JOIN lost_found_categories c ON p.category_id = c.id
            WHERE 1=1
        `;
        const params = [];

        // Filter expired posts by default, unless included
        if (!filters.include_expired) {
            sql += ` AND p.expires_at > NOW()`;
        }

        if (filters.type) {
            sql += ` AND p.type = ?`;
            params.push(filters.type);
        }

        if (filters.search) {
            sql += ` AND (p.title LIKE ? OR p.description LIKE ?)`;
            params.push(`%${filters.search}%`, `%${filters.search}%`);
        }

        if (filters.user_id) {
            sql += ` AND p.user_id = ?`;
            params.push(filters.user_id);
        }

        sql += ` ORDER BY p.created_at DESC`;

        const [rows] = await db.execute(sql, params);
        return rows;
    }

    static async getById(id) {
        const sql = `
            SELECT p.*, u.full_name, u.email, u.contact_info, c.name as category_name 
            FROM lost_found_posts p
            JOIN users u ON p.user_id = u.id
            JOIN lost_found_categories c ON p.category_id = c.id
            WHERE p.id = ?
        `;
        const [rows] = await db.execute(sql, [id]);
        return rows[0];
    }

    static async delete(id) {
        const sql = `DELETE FROM lost_found_posts WHERE id = ?`;
        const [result] = await db.execute(sql, [id]);
        return result.affectedRows > 0;
    }

    static async updateStatus(id, status) {
        const sql = `UPDATE lost_found_posts SET status = ? WHERE id = ?`;
        const [result] = await db.execute(sql, [status, id]);
        return result.affectedRows > 0;
    }

    static async update(id, postData) {
        const {
            category_id,
            title,
            description,
            name_on_card,
            card_student_id,
            card_department,
            location,
            date_lost_found,
            image_path // Optional, only if updated
        } = postData;

        let sql = `
            UPDATE lost_found_posts SET
                category_id = ?,
                title = ?,
                description = ?,
                name_on_card = ?,
                card_student_id = ?,
                card_department = ?,
                location = ?,
                date_lost_found = ?
        `;
        const params = [
            category_id,
            title,
            description || null,
            name_on_card || null,
            card_student_id || null,
            card_department || null,
            location,
            date_lost_found
        ];

        if (image_path) {
            sql += `, image_path = ?`;
            params.push(image_path);
        }

        sql += ` WHERE id = ?`;
        params.push(id);

        const [result] = await db.execute(sql, params);
        return result.affectedRows > 0;
    }

    static async renew(id) {
        const sql = `UPDATE lost_found_posts SET expires_at = DATE_ADD(NOW(), INTERVAL 30 DAY) WHERE id = ?`;
        const [result] = await db.execute(sql, [id]);
        return result.affectedRows > 0;
    }
}

module.exports = LostFoundPost;
