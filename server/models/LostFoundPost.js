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
            image_path,
            status,
            expires_at,
            collection_location
        } = postData;

        // Ensure undefined values are replaced with null
        const sql = `
            INSERT INTO lost_found_posts 
            (user_id, category_id, type, title, description, name_on_card, card_student_id, card_department, location, date_lost_found, image_path, status, expires_at, collection_location)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            status,
            expires_at,
            collection_location || null
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

        if (filters.type) {
            sql += ` AND p.type = ?`;
            params.push(filters.type);
        }

        if (filters.search) {
            sql += ` AND (p.title LIKE ? OR p.description LIKE ?)`;
            params.push(`%${filters.search}%`, `%${filters.search}%`);
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
}

module.exports = LostFoundPost;
