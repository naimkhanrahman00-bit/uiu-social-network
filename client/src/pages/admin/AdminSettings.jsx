import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';

const AdminSettings = () => {
    const { settings, updateSetting } = useSettings();
    const [updating, setUpdating] = useState(null);

    const handleToggle = async (key, currentValue) => {
        const newValue = currentValue === 'true' ? 'false' : 'true';
        setUpdating(key);
        await updateSetting(key, newValue);
        setUpdating(null);
    };

    const formatKey = (key) => {
        return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };

    return (
        <div className="container" style={{ padding: '2rem' }}>
            <h1>System Settings</h1>

            <div className="card" style={{ marginTop: '2rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }}>
                <h3>Feature Toggles</h3>
                <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0.5rem'
                    }}>
                        <div>
                            <h4 style={{ margin: 0 }}>Section Issue / Exchange</h4>
                            <p style={{ margin: '0.5rem 0 0', color: 'var(--text-secondary)' }}>
                                Enable or disable the Section Issue and Exchange module.
                            </p>
                        </div>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={settings.section_issue_enabled === 'true'}
                                onChange={() => handleToggle('section_issue_enabled', settings.section_issue_enabled)}
                                disabled={updating === 'section_issue_enabled'}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>

                    {/* Add other settings here if needed */}
                </div>
            </div>

            <div className="card" style={{ marginTop: '2rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }}>
                <h3>Other Configurations</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Setting Name</th>
                            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(settings).map(([key, value]) => {
                            if (key === 'section_issue_enabled') return null; // Skip already shown
                            return (
                                <tr key={key} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '0.5rem' }}>{formatKey(key)}</td>
                                    <td style={{ padding: '0.5rem' }}>{value}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <style>{`
                .switch {
                    position: relative;
                    display: inline-block;
                    width: 60px;
                    height: 34px;
                }
                .switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #ccc;
                    -webkit-transition: .4s;
                    transition: .4s;
                }
                .slider:before {
                    position: absolute;
                    content: "";
                    height: 26px;
                    width: 26px;
                    left: 4px;
                    bottom: 4px;
                    background-color: white;
                    -webkit-transition: .4s;
                    transition: .4s;
                }
                input:checked + .slider {
                    background-color: var(--primary-color);
                }
                input:focus + .slider {
                    box-shadow: 0 0 1px var(--primary-color);
                }
                input:checked + .slider:before {
                    -webkit-transform: translateX(26px);
                    -ms-transform: translateX(26px);
                    transform: translateX(26px);
                }
                .slider.round {
                    border-radius: 34px;
                }
                .slider.round:before {
                    border-radius: 50%;
                }
            `}</style>
        </div>
    );
};

export default AdminSettings;
