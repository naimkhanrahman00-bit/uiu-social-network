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
        const sql = `SELECT * FROM marketplace_categories ORDER BY id ASC`;
        const [rows] = await db.execute(sql);
        return rows;
    }

    static async createCategory(name, icon) {
        const sql = `INSERT INTO marketplace_categories (name, icon) VALUES (?, ?)`;
        const [result] = await db.execute(sql, [name, icon]);
        return result.insertId;
    }

    static async updateCategory(id, name, icon) {
        const sql = `UPDATE marketplace_categories SET name = ?, icon = ? WHERE id = ?`;
        const [result] = await db.execute(sql, [name, icon, id]);
        return result.affectedRows > 0;
    }

    static async deleteCategory(id) {
        const sql = `DELETE FROM marketplace_categories WHERE id = ?`;
        const [result] = await db.execute(sql, [id]);
        return result.affectedRows > 0;
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

        if (filters.user_id) {
            query += ` AND m.user_id = ?`;
            params.push(filters.user_id);
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
        if (filters.user_id) {
            countQuery += ` AND m.user_id = ?`;
            countParams.push(filters.user_id);
        }

        const [countResult] = await db.execute(countQuery, countParams);

        return { listings: rows, total: countResult[0].total };
    }
    static async getById(id) {
        const sql = `
            SELECT 
                m.*, 
                c.name as category_name, 
                u.full_name as seller_name, 
                u.email as seller_email,
                u.profile_picture as seller_image,
                u.contact_info as seller_contact,
                u.student_id as seller_student_id,
                u.department_id as seller_department_id,
                d.name as seller_department_name
            FROM marketplace_listings m
            JOIN marketplace_categories c ON m.category_id = c.id
            JOIN users u ON m.user_id = u.id
            LEFT JOIN departments d ON u.department_id = d.id
            WHERE m.id = ?
        `;

        const [rows] = await db.execute(sql, [id]);

        if (rows.length === 0) return null;

        const listing = rows[0];

        // Fetch images
        const imageSql = `SELECT image_path, display_order FROM listing_images WHERE listing_id = ? ORDER BY display_order ASC`;
        const [images] = await db.execute(imageSql, [id]);

        listing.images = images.map(img => img.image_path);

        return listing;
    }
    static async getByUserId(userId) {
        const sql = `
            SELECT 
                m.*, 
                c.name as category_name,
                (SELECT image_path FROM listing_images WHERE listing_id = m.id ORDER BY display_order ASC LIMIT 1) as thumbnail
            FROM marketplace_listings m
            JOIN marketplace_categories c ON m.category_id = c.id
            WHERE m.user_id = ?
            ORDER BY m.created_at DESC
        `;
        const [rows] = await db.execute(sql, [userId]);
        return rows;
    }

    static async update(id, userId, updateData) {
        const {
            category_id,
            title,
            description,
            price,
            is_negotiable,
            listing_type,
            exchange_for,
            condition_status,
            keep_images = [], // Array of image paths to keep
            new_image_paths = [] // Array of new image paths to add
        } = updateData;

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // 1. Update main listing details
            const sql = `
                UPDATE marketplace_listings
                SET 
                    category_id = ?,
                    title = ?,
                    description = ?,
                    price = ?,
                    is_negotiable = ?,
                    listing_type = ?,
                    exchange_for = ?,
                    condition_status = ?,
                    updated_at = NOW()
                WHERE id = ? AND user_id = ?
            `;

            const [result] = await connection.execute(sql, [
                category_id,
                title,
                description,
                price || null,
                is_negotiable ? 1 : 0,
                listing_type,
                exchange_for || null,
                condition_status,
                id,
                userId
            ]);

            if (result.affectedRows === 0) {
                // Either listing not found or user not authorized
                await connection.rollback();
                return false;
            }

            // 2. Handle Images

            // a. Prepare the list of internal paths to keep
            // (Client sends full URL or relative path, we need to match what's in DB)
            const cleanKeepImages = keep_images.map(img => img.replace(/^http:\/\/localhost:5000/, ''));

            // b. Delete images that are NOT in the keep list
            // We use NOT IN clause. If cleanKeepImages is empty, we delete all.
            let deleteSql = `DELETE FROM listing_images WHERE listing_id = ?`;
            const deleteParams = [id];

            if (cleanKeepImages.length > 0) {
                deleteSql += ` AND image_path NOT IN (${cleanKeepImages.map(() => '?').join(',')})`;
                deleteParams.push(...cleanKeepImages);
            }

            await connection.execute(deleteSql, deleteParams);

            // c. Insert new images
            if (new_image_paths.length > 0) {
                // Get current max display order to append correctly
                const [rows] = await connection.execute('SELECT MAX(display_order) as maxOrder FROM listing_images WHERE listing_id = ?', [id]);
                let currentOrder = rows[0].maxOrder || 0;

                const insertSql = `INSERT INTO listing_images (listing_id, image_path, display_order) VALUES (?, ?, ?)`;

                for (const imagePath of new_image_paths) {
                    currentOrder++;
                    await connection.execute(insertSql, [id, imagePath, currentOrder]);
                }
            }

            // Check total image count constraint (optional but good practice)
            const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM listing_images WHERE listing_id = ?', [id]);
            if (countResult[0].total > 5) {
                throw new Error('Total images cannot exceed 5');
            }

            await connection.commit();
            return true;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async updateStatus(id, userId, status) {
        const sql = `
            UPDATE marketplace_listings
            SET status = ?, updated_at = NOW()
            WHERE id = ? AND user_id = ?
        `;
        const [result] = await db.execute(sql, [status, id, userId]);
        return result.affectedRows > 0;
    }

    static async delete(id, userId) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Delete images first (though cascade delete should handle it, safer to be explicit or rely on FK)
            // In schema, ON DELETE CASCADE is set for listing_images, so deleting listing is enough.

            const sql = `DELETE FROM marketplace_listings WHERE id = ? AND user_id = ?`;
            const [result] = await connection.execute(sql, [id, userId]);

            await connection.commit();
            return result.affectedRows > 0;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = Marketplace;
