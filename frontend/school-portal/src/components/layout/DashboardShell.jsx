import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import s from './DashboardShell.module.css';

const ROLE_NAV = {
  principal: [
    { path: '/',                    label: 'Overview',       icon: <DashIcon /> },
    { path: '/academic-health',     label: 'Academic Health',icon: <ChartIcon /> },
    { path: '/command-center',      label: 'Command Centre', icon: <CmdIcon /> },
    { path: '/timetable',           label: 'Timetable',      icon: <CalIcon /> },
    { path: '/staff',               label: 'Staff',          icon: <UsersIcon /> },
    { path: '/report-cards',        label: 'Report Cards',   icon: <DocIcon /> },
    { path: '/settings',            label: 'Settings',       icon: <GearIcon /> },
  ],
  teacher: [
    { path: '/',                    label: 'My Classes',     icon: <DashIcon /> },
    { path: '/lesson-planner',      label: 'Lesson Planner', icon: <BookIcon /> },
    { path: '/attendance',          label: 'Attendance',     icon: <CalIcon /> },
    { path: '/homework',            label: 'Homework',       icon: <DocIcon /> },
    { path: '/assessments',         label: 'Assessments',    icon: <ChartIcon /> },
    { path: '/substitution',        label: 'Substitution',   icon: <SwapIcon /> },
  ],
  administrator: [
    { path: '/',                    label: 'Dashboard',      icon: <DashIcon /> },
    { path: '/students',            label: 'Students',       icon: <UsersIcon /> },
    { path: '/classes',             label: 'Classes',        icon: <SchoolIcon /> },
    { path: '/announcements',       label: 'Announcements',  icon: <BellIcon /> },
    { path: '/settings',            label: 'Settings',       icon: <GearIcon /> },
  ],
  finance: [
    { path: '/',                    label: 'Finance',        icon: <DashIcon /> },
    { path: '/fees',                label: 'Fee Collection', icon: <CoinIcon /> },
    { path: '/procurement',         label: 'Procurement',    icon: <BoxIcon /> },
  ],
  hr: [
    { path: '/',                    label: 'HR Overview',    icon: <DashIcon /> },
    { path: '/staff',               label: 'Staff',          icon: <UsersIcon /> },
  ],
  parent: [
    { path: '/',                    label: 'My Child',       icon: <DashIcon /> },
    { path: '/fees',                label: 'Fees',           icon: <CoinIcon /> },
    { path: '/announcements',       label: 'Announcements',  icon: <BellIcon /> },
  ],
  student: [
    { path: '/',                    label: 'Dashboard',      icon: <DashIcon /> },
    { path: '/homework',            label: 'Homework',       icon: <DocIcon /> },
    { path: '/assignments',         label: 'Assignments',    icon: <BookIcon /> },
    { path: '/fees',                label: 'Fees',           icon: <CoinIcon /> },
  ],
};

const ROLE_LABEL = {
  principal: 'Principal', teacher: 'Teacher', administrator: 'Admin',
  finance: 'Finance', hr: 'HR', parent: 'Parent', student: 'Student',
};

export default function DashboardShell({ children, role = 'principal' }) {
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

  const navItems = ROLE_NAV[role] || ROLE_NAV.principal;

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
    localStorage.removeItem('school_token');
    localStorage.removeItem('school_role');
    localStorage.removeItem('school_user');
    navigate('/login');
  };

  const mobileItems = navItems.slice(0, 5);

  return (
    <div className={s.shell} data-surface="school">
      {!mobile && (
        <aside
          className={`${s.sidebar} ${expanded ? s.expanded : ''}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className={s.logoRow}>
            <div className={s.logoMark}>L</div>
            {expanded && <span className={s.logoText}>XceliQOS</span>}
          </div>

          {expanded && (
            <div className={s.roleChip}>
              <span className={s.roleLabel}>{ROLE_LABEL[role] || role}</span>
            </div>
          )}

          <nav className={s.nav}>
            {navItems.map(item => (
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
          </nav>

          <button className={s.logoutBtn} onClick={handleLogout} title="Logout">
            <LogoutIcon />
            {expanded && <span>Logout</span>}
          </button>
        </aside>
      )}

      <div
        className={s.canvas}
        style={!mobile ? { marginLeft: expanded ? 'var(--sidebar-full)' : 'var(--sidebar-icon)' } : {}}
      >
        <header className={s.topbar}>
          <div className={s.topbarLeft}>
            {mobile && <div className={s.logoMark} style={{marginRight:8}}>L</div>}
            <div className={s.searchWrap}>
              <SearchIcon />
              <input className={s.searchInput} type="search" placeholder="Search…" />
            </div>
          </div>
          <div className={s.topbarRight}>
            <button className={s.iconBtn} title="Notifications"><BellIcon /></button>
            <UserChip role={role} />
          </div>
        </header>

        <main className={s.content}>
          {children}
        </main>
      </div>

      {mobile && (
        <nav className={s.bottomNav}>
          {mobileItems.map(item => (
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

function UserChip({ role }) {
  const user = JSON.parse(localStorage.getItem('school_user') || '{}');
  const initials = (user.name || user.email || role || 'U').slice(0, 2).toUpperCase();
  return <div className={s.userChip}>{initials}</div>;
}

function DashIcon()   { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".9"/><rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5"/><rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5"/><rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".9"/></svg>; }
function ChartIcon()  { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 12l4-4 3 3 5-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function CmdIcon()    { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="1.5" width="13" height="13" rx="3" stroke="currentColor" strokeWidth="1.4"/><path d="M5 8h6M8 5v6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>; }
function CalIcon()    { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="3" width="13" height="11.5" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M5 1.5V4M11 1.5V4M1.5 7h13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>; }
function UsersIcon()  { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M1 13c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M11 7c1.38 0 2.5 1.12 2.5 2.5 0 .97-.56 1.82-1.38 2.24" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>; }
function DocIcon()    { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 2h5.5L12 4.5V14H4V2z" stroke="currentColor" strokeWidth="1.4"/><path d="M9 2v3h3" stroke="currentColor" strokeWidth="1.2"/><path d="M6 8h4M6 11h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>; }
function GearIcon()   { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.4"/><path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>; }
function BookIcon()   { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 2h7l3 3v9H3V2z" stroke="currentColor" strokeWidth="1.4"/><path d="M10 2v3h3" stroke="currentColor" strokeWidth="1.2"/><path d="M5 8h6M5 11h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>; }
function SwapIcon()   { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 5h12M11 2l3 3-3 3M14 11H2M5 8l-3 3 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function SchoolIcon() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1L1 5l7 4 7-4-7-4z" fill="currentColor" opacity=".9"/><path d="M1 9l7 4 7-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>; }
function BellIcon()   { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2a4.5 4.5 0 00-4.5 4.5V9l-1.5 2h12L12.5 9V6.5A4.5 4.5 0 008 2z" stroke="currentColor" strokeWidth="1.4"/><path d="M6.5 13a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.4"/></svg>; }
function CoinIcon()   { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/><path d="M8 5v6M6.5 6.5h2a1 1 0 010 2h-1a1 1 0 000 2h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>; }
function BoxIcon()    { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 5l6-3 6 3v6l-6 3-6-3V5z" stroke="currentColor" strokeWidth="1.4"/><path d="M8 2v12M2 5l6 3 6-3" stroke="currentColor" strokeWidth="1.2"/></svg>; }
function SearchIcon() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/><path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>; }
function LogoutIcon() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
