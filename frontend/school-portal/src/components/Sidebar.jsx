import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NAV_ITEMS = [
    { id: 'dashboard', path: '/', icon: '🏢', label: 'Command Cockpit' },
    { id: 'approval', path: '/approvals', icon: '📋', label: 'Baseline Approval' },
    { id: 'curriculum', path: '/curriculum', icon: '🧬', label: 'Curriculum Builder' },
    { id: 'analytics', path: '/analytics', icon: '📈', label: 'Risk Analytics' },
    { id: 'students', path: '/students', icon: '🎓', label: 'Student Hub' },
    { id: 'staff', path: '/teachers', icon: '👨‍🏫', label: 'Teacher Network' }
];

export default function Sidebar() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const role = (localStorage.getItem('school_role') || 'principal').toLowerCase();

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div style={{ 
                    width: '32px', height: '32px', background: 'var(--grad-blue)', 
                    borderRadius: '8px', display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', fontWeight: 'bold', color: '#fff',
                    boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)',
                    fontSize: '14px'
                }}>L</div>
                XceliQ<span>OS</span>
            </div>

            <nav style={{ flex: 1 }}>
                <div className="label" style={{ marginBottom: '24px', opacity: 0.5 }}>
                    Intelligence OS
                </div>
                {NAV_ITEMS.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => navigate(item.path)}
                        className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        style={{ cursor: 'pointer' }}
                    >
                        <span style={{ fontSize: '18px', filter: location.pathname === item.path ? 'grayscale(0)' : 'grayscale(1) opacity(0.5)' }}>
                            {item.icon}
                        </span>
                        <span>{t(item.label)}</span>
                    </div>
                ))}
            </nav>

            <div style={{ 
                marginTop: 'auto', padding: '20px', 
                background: 'rgba(255,255,255,0.02)', borderRadius: '20px',
                border: '1px solid var(--border)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ 
                        width: '38px', height: '38px', borderRadius: '12px', 
                        background: 'var(--grad-purple)', display: 'flex', 
                        alignItems: 'center', justifyContent: 'center', fontSize: '18px',
                        boxShadow: '0 0 15px rgba(139, 92, 246, 0.2)'
                    }}>👤</div>
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>Principal Admin</div>
                        <div className="label" style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>Central Command</div>
                    </div>
                </div>
                <button 
                    onClick={() => { localStorage.clear(); navigate('/login'); }}
                    className="nav-item" 
                    style={{ 
                        width: '100%', justifyContent: 'center', background: 'rgba(239, 68, 68, 0.05)', 
                        color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.1)',
                        fontSize: '12px', fontWeight: '700', padding: '10px'
                    }}
                >
                    EXIT_CORE
                </button>
            </div>
        </aside>
    );
}
