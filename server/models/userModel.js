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
}

module.exports = User;
