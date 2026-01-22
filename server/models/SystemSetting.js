const db = require('../config/db');

class SystemSetting {
    static async getValue(key) {
        const query = 'SELECT setting_value FROM system_settings WHERE setting_key = ?';
        const [rows] = await db.execute(query, [key]);
        return rows[0] ? rows[0].setting_value : null;
    }

    static async setValue(key, value) {
        const query = `
            INSERT INTO system_settings (setting_key, setting_value) 
            VALUES (?, ?) 
            ON DUPLICATE KEY UPDATE setting_value = ?
        `;
        const [result] = await db.execute(query, [key, value, value]);
        return result;
    }

    static async getAll() {
        const query = 'SELECT setting_key, setting_value FROM system_settings';
        const [rows] = await db.execute(query);
        // Convert to key-value object
        const settings = {};
        rows.forEach(row => {
            settings[row.setting_key] = row.setting_value;
        });
        return settings;
    }
}

module.exports = SystemSetting;
