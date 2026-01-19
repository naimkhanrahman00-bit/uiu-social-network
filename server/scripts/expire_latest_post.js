const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

const expireLatest = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Connected to database.');

        // Get latest post
        const [rows] = await connection.execute('SELECT id, title, expires_at FROM lost_found_posts ORDER BY created_at DESC LIMIT 1');

        if (rows.length === 0) {
            console.log('No posts found to expire.');
            process.exit(0);
        }

        const post = rows[0];
        console.log(`Found latest post: ID ${post.id} - "${post.title}"`);
        console.log(`Current expiration: ${post.expires_at}`);

        // Expire it (set to yesterday)
        await connection.execute('UPDATE lost_found_posts SET expires_at = DATE_SUB(NOW(), INTERVAL 1 DAY) WHERE id = ?', [post.id]);

        console.log(`SUCCESS: Post ${post.id} has been manually expired.`);
        console.log('Please check the Feed (should be gone) and My Posts (should show EXPIRED).');

        await connection.end();
    } catch (err) {
        console.error('Error:', err);
    }
};

expireLatest();
