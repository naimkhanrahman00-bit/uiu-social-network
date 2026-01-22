const db = require('../config/db');

class SectionRequest {
    static async create({ user_id, course_id, desired_section, reason }) {
        const sql = `
            INSERT INTO section_requests 
            (user_id, course_id, desired_section, reason) 
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await db.execute(sql, [user_id, course_id, desired_section, reason]);
        return result.insertId;
    }
    static async getAll({ course_id, search, user_id }) {
        let sql = `
            SELECT 
                sr.*,
                c.code as course_code,
                c.name as course_name,
                u.full_name as user_name,
                EXISTS(SELECT 1 FROM section_request_supports srs WHERE srs.request_id = sr.id AND srs.user_id = ?) as is_supported
            FROM section_requests sr
            JOIN courses c ON sr.course_id = c.id
            JOIN users u ON sr.user_id = u.id
            WHERE 1=1
        `;
        const params = [user_id];

        if (course_id) {
            sql += ` AND sr.course_id = ?`;
            params.push(course_id);
        }

        if (search) {
            sql += ` AND (c.code LIKE ? OR c.name LIKE ? OR sr.desired_section LIKE ?)`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (status) {
            sql += ` AND sr.status = ?`;
            params.push(status);
        }

        sql += ` ORDER BY sr.support_count DESC, sr.created_at DESC`;

        const [rows] = await db.query(sql, params);
        return rows;
    }

    static async toggleSupport(requestId, userId) {
        // Check if already supported
        const checkSql = `SELECT id FROM section_request_supports WHERE request_id = ? AND user_id = ?`;
        const [existing] = await db.query(checkSql, [requestId, userId]);

        if (existing.length > 0) {
            // Withdraw support
            await db.query(`DELETE FROM section_request_supports WHERE request_id = ? AND user_id = ?`, [requestId, userId]);
            await db.query(`UPDATE section_requests SET support_count = support_count - 1 WHERE id = ?`, [requestId]);
            return 'withdrawn';
        } else {
            // Add support
            await db.query(`INSERT INTO section_request_supports (request_id, user_id) VALUES (?, ?)`, [requestId, userId]);
            await db.query(`UPDATE section_requests SET support_count = support_count + 1 WHERE id = ?`, [requestId]);
            return 'supported';
        }
    }

    static async updateStatus(id, status, approved_by) {
        const sql = `UPDATE section_requests SET status = ?, approved_by = ? WHERE id = ?`;
        await db.execute(sql, [status, approved_by, id]);
    }
}

module.exports = SectionRequest;
