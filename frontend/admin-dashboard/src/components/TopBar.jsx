export default function TopBar() {
    const user = JSON.parse(localStorage.getItem('xceliq_user') || '{}');
    const initials = (user.name || user.email || 'A').charAt(0).toUpperCase();

    return (
        <header className="topbar">
            <div className="topbar-search">
                <span style={{ color: 'var(--text-muted)' }}>🔍</span>
                <input type="text" placeholder="Search students, schools, reports..." />
            </div>
            <div className="topbar-actions">
                <button className="topbar-btn" title="Notifications">🔔</button>
                <button className="topbar-btn" title="Settings">⚙️</button>
                <div className="topbar-avatar" title={user.email}>{initials}</div>
            </div>
        </header>
    );
}
