const db = require('../config/db');

class Notification {
    static async create({ userId, type, title, message, link }) {
        const sql = `
            INSERT INTO notifications (user_id, type, title, message, link)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(sql, [userId, type, title, message, link || null]);
        return result.insertId;
    }

    static async getByUser(userId) {
        const sql = `
            SELECT * FROM notifications 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        `;
        const [rows] = await db.execute(sql, [userId]);
        return rows;
    }

    static async markAsRead(id, userId) {
        const sql = `
            UPDATE notifications 
            SET is_read = 1 
            WHERE id = ? AND user_id = ?
        `;
        await db.execute(sql, [id, userId]);
    }

    static async markAllAsRead(userId) {
        const sql = `
            UPDATE notifications 
            SET is_read = 1 
            WHERE user_id = ?
        `;
        await db.execute(sql, [userId]);
    }
}

module.exports = Notification;
