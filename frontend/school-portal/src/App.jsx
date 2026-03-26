import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';

import { initializeDemoData } from './api/client';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import AICopilot from './components/AICopilot';
import Login from './pages/Login';
import PrincipalDashboard from './pages/PrincipalDashboard';
import CommandCenter from './pages/CommandCenter';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import ParentDashboard from './pages/ParentDashboard';
import FinanceDashboard from './pages/FinanceDashboard';
import HRDashboard from './pages/HRDashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Classes from './pages/Classes';
import Attendance from './pages/Attendance';
import Fees from './pages/Fees';
import Announcements from './pages/Announcements';
import RiskAnalytics from './pages/RiskAnalytics';
import ReportCards from './pages/ReportCards';
import CurriculumBuilder from './pages/CurriculumBuilder';
import Assignments from './pages/Assignments';
import StudentDashboard from './pages/StudentDashboard';
import AssessmentGenerator from './pages/AssessmentGenerator';
import LessonPlanner from './pages/LessonPlanner';
import TimetableGenerator from './pages/TimetableGenerator';
import Procurement from './pages/Procurement';
import TeacherSubstitution from './pages/TeacherSubstitution';
import CurriculumPortal from './pages/CurriculumPortal';
import AcademicHealthDashboard from './pages/AcademicHealthDashboard';
import SchoolSettings from './pages/SchoolSettings';
import WarRoomDashboard from './pages/WarRoomDashboard';
import BaselineApproval from './pages/BaselineApproval';
import OnboardingJourney from './pages/OnboardingJourney';
import CommandBar from './components/CommandBar';
import MobileNav from './components/MobileNav';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("LumiqOS Error Boundary caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', background: '#0f172a', color: '#f1f5f9', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <h1 style={{ color: '#ef4444' }}>Oops! Something went wrong.</h1>
          <p style={{ margin: '20px 0', color: '#94a3b8' }}>{this.state.error?.message || "An unexpected error occurred."}</p>
          <button 
            className="btn btn-primary" 
            onClick={() => { localStorage.clear(); window.location.href = '/'; }}
            style={{ padding: '10px 20px', background: '#3b82f6', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'white' }}
          >
            Clear Session & Restart
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}


const DASHBOARD_BY_ROLE = {
  principal: CommandCenter,
  admin: CommandCenter,
  teacher: TeacherDashboard,
  parent: ParentDashboard,
  finance: FinanceDashboard,
  hr: HRDashboard,
  student: StudentDashboard,
};

function RoleDashboard() {
  const role = localStorage.getItem('school_role') || 'principal';
  const Comp = DASHBOARD_BY_ROLE[role] || PrincipalDashboard;
  return <Comp />;
}

function RoleGuard({ children, roles }) {
  const role = localStorage.getItem('school_role') || 'principal';
  if (roles && !roles.includes(role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function ProtectedLayout() {
  const token = localStorage.getItem('school_token');
  const location = useLocation();
  const role = (localStorage.getItem('school_role') || 'principal').toLowerCase();
  
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  
  return (
    <div className="app-layout" data-persona={role}>
      <CommandBar />
      <Sidebar />
      <main className="canvas">
        <TopBar />
        <div className="content-viewport" style={{ flex: 1, padding: 'var(--s-mid-3)' }}>
          <Outlet />
        </div>
      </main>
      <div className="intelligence-panel">
         {/* AI Insights & Contextual Intelligence lives here in v1.0 */}
         <AICopilot role={role} />
      </div>
      <MobileNav />
    </div>
  );
}

export default function App() {
  useEffect(() => {
    // Fire-and-forget: don't block rendering
    initializeDemoData().catch(() => {});
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<RoleDashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/fees" element={<Fees />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/risk-analytics" element={<RiskAnalytics />} />
            <Route path="/report-cards" element={<ReportCards />} />
            <Route path="/curriculum" element={<RoleGuard roles={['admin', 'principal', 'teacher']}><CurriculumBuilder /></RoleGuard>} />
            <Route path="/curriculum-portal" element={<RoleGuard roles={['admin', 'principal', 'teacher']}><CurriculumPortal /></RoleGuard>} />
            <Route path="/assignments" element={<Assignments />} />
            <Route path="/assessments" element={<AssessmentGenerator />} />
            <Route path="/lesson-planner" element={<LessonPlanner />} />
            <Route path="/timetable" element={<TimetableGenerator />} />
            <Route path="/procurement" element={<Procurement />} />
            <Route path="/substitution" element={<TeacherSubstitution />} />
            <Route path="/settings" element={<RoleGuard roles={['admin', 'principal']}><SchoolSettings /></RoleGuard>} />
            <Route path="/war-room" element={<Navigate to="/" replace />} />
            <Route path="/baseline-approval" element={<RoleGuard roles={['admin', 'principal']}><BaselineApproval /></RoleGuard>} />
            <Route path="/onboarding" element={<RoleGuard roles={['admin', 'principal']}><OnboardingJourney /></RoleGuard>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

