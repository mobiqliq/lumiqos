import { useState, useEffect } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
    ArcElement, Tooltip, Legend, Filler
} from 'chart.js';
import StatCard from '../components/StatCard';
import { api } from '../api/client';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

const enrollmentData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    datasets: [{
        label: 'Enrollments',
        data: [65, 78, 90, 81, 96, 105, 112, 130, 147],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#0f172a',
        pointBorderWidth: 2,
        pointRadius: 4,
    }],
};

const attendanceData = {
    labels: ['Present', 'Absent', 'Late'],
    datasets: [{
        data: [90, 6, 4],
        backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
        borderWidth: 0,
        cutout: '70%',
    }],
};

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        x: { grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { color: '#64748b', font: { size: 11 } } },
        y: { grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { color: '#64748b', font: { size: 11 } } },
    },
};

const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 16, usePointStyle: true, pointStyleWidth: 8, font: { size: 12 } } },
    },
};

export default function Dashboard() {
    const [health, setHealth] = useState(null);

    useEffect(() => {
        api.getHealthServices().then(setHealth).catch(() => { });
    }, []);

    const recentActivity = [
        { name: 'Demo School', action: 'Onboarded', date: 'Just now', status: 'active' },
        { name: 'admin@test.com', action: 'Registered', date: 'Today', status: 'active' },
        { name: 'Teacher role', action: 'Seeded', date: 'On startup', status: 'active' },
        { name: 'SUPER_ADMIN', action: 'Permission linked', date: 'On startup', status: 'active' },
    ];

    return (
        <div className="page-content">
            <div className="page-header">
                <div>
                    <h2>Dashboard</h2>
                    <p>Welcome to LumiqOS — School Intelligence Operating System</p>
                </div>
            </div>

            {health && (
                <div className="health-grid">
                    {Object.entries(health).map(([name, status]) => (
                        <div key={name} className="card health-item">
                            <div className="service-name">{name}</div>
                            <span className={`badge ${status}`}>{status === 'up' ? '● Online' : '● Offline'}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="stats-grid">
                <StatCard icon="🎓" label="Total Students" value="1,247" color="blue" />
                <StatCard icon="👨‍🏫" label="Active Teachers" value="89" color="green" />
                <StatCard icon="🏫" label="Schools" value="5" color="purple" />
                <StatCard icon="💰" label="Revenue" value="$45,200" color="yellow" />
            </div>

            <div className="charts-grid">
                <div className="card chart-card">
                    <h3>Student Enrollment Trend</h3>
                    <div style={{ height: 280 }}>
                        <Line data={enrollmentData} options={chartOptions} />
                    </div>
                </div>
                <div className="card chart-card">
                    <h3>Attendance Overview</h3>
                    <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Doughnut data={attendanceData} options={doughnutOptions} />
                    </div>
                </div>
            </div>

            <div className="card table-card">
                <h3>Recent Activity</h3>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Action</th>
                            <th>Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentActivity.map((item, i) => (
                            <tr key={i}>
                                <td className="name-cell">{item.name}</td>
                                <td>{item.action}</td>
                                <td>{item.date}</td>
                                <td><span className={`badge ${item.status}`}>{item.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
