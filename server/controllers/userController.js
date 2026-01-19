const User = require('../models/userModel');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private (Needs auth middleware later)
const getProfile = async (req, res) => {
    // Ideally, req.user will be populated by auth middleware
    // For now, we might need to pass user_id explicitly or trust a header if not full auth yet
    // BUT we have AuthContext sending token. We need authentication middleware to verify token and attach user to req.

    // I will extract logic assuming I will add an `protect` middleware shortly.
    // For specific step now, access user id from req.user.id
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            res.json({
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                student_id: user.student_id,
                department_id: user.department_id,
                batch: user.batch,
                contact_info: user.contact_info, // Add specific field
                profile_picture: user.profile_picture,
                role: user.role
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
    console.log('[DEBUG] updateProfile called');
    console.log('[DEBUG] req.body:', req.body);
    console.log('[DEBUG] req.file:', req.file);
    console.log('[DEBUG] req.user:', req.user);

    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.full_name = req.body.full_name || user.full_name;
            user.batch = req.body.batch || user.batch;
            user.contact_info = req.body.contact_info || user.contact_info;
            user.department_id = req.body.department_id || user.department_id;

            if (req.file) {
                user.profile_picture = `/uploads/profiles/${req.file.filename}`;
            }

            // Update in DB
            console.log('[DEBUG] Calling User.update with:', user);
            const updatedUser = await User.update(user.id, {
                full_name: user.full_name,
                batch: user.batch,
                contact_info: user.contact_info,
                department_id: user.department_id,
                profile_picture: user.profile_picture
            });
            console.log('[DEBUG] User.update result:', updatedUser);

            res.json({
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                student_id: user.student_id,
                department_id: user.department_id,
                batch: user.batch,
                contact_info: user.contact_info,
                profile_picture: user.profile_picture,
                role: user.role,
                token: generateToken(user.id)
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('[DEBUG] updateProfile Error:', error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// Helper for Token (need to import or just rely on existing auth flow)
const generateToken = require('../utils/generateToken');

module.exports = { getProfile, updateProfile };
