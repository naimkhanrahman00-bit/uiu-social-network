const db = require('./config/db');

async function setupMessagingDB() {
    try {
        console.log('Setting up Messaging tables...');

        // 1. Create conversations table
        await db.execute(`
      CREATE TABLE IF NOT EXISTS conversations (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user1_id INT NOT NULL,
          user2_id INT NOT NULL,
          last_message_at DATETIME,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE KEY unique_conversation (user1_id, user2_id)
      )
    `);
        console.log('Checked/Created conversations table');

        // Add indices for conversations if not exist (checking manually or just ignoring errors if exist)
        try {
            await db.execute(`CREATE INDEX idx_conversations_user1 ON conversations(user1_id)`);
        } catch (e) { /* ignore if exists */ }
        try {
            await db.execute(`CREATE INDEX idx_conversations_user2 ON conversations(user2_id)`);
        } catch (e) { /* ignore if exists */ }
        try {
            await db.execute(`CREATE INDEX idx_conversations_last_message ON conversations(last_message_at)`);
        } catch (e) { /* ignore if exists */ }


        // 2. Create messages table
        await db.execute(`
      CREATE TABLE IF NOT EXISTS messages (
          id INT PRIMARY KEY AUTO_INCREMENT,
          conversation_id INT NOT NULL,
          sender_id INT NOT NULL,
          content TEXT NOT NULL,
          is_read BOOLEAN NOT NULL DEFAULT FALSE,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
          FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
        console.log('Checked/Created messages table');

        // Add indices for messages
        try {
            await db.execute(`CREATE INDEX idx_messages_conversation ON messages(conversation_id)`);
        } catch (e) { /* ignore if exists */ }
        try {
            await db.execute(`CREATE INDEX idx_messages_sender ON messages(sender_id)`);
        } catch (e) { /* ignore if exists */ }
        try {
            await db.execute(`CREATE INDEX idx_messages_created ON messages(created_at)`);
        } catch (e) { /* ignore if exists */ }
        try {
            await db.execute(`CREATE INDEX idx_messages_unread ON messages(is_read)`);
        } catch (e) { /* ignore if exists */ }

        console.log('Messaging tables setup completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error setting up messaging tables:', error);
        process.exit(1);
    }
}

setupMessagingDB();
