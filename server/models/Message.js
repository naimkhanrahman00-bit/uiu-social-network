const db = require('../config/db');

class Message {
    static async findConversation(user1Id, user2Id) {
        // Ensure consistent ordering for lookup if strict ordering is not enforced by caller, 
        // though `unique_conversation` relies on specific pair. 
        // We will query both directions OR enforce order. 
        // Let's enforce order in logic: min(u1, u2), max(u1, u2)
        const u1 = Math.min(user1Id, user2Id);
        const u2 = Math.max(user1Id, user2Id);

        const [rows] = await db.execute(
            'SELECT * FROM conversations WHERE user1_id = ? AND user2_id = ?',
            [u1, u2]
        );
        return rows[0];
    }

    static async createConversation(user1Id, user2Id) {
        const u1 = Math.min(user1Id, user2Id);
        const u2 = Math.max(user1Id, user2Id);

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Check if exists again inside transaction or rely on unique key
            // Insert ignore or standard insert
            const [result] = await connection.execute(
                'INSERT IGNORE INTO conversations (user1_id, user2_id, last_message_at) VALUES (?, ?, NOW())',
                [u1, u2]
            );

            let conversationId = result.insertId;

            if (result.affectedRows === 0) {
                // Already exists
                const [existing] = await connection.execute(
                    'SELECT id FROM conversations WHERE user1_id = ? AND user2_id = ?',
                    [u1, u2]
                );
                conversationId = existing[0].id;
            }

            await connection.commit();
            return conversationId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async addMessage(conversationId, senderId, content) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const [result] = await connection.execute(
                'INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)',
                [conversationId, senderId, content]
            );

            // Update conversation last_message_at
            await connection.execute(
                'UPDATE conversations SET last_message_at = NOW() WHERE id = ?',
                [conversationId]
            );

            await connection.commit();
            return result.insertId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
    static async getConversations(userId) {
        const sql = `
            SELECT 
                c.id, 
                c.last_message_at,
                u.id AS other_user_id,
                u.full_name AS other_user_name,
                u.email AS other_user_email,
                (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message,
                (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != ? AND is_read = 0) AS unread_count
            FROM conversations c
            JOIN users u ON (c.user1_id = u.id OR c.user2_id = u.id)
            WHERE (c.user1_id = ? OR c.user2_id = ?) AND u.id != ?
            ORDER BY c.last_message_at DESC
        `;

        const [rows] = await db.execute(sql, [userId, userId, userId, userId]);
        return rows;
    }
}

module.exports = Message;
