const db = require('../config/db');

class Marketplace {
    static async create(listingData) {
        const {
            user_id,
            category_id,
            title,
            description,
            price,
            is_negotiable,
            listing_type,
            exchange_for,
            condition_status,
            image_paths = []
        } = listingData;

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const sql = `
                INSERT INTO marketplace_listings 
                (user_id, category_id, title, description, price, is_negotiable, listing_type, exchange_for, condition_status, expires_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))
            `;

            const [result] = await connection.execute(sql, [
                user_id,
                category_id,
                title,
                description,
                price || null,
                is_negotiable ? 1 : 0,
                listing_type,
                exchange_for || null,
                condition_status
            ]);

            const listingId = result.insertId;

            // Insert images if any
            if (image_paths && image_paths.length > 0) {
                const imageSql = `INSERT INTO listing_images (listing_id, image_path, display_order) VALUES (?, ?, ?)`;
                for (let i = 0; i < image_paths.length; i++) {
                    await connection.execute(imageSql, [listingId, image_paths[i], i]);
                }
            }

            await connection.commit();
            return listingId;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async getCategories() {
        const sql = `SELECT * FROM marketplace_categories`;
        const [rows] = await db.execute(sql);
        return rows;
    }

    static async getAll(filters = {}) {
        let query = `
            SELECT 
                m.*, 
                c.name as category_name, 
                u.full_name as seller_name, 
                u.profile_picture as seller_image,
                (SELECT image_path FROM listing_images WHERE listing_id = m.id ORDER BY display_order ASC LIMIT 1) as thumbnail
            FROM marketplace_listings m
            JOIN marketplace_categories c ON m.category_id = c.id
            JOIN users u ON m.user_id = u.id
            WHERE m.status = 'active'
        `;

        const params = [];

        if (filters.search) {
            query += ` AND (m.title LIKE ? OR m.description LIKE ?)`;
            params.push(`%${filters.search}%`, `%${filters.search}%`);
        }

        if (filters.category_id) {
            query += ` AND m.category_id = ?`;
            params.push(filters.category_id);
        }

        if (filters.min_price) {
            query += ` AND m.price >= ?`;
            params.push(filters.min_price);
        }

        if (filters.max_price) {
            query += ` AND m.price <= ?`;
            params.push(filters.max_price);
        }

        if (filters.listing_type) {
            query += ` AND m.listing_type = ?`;
            params.push(filters.listing_type);
        }

        if (filters.condition_status) {
            query += ` AND m.condition_status = ?`;
            params.push(filters.condition_status);
        }

        // Sorting
        if (filters.sort === 'price_asc') {
            query += ` ORDER BY m.price ASC`;
        } else if (filters.sort === 'price_desc') {
            query += ` ORDER BY m.price DESC`;
        } else {
            query += ` ORDER BY m.created_at DESC`; // Default
        }

        // Pagination
        if (filters.limit && filters.offset !== undefined) {
            query += ` LIMIT ${parseInt(filters.limit)} OFFSET ${parseInt(filters.offset)}`;
            // params.push(parseInt(filters.limit), parseInt(filters.offset)); // Removed to avoid binding issues
        }

        const [rows] = await db.execute(query, params);

        // Count total for pagination
        let countQuery = `
            SELECT COUNT(*) as total 
            FROM marketplace_listings m 
            WHERE m.status = 'active'
        `;
        const countParams = [];

        if (filters.search) {
            countQuery += ` AND (m.title LIKE ? OR m.description LIKE ?)`;
            countParams.push(`%${filters.search}%`, `%${filters.search}%`);
        }
        if (filters.category_id) {
            countQuery += ` AND m.category_id = ?`;
            countParams.push(filters.category_id);
        }
        if (filters.min_price) {
            countQuery += ` AND m.price >= ?`;
            countParams.push(filters.min_price);
        }
        if (filters.max_price) {
            countQuery += ` AND m.price <= ?`;
            countParams.push(filters.max_price);
        }

        if (filters.listing_type) {
            countQuery += ` AND m.listing_type = ?`;
            countParams.push(filters.listing_type);
        }
        if (filters.condition_status) {
            countQuery += ` AND m.condition_status = ?`;
            countParams.push(filters.condition_status);
        }

        const [countResult] = await db.execute(countQuery, countParams);

        return { listings: rows, total: countResult[0].total };
    }
}

module.exports = Marketplace;
