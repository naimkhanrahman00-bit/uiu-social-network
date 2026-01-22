const db = require('./config/db');

async function createTable() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS admin_responses (
                id INT PRIMARY KEY AUTO_INCREMENT,
                feedback_id INT NOT NULL,
                admin_id INT NOT NULL,
                response TEXT NOT NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (feedback_id) REFERENCES feedback_posts(id) ON DELETE CASCADE,
                FOREIGN KEY (admin_id) REFERENCES users(id)
            )
        `);
        console.log('admin_responses table created successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error creating table:', error);
        process.exit(1);
    }
}

createTable();
