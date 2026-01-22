const SystemSetting = require('../models/SystemSetting');

// Get all public settings
exports.getSettings = async (req, res) => {
    try {
        const settings = await SystemSetting.getAll();
        res.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ message: 'Server error fetching settings' });
    }
};

// Update a specific setting (Admin only)
exports.updateSetting = async (req, res) => {
    const { key } = req.params;
    const { value } = req.body;

    if (!key || value === undefined) {
        return res.status(400).json({ message: 'Key and value are required' });
    }

    try {
        await SystemSetting.setValue(key, String(value));
        const updatedSettings = await SystemSetting.getAll();
        res.json({ message: 'Setting updated', settings: updatedSettings });
    } catch (error) {
        console.error('Error updating setting:', error);
        res.status(500).json({ message: 'Server error updating setting' });
    }
};
