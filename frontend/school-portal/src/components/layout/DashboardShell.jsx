import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './DashboardShell.module.css';

export default function DashboardShell({ children, role }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  // Navigation items based on role (simplified for now)
  const getNavItems = () => {
    const items = [
      { path: '/', label: 'Dashboard', icon: '📊' },
    ];
    if (role === 'teacher') {
      items.push({ path: '/students', label: 'Students', icon: '👥' });
      items.push({ path: '/attendance', label: 'Attendance', icon: '📅' });
    }
    if (role === 'principal' || role === 'admin') {
      items.push({ path: '/schools', label: 'Schools', icon: '🏫' });
      items.push({ path: '/analytics', label: 'Analytics', icon: '📈' });
    }
    return items;
  };

  const navItems = getNavItems();

  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <span className={styles.logoMark}>L</span>
            {!sidebarCollapsed && <span className={styles.logoText}>LumiqOS</span>}
          </div>
        </div>
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.navItem} ${isActive(item.path) ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
        <button
          className={styles.collapseBtn}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          {sidebarCollapsed ? '→' : '←'}
        </button>
      </aside>

      <main className={styles.canvas}>
        <header className={styles.topbar}>
          <div className={styles.search}>
            <input type="search" placeholder="Search..." />
          </div>
          <div className={styles.topbarActions}>
            <button className={styles.iconBtn}>🔔</button>
            <div className={styles.userAvatar}>
              {role?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </header>
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
}
