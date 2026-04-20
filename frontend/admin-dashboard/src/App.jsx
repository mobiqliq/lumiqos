import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import DashboardShell from './components/layout/DashboardShell';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Schools from './pages/Schools';
import Onboarding from './pages/Onboarding';

// Placeholder components for other routes
const PendingApprovals = () => <div style={{ padding: 20 }}>⏳ Pending Approvals (Coming Soon)</div>;
const UsageMetrics = () => <div style={{ padding: 20 }}>📈 Usage Metrics (Coming Soon)</div>;
const Engagement = () => <div style={{ padding: 20 }}>👥 Engagement Trends (Coming Soon)</div>;
const AIInsights = () => <div style={{ padding: 20 }}>🧠 AI Insights (Coming Soon)</div>;
const Subscriptions = () => <div style={{ padding: 20 }}>💳 Subscriptions (Coming Soon)</div>;
const Revenue = () => <div style={{ padding: 20 }}>💰 Revenue (Coming Soon)</div>;
const Invoices = () => <div style={{ padding: 20 }}>📄 Invoices (Coming Soon)</div>;
const HealthStatus = () => <div style={{ padding: 20 }}>🫀 System Health (Coming Soon)</div>;
const AuditLogs = () => <div style={{ padding: 20 }}>📋 Audit Logs (Coming Soon)</div>;
const Settings = () => <div style={{ padding: 20 }}>⚙️ Settings (Coming Soon)</div>;

function ProtectedLayout() {
  const token = localStorage.getItem('lumiq_token');
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
          <Route path="/" element={<Dashboard />} />
          <Route path="/schools" element={<Schools />} />
          <Route path="/schools/onboarding" element={<Onboarding />} />
          <Route path="/schools/pending" element={<PendingApprovals />} />
          <Route path="/analytics/usage" element={<UsageMetrics />} />
          <Route path="/analytics/engagement" element={<Engagement />} />
          <Route path="/analytics/ai-insights" element={<AIInsights />} />
          <Route path="/finance/subscriptions" element={<Subscriptions />} />
          <Route path="/finance/revenue" element={<Revenue />} />
          <Route path="/finance/invoices" element={<Invoices />} />
          <Route path="/system/health" element={<HealthStatus />} />
          <Route path="/system/audit" element={<AuditLogs />} />
          <Route path="/system/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
