const db = require('../config/db');

class Token {
    static async create({ user_id, token, type, expires_at }) {
        const sql = `
            INSERT INTO verification_tokens (user_id, token, type, expires_at)
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await db.execute(sql, [user_id, token, type, expires_at]);
        return result.insertId;
    }

    static async findByToken(token) {
        const sql = `SELECT * FROM verification_tokens WHERE token = ?`;
        const [rows] = await db.execute(sql, [token]);
        return rows[0];
    }

    static async deleteByToken(token) {
        const sql = `DELETE FROM verification_tokens WHERE token = ?`;
        const [result] = await db.execute(sql, [token]);
        return result;
    }

    // Optional: Clean up old tokens for a user
    static async deleteByUserIdAndType(user_id, type) {
        const sql = `DELETE FROM verification_tokens WHERE user_id = ? AND type = ?`;
        const [result] = await db.execute(sql, [user_id, type]);
        return result;
    }
}

module.exports = Token;
