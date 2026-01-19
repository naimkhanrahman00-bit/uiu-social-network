const Marketplace = require('../models/Marketplace');

exports.createListing = async (req, res) => {
    try {
        const {
            category_id,
            title,
            description,
            price,
            is_negotiable,
            listing_type,
            exchange_for,
            condition_status
        } = req.body;

        const user_id = req.user.id;

        // Process uploaded files
        const image_paths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

        if (!title || !description || !category_id || !condition_status || !listing_type) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const listingId = await Marketplace.create({
            user_id,
            category_id,
            title,
            description,
            price,
            is_negotiable: is_negotiable === 'true' || is_negotiable === true,
            listing_type,
            exchange_for,
            condition_status,
            image_paths
        });

        res.status(201).json({ message: 'Listing created successfully', listingId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error creating listing', error: error.message, stack: error.stack });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const categories = await Marketplace.getCategories();
        res.json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching categories' });
    }
};

exports.getListings = async (req, res) => {
    try {
        const {
            search,
            category_id,
            min_price,
            max_price,
            listing_type,
            condition_status,
            sort,
            page = 1,
            limit = 10
        } = req.query;

        const offset = (page - 1) * limit;

        const { listings, total } = await Marketplace.getAll({
            search,
            category_id,
            min_price,
            max_price,
            listing_type,
            condition_status,
            sort,
            limit,
            offset
        });

        res.json({
            listings,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching listings', error: error.message, stack: error.stack });
    }
};
