import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import DashboardShell from './components/layout/DashboardShell';
import Login from './pages/Login';
import TeacherDashboard from './pages/TeacherDashboard';
import PrincipalDashboard from './pages/PrincipalDashboard';
import AdminDashboard from './pages/AdminDashboard';
import FinanceDashboard from './pages/FinanceDashboard';
import HRDashboard from './pages/HRDashboard';
import ParentDashboard from './pages/ParentDashboard';
import StudentDashboard from './pages/StudentDashboard';

const DASHBOARD_BY_ROLE = {
  principal: PrincipalDashboard,
  admin: AdminDashboard,
  administrator: AdminDashboard,
  teacher: TeacherDashboard,
  finance: FinanceDashboard,
  hr: HRDashboard,
  parent: ParentDashboard,
  student: StudentDashboard,
};

function RoleDashboard() {
  const role = localStorage.getItem('school_role') || 'principal';
  const Comp = DASHBOARD_BY_ROLE[role] || PrincipalDashboard;
  return <Comp />;
}

function ProtectedLayout() {
  const token = localStorage.getItem('school_token');
  const location = useLocation();
  const role = localStorage.getItem('school_role') || 'principal';

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <DashboardShell role={role}>
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
          <Route path="/" element={<RoleDashboard />} />
          <Route path="/students" element={<div>Students Page</div>} />
          <Route path="/attendance" element={<div>Attendance Page</div>} />
        </Route>
        <Route path="/test-teacher" element={<TeacherDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
