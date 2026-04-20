import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './DashboardShell.module.css';

export default function DashboardShell({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

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
          <div className={styles.navSection}>
            <span className={styles.navLabel}>Overview</span>
            <Link to="/" className={`${styles.navItem} ${isActive('/') ? styles.active : ''}`}>
              <span className={styles.navIcon}>📊</span>
              {!sidebarCollapsed && <span>Dashboard</span>}
            </Link>
          </div>
          <div className={styles.navSection}>
            <span className={styles.navLabel}>Tenants</span>
            <Link to="/schools" className={`${styles.navItem} ${isActive('/schools') ? styles.active : ''}`}>
              <span className={styles.navIcon}>🏫</span>
              {!sidebarCollapsed && <span>All Schools</span>}
            </Link>
            <Link to="/schools/onboarding" className={`${styles.navItem} ${isActive('/schools/onboarding') ? styles.active : ''}`}>
              <span className={styles.navIcon}>➕</span>
              {!sidebarCollapsed && <span>Onboarding</span>}
            </Link>
            <Link to="/schools/pending" className={`${styles.navItem} ${isActive('/schools/pending') ? styles.active : ''}`}>
              <span className={styles.navIcon}>⏳</span>
              {!sidebarCollapsed && <span>Pending Approvals</span>}
            </Link>
          </div>
          <div className={styles.navSection}>
            <span className={styles.navLabel}>Analytics</span>
            <Link to="/analytics/usage" className={`${styles.navItem} ${isActive('/analytics/usage') ? styles.active : ''}`}>
              <span className={styles.navIcon}>📈</span>
              {!sidebarCollapsed && <span>Usage Metrics</span>}
            </Link>
            <Link to="/analytics/engagement" className={`${styles.navItem} ${isActive('/analytics/engagement') ? styles.active : ''}`}>
              <span className={styles.navIcon}>👥</span>
              {!sidebarCollapsed && <span>Engagement</span>}
            </Link>
            <Link to="/analytics/ai-insights" className={`${styles.navItem} ${isActive('/analytics/ai-insights') ? styles.active : ''}`}>
              <span className={styles.navIcon}>🧠</span>
              {!sidebarCollapsed && <span>AI Insights</span>}
            </Link>
          </div>
          <div className={styles.navSection}>
            <span className={styles.navLabel}>Finance</span>
            <Link to="/finance/subscriptions" className={`${styles.navItem} ${isActive('/finance/subscriptions') ? styles.active : ''}`}>
              <span className={styles.navIcon}>💳</span>
              {!sidebarCollapsed && <span>Subscriptions</span>}
            </Link>
            <Link to="/finance/revenue" className={`${styles.navItem} ${isActive('/finance/revenue') ? styles.active : ''}`}>
              <span className={styles.navIcon}>💰</span>
              {!sidebarCollapsed && <span>Revenue</span>}
            </Link>
            <Link to="/finance/invoices" className={`${styles.navItem} ${isActive('/finance/invoices') ? styles.active : ''}`}>
              <span className={styles.navIcon}>📄</span>
              {!sidebarCollapsed && <span>Invoices</span>}
            </Link>
          </div>
          <div className={styles.navSection}>
            <span className={styles.navLabel}>System</span>
            <Link to="/system/health" className={`${styles.navItem} ${isActive('/system/health') ? styles.active : ''}`}>
              <span className={styles.navIcon}>🫀</span>
              {!sidebarCollapsed && <span>Health Status</span>}
            </Link>
            <Link to="/system/audit" className={`${styles.navItem} ${isActive('/system/audit') ? styles.active : ''}`}>
              <span className={styles.navIcon}>📋</span>
              {!sidebarCollapsed && <span>Audit Logs</span>}
            </Link>
            <Link to="/system/settings" className={`${styles.navItem} ${isActive('/system/settings') ? styles.active : ''}`}>
              <span className={styles.navIcon}>⚙️</span>
              {!sidebarCollapsed && <span>Settings</span>}
            </Link>
          </div>
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
            <input type="search" placeholder="Search schools..." />
          </div>
          <div className={styles.topbarActions}>
            <button className={styles.iconBtn}>🔔</button>
            <div className={styles.userAvatar}>PA</div>
          </div>
        </header>
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
}
