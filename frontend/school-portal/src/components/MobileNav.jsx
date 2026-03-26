import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const MOBILE_NAV_ITEMS = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/students', label: 'Students', icon: '👥' },
    { path: '/attendance', label: 'Attendance', icon: '🗓️' },
    { path: '/messages', label: 'Inbox', icon: '💬' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function MobileNav() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <nav className="mobile-nav">
            {MOBILE_NAV_ITEMS.map(item => (
                <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`mobile-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                >
                    <span className="icon">{item.icon}</span>
                    <span>{item.label}</span>
                </button>
            ))}
        </nav>
    );
}
