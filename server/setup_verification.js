const db = require('./config/db');
const bcrypt = require('bcrypt');
const Message = require('./models/Message');

async function setupVerification() {
    try {
        const email = 'recipient_verify@cse.uiu.ac.bd';
        const password = 'password123';

        // 1. Create Recipient User
        let recipientId;
        const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);

        if (existing.length > 0) {
            recipientId = existing[0].id;
            console.log('Recipient exists, ID:', recipientId);
            // Reset password just in case
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            await db.execute('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, recipientId]);
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const [result] = await db.execute(
                'INSERT INTO users (full_name, email, password_hash, student_id, department_id, batch, role, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                ['Recipient Verify', email, hashedPassword, '88888888', 1, '233', 'student', 1]
            );
            recipientId = result.insertId;
            console.log('Created Recipient, ID:', recipientId);
        }

        // 2. Get Sender (Msg Test Script)
        const [senders] = await db.execute('SELECT id FROM users WHERE email = ?', ['msgtest_script@cse.uiu.ac.bd']);
        if (senders.length === 0) {
            console.error('Sender not found. Run create_test_user.js first.');
            process.exit(1);
        }
        const senderId = senders[0].id;

        // 3. Create Conversation and Message
        console.log(`Creating conversation between ${senderId} and ${recipientId}`);
        const conversationId = await Message.createConversation(senderId, recipientId);
        await Message.addMessage(conversationId, senderId, 'Hello from script verification');

        console.log('Setup complete. Log in as:', email);
        process.exit(0);

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

setupVerification();
