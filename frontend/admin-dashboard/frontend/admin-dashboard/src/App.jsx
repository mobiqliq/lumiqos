import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardShell from './components/layout/DashboardShell';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

function App() {
  const isAuthenticated = !!localStorage.getItem('xceliq_token');

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <DashboardShell>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/schools" element={<div>Schools Page (Coming Soon)</div>} />
                  <Route path="/schools/onboarding" element={<div>Onboarding Page (Coming Soon)</div>} />
                  <Route path="/schools/pending" element={<div>Pending Approvals (Coming Soon)</div>} />
                  <Route path="/analytics/*" element={<div>Analytics (Coming Soon)</div>} />
                  <Route path="/finance/*" element={<div>Finance (Coming Soon)</div>} />
                  <Route path="/system/*" element={<div>System (Coming Soon)</div>} />
                </Routes>
              </DashboardShell>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
