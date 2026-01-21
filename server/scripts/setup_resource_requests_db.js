const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'uiu_social_network',
};

async function setupResourceRequestsDB() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        // Create resource_requests table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS resource_requests (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                course_id INT NOT NULL,
                resource_name VARCHAR(200) NOT NULL,
                description TEXT,
                status ENUM('pending', 'approved', 'rejected', 'uploaded') NOT NULL DEFAULT 'pending',
                admin_note TEXT,
                fulfilled_resource_id INT,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (course_id) REFERENCES courses(id),
                FOREIGN KEY (fulfilled_resource_id) REFERENCES resources(id)
            )
        `);
        console.log('resource_requests table checked/created.');

    } catch (error) {
        console.error('Error setting up database:', error);
    } finally {
        if (connection) await connection.end();
    }
}

setupResourceRequestsDB();
