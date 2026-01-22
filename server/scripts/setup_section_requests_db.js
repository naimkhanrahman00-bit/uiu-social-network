const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

async function createTable() {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection(dbConfig);

        console.log('Creating section_requests table...');
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS section_requests (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                course_id INT NOT NULL,
                desired_section VARCHAR(10) NOT NULL,
                reason TEXT,
                support_count INT DEFAULT 0,
                status ENUM('pending', 'approved', 'rejected', 'completed') NOT NULL DEFAULT 'pending',
                approved_by INT,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (course_id) REFERENCES courses(id),
                FOREIGN KEY (approved_by) REFERENCES users(id)
            );
        `;
        await connection.query(createTableQuery);
        console.log('Table section_requests created successfully.');

    } catch (error) {
        console.error('Error creating table:', error);
    } finally {
        if (connection) await connection.end();
    }
}

createTable();
