import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/schools', label: 'Schools', icon: '🏫' },
    { path: '/students', label: 'Students', icon: '🎓' },
    { path: '/onboarding', label: 'Onboard Tenant', icon: '🚀' },
];

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="logo">L</div>
                <h1>XceliQOS</h1>
            </div>
            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <button
                        key={item.path}
                        className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        onClick={() => navigate(item.path)}
                    >
                        <span className="icon">{item.icon}</span>
                        {item.label}
                    </button>
                ))}
            </nav>
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
                <button
                    className="nav-item"
                    onClick={() => { localStorage.removeItem('xceliq_token'); navigate('/login'); }}
                    style={{ color: 'var(--danger)' }}
                >
                    <span className="icon">🚪</span>
                    Logout
                </button>
            </div>
        </aside>
    );
}
