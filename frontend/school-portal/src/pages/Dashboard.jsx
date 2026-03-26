import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { demoData } from '../api/client';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const { stats } = demoData;

const performanceData = {
    labels: ['Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'],
    datasets: [{
        label: 'Avg Score (%)',
        data: [78, 82, 75, 88, 91, 85],
        backgroundColor: ['rgba(59,130,246,0.7)', 'rgba(16,185,129,0.7)', 'rgba(139,92,246,0.7)', 'rgba(245,158,11,0.7)', 'rgba(6,182,212,0.7)', 'rgba(249,115,22,0.7)'],
        borderRadius: 6,
    }],
};

const attendanceDonut = {
    labels: ['Present', 'Absent', 'Late'],
    datasets: [{ data: [94, 4, 2], backgroundColor: ['#10b981', '#ef4444', '#f59e0b'], borderWidth: 0, cutout: '72%' }],
};

const chartOpts = {
    responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
    scales: { x: { grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { color: '#64748b' } }, y: { grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { color: '#64748b' } } }
};

const donutOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 16, usePointStyle: true, font: { size: 12 } } } }
};

export default function Dashboard() {
    return (
        <div className="page-content">
            <div className="page-header">
                <div>
                    <h2>Dashboard</h2>
                    <p>Welcome back, Principal — here's what's happening today</p>
                </div>
            </div>

            <div className="stats-grid">
                <div className="card stat-card"><div className="stat-icon green">📋</div><div className="stat-info"><span className="stat-label">Today's Attendance</span><span className="stat-value">{stats.todayAttendance}</span></div></div>
                <div className="card stat-card"><div className="stat-icon blue">🎓</div><div className="stat-info"><span className="stat-label">Total Students</span><span className="stat-value">{stats.totalStudents}</span></div></div>
                <div className="card stat-card"><div className="stat-icon purple">👨‍🏫</div><div className="stat-info"><span className="stat-label">Active Teachers</span><span className="stat-value">{stats.activeTeachers}</span></div></div>
                <div className="card stat-card"><div className="stat-icon red">💰</div><div className="stat-info"><span className="stat-label">Pending Fees</span><span className="stat-value">{stats.pendingFees}</span></div></div>
                <div className="card stat-card"><div className="stat-icon orange">📝</div><div className="stat-info"><span className="stat-label">Upcoming Exams</span><span className="stat-value">{stats.upcomingExams}</span></div></div>
                <div className="card stat-card"><div className="stat-icon cyan">🆕</div><div className="stat-info"><span className="stat-label">New Admissions</span><span className="stat-value">{stats.newAdmissions}</span></div></div>
            </div>

            <div className="charts-grid">
                <div className="card chart-card">
                    <h3>Class-wise Academic Performance</h3>
                    <div style={{ height: 280 }}><Bar data={performanceData} options={chartOpts} /></div>
                </div>
                <div className="card chart-card">
                    <h3>Today's Attendance</h3>
                    <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Doughnut data={attendanceDonut} options={donutOpts} /></div>
                </div>
            </div>

            <div className="bottom-grid">
                <div className="card announcements">
                    <h3>📢 Announcements</h3>
                    {demoData.announcements.map((a) => (
                        <div key={a.id} className="announcement-item">
                            <div className="ann-title"><span className={`badge ${a.priority}`}>{a.priority}</span> {a.title}</div>
                            <div className="ann-body">{a.body}</div>
                            <div className="ann-time">{a.time}</div>
                        </div>
                    ))}
                </div>
                <div className="card quick-actions">
                    <h3>⚡ Quick Actions</h3>
                    <div className="quick-action-list">
                        <button className="quick-action-btn"><span className="qa-icon">📋</span> Mark Attendance</button>
                        <button className="quick-action-btn"><span className="qa-icon">🎓</span> Add Student</button>
                        <button className="quick-action-btn"><span className="qa-icon">📢</span> Send Notice</button>
                        <button className="quick-action-btn"><span className="qa-icon">💰</span> Collect Fee</button>
                        <button className="quick-action-btn"><span className="qa-icon">📝</span> Schedule Exam</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
