import { useState, useEffect } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { demoData } from '../api/client';
import InsightCard from '../components/InsightCard';
import { useTranslation } from 'react-i18next';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function PrincipalDashboard() {
    const { t } = useTranslation();
    const [incomingTransfer, setIncomingTransfer] = useState(true);
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                // School ID fallback for seeded demo
                const schoolId = localStorage.getItem('school_id') || 'd4c837bd-ea38-42ca-a99f-ffddf2e148a8';
                const response = await fetch(`/api/dashboard/overview`, {
                    headers: { 
                        'Authorization': `Bearer ${localStorage.getItem('school_token') || 'demo-token'}`,
                        'X-School-Id': schoolId
                    }
                });
                const res = await response.json();
                setData(res);
            } catch (error) {
                console.error("Dashboard fetch error:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    const insights = [
        { 
            title: t("Attendance Alert"), 
            desc: t("Grade 10A attendance dropped by 12% on Tuesdays."), 
            icon: "📉",
            type: "warning"
        },
        { 
            title: t("Pending Signatures"), 
            desc: `${data?.academics?.pending_signatures || 15} ${t("report cards are waiting for your digital signature.")}`, 
            icon: "🖋️",
            type: "info"
        }
    ];

    const perfData = {
        labels: (demoData?.classes || []).map(c => c.name.replace('Class ', 'C')),
        datasets: [{ label: 'Avg %', data: (demoData?.classes || []).map(c => c.avgScore), backgroundColor: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#f97316'], borderRadius: 6 }],
    };

    const chartOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { color: '#64748b' } }, y: { grid: { color: 'rgba(148,163,184,0.06)' }, ticks: { color: '#64748b' } } } };

    const riskDonut = {
        labels: [t('Low Risk'), t('Medium Risk'), t('High Risk')],
        datasets: [{ data: [6, 2, 3], backgroundColor: ['#10b981', '#f59e0b', '#ef4444'], borderWidth: 0, cutout: '70%' }],
    };
    const donutOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 12, usePointStyle: true, font: { size: 11 } } } } };

    if (isLoading) return <div className="page-content">{t("Loading Command Center...")}</div>;

    return (
        <div className="page-content">
            <div className="page-header"><div><h2>🎛️ {t("Command Center")}</h2><p>{t("Real-time school intelligence overview")}</p></div></div>

            <div className="section-label">🧠 {t("Smart Insights")}</div>
            <div className="insights-grid">
                {insights.map((ins, i) => <InsightCard key={i} {...ins} />)}
            </div>

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className="card stat-card">
                    <div className="stat-icon green">📋</div>
                    <div className="stat-info">
                        <span className="stat-label">{t("Today's Attendance")}</span>
                        <span className="stat-value">{data?.attendance?.today_attendance_rate || 94}%</span>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon red">🔴</div>
                    <div className="stat-info">
                        <span className="stat-label">{t("At-Risk Students")}</span>
                        <span className="stat-value">{data?.academics?.at_risk_students || 3}</span>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon blue">🎓</div>
                    <div className="stat-info">
                        <span className="stat-label">{t("Total Students")}</span>
                        <span className="stat-value">{data?.students?.total_students || 342}</span>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon yellow">💰</div>
                    <div className="stat-info">
                        <span className="stat-label">{t("Outstanding Fees")}</span>
                        <span className="stat-value">₹{((data?.finance?.outstanding_fees || 240000) / 100000).toFixed(1)}L</span>
                    </div>
                </div>
            </div>

            <div className="charts-grid">
                <div className="card chart-card"><h3>{t("Class-wise Performance")}</h3><div style={{ height: 240 }}><Bar data={perfData} options={chartOpts} /></div></div>
                <div className="card chart-card"><h3>{t("Student Risk Distribution")}</h3><div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Doughnut data={riskDonut} options={donutOpts} /></div></div>
            </div>

            <div className="section-label" style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🪪</span> {t("Incoming Ecosystem Transfers (Zero-Friction Onboarding)")}
            </div>
            {incomingTransfer === true ? (
                <div className="card" style={{ padding: 24, background: 'var(--bg-primary)', border: '2px dashed var(--accent)', marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>SECURE HANDSHAKE PENDING</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                                Aarav Sharma <span style={{ color: 'var(--accent)' }}>(LUMI-9428-A7X9)</span>
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                Transferring from: <strong style={{ color: 'var(--text-primary)' }}>Heritage International School</strong>
                            </div>
                            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--success)' }}>
                                ✅ Includes medical records, 5-Axis Profile (3 years data), and Exam Portfolio.
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button className="btn btn-secondary" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => setIncomingTransfer('rejected')}>Reject</button>
                            <button className="btn btn-primary" style={{ background: 'var(--accent)' }} onClick={() => setIncomingTransfer('accepted')}>🤝 Accept & Sync Portfolio</button>
                        </div>
                    </div>
                </div>
            ) : incomingTransfer === 'accepted' ? (
                <div className="card" style={{ padding: 16, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', color: 'var(--success)', marginBottom: 24, textAlign: 'center', fontSize: 14 }}>
                    ✅ Handshake Complete. Aarav Sharma has been instantly onboarded. No data entry required.
                </div>
            ) : (
                <div className="card" style={{ padding: 16, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', marginBottom: 24, textAlign: 'center', fontSize: 14 }}>
                    ❌ Transfer Request Rejected.
                </div>
            )}


            <div className="card table-card">
                <h3>📅 {t("Today's Timetable")}</h3>
                <table className="data-table">
                    <thead><tr><th>{t("Period")}</th><th>{t("Time")}</th><th>{t("Subject")}</th><th>{t("Teacher")}</th><th>{t("Status")}</th></tr></thead>
                    <tbody>
                        {demoData.timetable.map(item => (
                            <tr key={item.period} style={item.status === 'current' ? { background: 'rgba(59,130,246,0.08)' } : {}}>
                                <td>{item.period}</td><td>{item.time}</td><td className="name-cell">{item.subject}</td><td>{item.teacher}</td>
                                <td><span className={`badge ${item.status === 'completed' ? 'active' : item.status === 'current' ? 'info' : 'pending'}`}>{item.status === 'current' ? t('● Live') : t(item.status)}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

