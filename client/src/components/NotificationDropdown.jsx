import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { FaBell, FaCheck, FaTimes } from 'react-icons/fa';

const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.is_read).length);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        } else {
            // Initial fetch for badge
            fetchNotifications();
        }

        // Poll every minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const markAsRead = async (e, id) => {
        e.stopPropagation();
        e.preventDefault();
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, is_read: 1 } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Error marking all as read:', err);
        }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.is_read) {
            await markAsRead({ stopPropagation: () => { }, preventDefault: () => { } }, notification.id);
        }
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-orange-500 focus:outline-none transition-colors"
                title="Notifications"
            >
                <FaBell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl overflow-hidden z-50 border border-gray-100 animate-fade-in-up">
                    <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white flex justify-between items-center shadow-sm">
                        <h3 className="font-bold text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded transition-colors"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-gray-500 text-sm">
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            <div>
                                {notifications.map(notification => (
                                    <div
                                        key={notification.id}
                                        className={`p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 ${!notification.is_read ? 'bg-orange-50/50' : ''}`}
                                    >
                                        <Link
                                            to={notification.link || '#'}
                                            className="flex-1"
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <h4 className={`text-sm ${!notification.is_read ? 'font-bold text-gray-800' : 'font-medium text-gray-600'}`}>
                                                    {notification.title}
                                                </h4>
                                                <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                                    {new Date(notification.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                {notification.message}
                                            </p>
                                        </Link>
                                        {!notification.is_read && (
                                            <button
                                                onClick={(e) => markAsRead(e, notification.id)}
                                                className="text-orange-400 hover:text-orange-600 self-center p-1"
                                                title="Mark as read"
                                            >
                                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="p-2 bg-gray-50 text-center border-t border-gray-100">
                        <Link
                            to="/notifications"
                            className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                            onClick={() => setIsOpen(false)}
                        >
                            View All Notifications
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
