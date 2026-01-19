const db = require('../config/db');

async function setupMarketplaceDB() {
    try {
        console.log('Setting up Marketplace Database...');

        const connection = await db.getConnection();

        // 1. Create marketplace_categories table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS marketplace_categories (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(50) NOT NULL UNIQUE,
                icon VARCHAR(50),
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Checked/Created table: marketplace_categories');

        // 2. Seed categories
        const categories = [
            ['Books', 'book'],
            ['Electronics', 'laptop'],
            ['Clothing', 'shirt'],
            ['Accessories', 'watch'],
            ['Stationery', 'pencil'],
            ['Sports', 'football'],
            ['Others', 'box']
        ];

        for (const [name, icon] of categories) {
            await connection.query(`
                INSERT IGNORE INTO marketplace_categories (name, icon) VALUES (?, ?)
            `, [name, icon]);
        }
        console.log('Seeded marketplace_categories');

        // 3. Create marketplace_listings table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS marketplace_listings (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                category_id INT NOT NULL,
                title VARCHAR(150) NOT NULL,
                description TEXT NOT NULL,
                price DECIMAL(10, 2),
                is_negotiable BOOLEAN NOT NULL DEFAULT FALSE,
                listing_type ENUM('sale', 'exchange', 'both') NOT NULL DEFAULT 'sale',
                exchange_for TEXT,
                condition_status ENUM('new', 'like_new', 'good', 'fair') NOT NULL,
                status ENUM('active', 'sold', 'exchanged', 'expired', 'deleted') NOT NULL DEFAULT 'active',
                expires_at DATETIME NOT NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (category_id) REFERENCES marketplace_categories(id)
            )
        `);
        console.log('Checked/Created table: marketplace_listings');

        // 4. Create listing_images table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS listing_images (
                id INT PRIMARY KEY AUTO_INCREMENT,
                listing_id INT NOT NULL,
                image_path VARCHAR(255) NOT NULL,
                display_order TINYINT NOT NULL DEFAULT 0,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (listing_id) REFERENCES marketplace_listings(id) ON DELETE CASCADE
            )
        `);
        console.log('Checked/Created table: listing_images');

        connection.release();
        console.log('Marketplace Database Setup Complete!');
        process.exit(0);

    } catch (error) {
        console.error('Error setting up database:', error);
        process.exit(1);
    }
}

setupMarketplaceDB();
