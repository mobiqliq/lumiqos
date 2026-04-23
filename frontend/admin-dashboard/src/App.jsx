import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import DashboardShell from './components/layout/DashboardShell';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Schools from './pages/Schools';
import Onboarding from './pages/Onboarding';
import UsageMetrics from './pages/UsageMetrics';
import Engagement from './pages/Engagement';
import Subscriptions from './pages/Subscriptions';
import Revenue from './pages/Revenue';
import SystemHealth from './pages/SystemHealth';
import AuditLogs from './pages/AuditLogs';
import Settings from './pages/Settings';

const AIInsights      = () => <div style={{padding:20,color:'var(--text-muted)'}}>AI Insights — Phase 30</div>;
const PendingApprovals= () => <div style={{padding:20,color:'var(--text-muted)'}}>Pending Approvals — Phase 30</div>;
const Invoices        = () => <div style={{padding:20,color:'var(--text-muted)'}}>Invoices — Phase 30</div>;

function ProtectedLayout() {
  const token = localStorage.getItem('xceliq_token');
  const location = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  return (
    <DashboardShell>
      <Outlet />
    </DashboardShell>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/"                       element={<Dashboard />} />
          <Route path="/schools"                element={<Schools />} />
          <Route path="/schools/onboarding"     element={<Onboarding />} />
          <Route path="/schools/pending"        element={<PendingApprovals />} />
          <Route path="/analytics/usage"        element={<UsageMetrics />} />
          <Route path="/analytics/engagement"   element={<Engagement />} />
          <Route path="/analytics/ai-insights"  element={<AIInsights />} />
          <Route path="/finance/subscriptions"  element={<Subscriptions />} />
          <Route path="/finance/revenue"        element={<Revenue />} />
          <Route path="/finance/invoices"       element={<Invoices />} />
          <Route path="/system/health"          element={<SystemHealth />} />
          <Route path="/system/audit"           element={<AuditLogs />} />
          <Route path="/system/settings"        element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
