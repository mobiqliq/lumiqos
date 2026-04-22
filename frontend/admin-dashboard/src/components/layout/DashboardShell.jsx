import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import s from './DashboardShell.module.css';

const NAV = [
  { section: 'Overview', items: [
    { path: '/', label: 'Dashboard', icon: <DashIcon /> },
  ]},
  { section: 'Tenants', items: [
    { path: '/schools',            label: 'All Schools',      icon: <SchoolIcon /> },
    { path: '/schools/onboarding', label: 'Onboarding',       icon: <PlusIcon /> },
    { path: '/schools/pending',    label: 'Pending',          icon: <ClockIcon /> },
  ]},
  { section: 'Analytics', items: [
    { path: '/analytics/usage',      label: 'Usage Metrics', icon: <ChartIcon /> },
    { path: '/analytics/engagement', label: 'Engagement',    icon: <UsersIcon /> },
    { path: '/analytics/ai-insights',label: 'AI Insights',   icon: <BrainIcon /> },
  ]},
  { section: 'Finance', items: [
    { path: '/finance/subscriptions', label: 'Subscriptions', icon: <CardIcon /> },
    { path: '/finance/revenue',       label: 'Revenue',       icon: <CoinIcon /> },
    { path: '/finance/invoices',      label: 'Invoices',      icon: <DocIcon /> },
  ]},
  { section: 'System', items: [
    { path: '/system/health',    label: 'Health Status', icon: <PulseIcon /> },
    { path: '/system/audit',     label: 'Audit Logs',    icon: <LogIcon /> },
    { path: '/system/settings',  label: 'Settings',      icon: <GearIcon /> },
  ]},
];

export default function DashboardShell({ children }) {
  const [expanded, setExpanded] = useState(false);
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  const location = useLocation();
  const navigate = useNavigate();
  const hoverTimer = useRef(null);

  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const handleMouseEnter = () => {
    hoverTimer.current = setTimeout(() => setExpanded(true), 80);
  };
  const handleMouseLeave = () => {
    clearTimeout(hoverTimer.current);
    setExpanded(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('lumiq_token');
    localStorage.removeItem('lumiq_user');
    navigate('/login');
  };

  const allNavItems = NAV.flatMap(g => g.items).slice(0, 5);

  return (
    <div className={s.shell} data-surface="operator">
      {/* ── Sidebar (desktop) ── */}
      {!mobile && (
        <aside
          className={`${s.sidebar} ${expanded ? s.expanded : ''}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className={s.logoRow}>
            <div className={s.logoMark}>L</div>
            {expanded && <span className={s.logoText}>LumiqOS</span>}
          </div>

          <nav className={s.nav}>
            {NAV.map(group => (
              <div key={group.section} className={s.navGroup}>
                {expanded && <span className={s.groupLabel}>{group.section}</span>}
                {group.items.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`${s.navItem} ${isActive(item.path) ? s.active : ''}`}
                    title={!expanded ? item.label : undefined}
                  >
                    <span className={s.navIcon}>{item.icon}</span>
                    {expanded && <span className={s.navLabel}>{item.label}</span>}
                    {isActive(item.path) && <span className={s.activePip} />}
                  </Link>
                ))}
              </div>
            ))}
          </nav>

          <button className={s.logoutBtn} onClick={handleLogout} title="Logout">
            <LogoutIcon />
            {expanded && <span>Logout</span>}
          </button>
        </aside>
      )}

      {/* ── Main canvas ── */}
      <div className={s.canvas} style={!mobile ? { marginLeft: expanded ? 'var(--sidebar-full)' : 'var(--sidebar-icon)' } : {}}>
        {/* Top bar */}
        <header className={s.topbar}>
          <div className={s.topbarLeft}>
            {mobile && <div className={s.logoMark} style={{marginRight: 8}}>L</div>}
            <div className={s.searchWrap}>
              <SearchIcon />
              <input className={s.searchInput} type="search" placeholder="Search schools, metrics…" />
            </div>
          </div>
          <div className={s.topbarRight}>
            <button className={s.iconBtn} title="Notifications"><BellIcon /></button>
            <UserChip />
          </div>
        </header>

        {/* Page content */}
        <main className={s.content}>
          {children}
        </main>
      </div>

      {/* ── Bottom nav (mobile) ── */}
      {mobile && (
        <nav className={s.bottomNav}>
          {allNavItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`${s.bottomNavItem} ${isActive(item.path) ? s.active : ''}`}
            >
              <span className={s.bottomNavIcon}>{item.icon}</span>
              <span className={s.bottomNavLabel}>{item.label}</span>
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}

function UserChip() {
  const user = JSON.parse(localStorage.getItem('lumiq_user') || '{}');
  const initials = (user.name || user.email || 'PA').slice(0, 2).toUpperCase();
  return <div className={s.userChip}>{initials}</div>;
}

/* ── Inline SVG icons (no dep) ── */
function DashIcon()   { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".9"/><rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5"/><rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5"/><rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".9"/></svg>; }
function SchoolIcon() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1L1 5l7 4 7-4-7-4z" fill="currentColor" opacity=".9"/><path d="M1 9l7 4 7-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M3 7v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>; }
function PlusIcon()   { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>; }
function ClockIcon()  { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/><path d="M8 5v3.5l2.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>; }
function ChartIcon()  { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 12l4-4 3 3 5-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function UsersIcon()  { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M1 13c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M11 7c1.38 0 2.5 1.12 2.5 2.5 0 .97-.56 1.82-1.38 2.24" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>; }
function BrainIcon()  { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2C5.24 2 3 4.24 3 7c0 1.5.66 2.85 1.7 3.78L5 14h6l.3-3.22C12.34 9.85 13 8.5 13 7c0-2.76-2.24-5-5-5z" stroke="currentColor" strokeWidth="1.4"/><path d="M8 2v12" stroke="currentColor" strokeWidth="1" opacity=".4"/></svg>; }
function CardIcon()   { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="4" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M1.5 7h13" stroke="currentColor" strokeWidth="1.4"/></svg>; }
function CoinIcon()   { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/><path d="M8 5v6M6.5 6.5h2a1 1 0 010 2h-1a1 1 0 000 2h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>; }
function DocIcon()    { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 2h5.5L12 4.5V14H4V2z" stroke="currentColor" strokeWidth="1.4"/><path d="M9 2v3h3" stroke="currentColor" strokeWidth="1.2"/><path d="M6 8h4M6 11h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>; }
function PulseIcon()  { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8h3l2-5 3 9 2-4h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function LogIcon()    { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 4h10M3 8h7M3 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>; }
function GearIcon()   { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.4"/><path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>; }
function BellIcon()   { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2a4.5 4.5 0 00-4.5 4.5V9l-1.5 2h12L12.5 9V6.5A4.5 4.5 0 008 2z" stroke="currentColor" strokeWidth="1.4"/><path d="M6.5 13a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.4"/></svg>; }
function SearchIcon() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/><path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>; }
function LogoutIcon() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
