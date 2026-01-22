const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
};

async function setupSettingsDB() {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected!');

        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS system_settings (
                id INT PRIMARY KEY AUTO_INCREMENT,
                setting_key VARCHAR(50) NOT NULL UNIQUE,
                setting_value TEXT NOT NULL,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
        `;

        const seedQuery = `
            INSERT IGNORE INTO system_settings (setting_key, setting_value) VALUES
            ('section_issue_enabled', 'false'),
            ('post_expiration_days', '30'),
            ('max_listing_images', '5'),
            ('max_feedback_images', '3'),
            ('max_file_size_mb', '50');
        `;

        console.log('Creating system_settings table...');
        await connection.query(createTableQuery);
        console.log('Table created or already exists.');

        console.log('Seeding initial settings...');
        await connection.query(seedQuery);
        console.log('Seed data inserted.');

    } catch (error) {
        console.error('Error setting up settings DB:', error);
    } finally {
        if (connection) connection.end();
    }
}

setupSettingsDB();
