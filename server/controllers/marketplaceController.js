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

exports.createCategory = async (req, res) => {
    try {
        const { name, icon } = req.body;
        if (!name) return res.status(400).json({ message: 'Name is required' });

        await Marketplace.createCategory(name, icon);
        res.status(201).json({ message: 'Category created' });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Category with this name already exists' });
        }
        res.status(500).json({ message: 'Server error creating category' });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { name, icon } = req.body;
        await Marketplace.updateCategory(req.params.id, name, icon);
        res.json({ message: 'Category updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating category' });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        await Marketplace.deleteCategory(req.params.id);
        res.json({ message: 'Category deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting category' });
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
            user_id,
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
            user_id,
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

exports.getListingById = async (req, res) => {
    try {
        const listing = await Marketplace.getById(req.params.id);

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        res.json(listing);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching listing details' });
    }
};
exports.getMyListings = async (req, res) => {
    try {
        const listings = await Marketplace.getByUserId(req.user.id);
        res.json(listings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching my listings' });
    }
};

exports.updateListing = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        // Process new uploaded files
        const new_image_paths = req.files ? req.files.map(file => `/uploads/marketplace/${file.filename}`) : [];

        // existing images to keep (comes as array or single string from form data)
        let keep_images = req.body.keep_images || [];
        if (!Array.isArray(keep_images)) {
            keep_images = [keep_images];
        }

        const updateData = {
            ...req.body,
            new_image_paths,
            keep_images
        };

        const success = await Marketplace.update(id, user_id, updateData);

        if (!success) {
            return res.status(404).json({ message: 'Listing not found or unauthorized' });
        }

        res.json({ message: 'Listing updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating listing', error: error.message });
    }
};

exports.updateListingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'sold', 'exchanged', 'deleted'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const success = await Marketplace.updateStatus(id, req.user.id, status);

        if (!success) {
            return res.status(404).json({ message: 'Listing not found or unauthorized' });
        }

        res.json({ message: 'Listing status updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating status' });
    }
};

exports.deleteListing = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await Marketplace.delete(id, req.user.id);

        if (!success) {
            return res.status(404).json({ message: 'Listing not found or unauthorized' });
        }

        res.json({ message: 'Listing deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting listing' });
    }
};
