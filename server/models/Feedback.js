const db = require('../config/db');

class Feedback {
    static async create({ user_id, feedback_type, title, content, is_anonymous }) {
        const [result] = await db.execute(
            'INSERT INTO feedback_posts (user_id, feedback_type, title, content, is_anonymous, status) VALUES (?, ?, ?, ?, ?, ?)',
            [user_id, feedback_type, title, content, is_anonymous, 'pending']
        );
        return result.insertId;
    }
}

module.exports = Feedback;
