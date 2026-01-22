import React, { useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar
} from 'recharts';
import api from '../../api/axios';
import './Analytics.css';

const Analytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/analytics');
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="analytics-loading">Loading analytics...</div>;
    if (error) return <div className="analytics-error">{error}</div>;
    if (!data) return null;

    // Colors for Pie Charts
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    // Format date for X-axis
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return `${date.getDate()}/${date.getMonth() + 1}`;
    };

    return (
        <div className="analytics-container">
            <h1 className="analytics-title">Platform Analytics</h1>

            <div className="analytics-grid">
                {/* User Growth Chart */}
                <div className="analytics-card">
                    <h3>User Limit Growth (Last 30 Days)</h3>
                    {data.userGrowth.length > 0 ? (
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={data.userGrowth}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={formatDate}
                                    />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip labelFormatter={(label) => new Date(label).toLocaleDateString()} />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        name="New Users"
                                        stroke="#8884d8"
                                        activeDot={{ r: 8 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="no-data">No user growth data available</p>
                    )}
                </div>

                {/* Marketplace Categories */}
                <div className="analytics-card">
                    <h3>Marketplace Listings Distribution</h3>
                    {data.listingsByCategory.length > 0 ? (
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={data.listingsByCategory}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="count"
                                    >
                                        {data.listingsByCategory.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="no-data">No marketplace data available</p>
                    )}
                </div>

                {/* Lost vs Found Ratio */}
                <div className="analytics-card">
                    <h3>Lost vs Found Posts</h3>
                    {data.lostFoundRatio.length > 0 ? (
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={data.lostFoundRatio}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="count"
                                        nameKey="type"
                                        label
                                    >
                                        {data.lostFoundRatio.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.type === 'lost' ? '#ff6b6b' : '#51cf66'} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="no-data">No lost & found data available</p>
                    )}
                </div>

                {/* Top Resources */}
                <div className="analytics-card">
                    <h3>Top 5 Downloaded Resources</h3>
                    {data.topResources.length > 0 ? (
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={data.topResources}
                                    layout="vertical"
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" allowDecimals={false} />
                                    <YAxis type="category" dataKey="title" width={100} tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="download_count" name="Downloads" fill="#82ca9d" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="no-data">No download data available</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Analytics;
