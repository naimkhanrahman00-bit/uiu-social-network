import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const SettingsContext = createContext();

export const useSettings = () => {
    return useContext(SettingsContext);
};

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/settings');
            setSettings(res.data);
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateSetting = async (key, value) => {
        try {
            const res = await api.patch(`/settings/admin/${key}`, { value });
            setSettings(res.data.settings);
            return { success: true };
        } catch (error) {
            console.error('Error updating setting:', error);
            return { success: false, message: error.response?.data?.message || 'Update failed' };
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, updateSetting, loading, fetchSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export default SettingsContext;
