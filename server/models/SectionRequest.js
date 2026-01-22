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
}

module.exports = SectionRequest;
