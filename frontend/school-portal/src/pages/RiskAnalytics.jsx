import { demoData } from '../api/client';

export default function RiskAnalytics() {
    const students = demoData.students;
    const highRisk = students.filter(s => s.risk === 'high');
    const medRisk = students.filter(s => s.risk === 'medium');

    return (
        <div className="page-content">
            <div className="page-header"><div><h2>🔴 Student Risk Analytics</h2><p>AI-powered early warning system</p></div></div>

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="card stat-card"><div className="stat-icon red">🔴</div><div className="stat-info"><span className="stat-label">High Risk</span><span className="stat-value" style={{ color: 'var(--danger)' }}>{highRisk.length}</span></div></div>
                <div className="card stat-card"><div className="stat-icon yellow">🟡</div><div className="stat-info"><span className="stat-label">Medium Risk</span><span className="stat-value" style={{ color: 'var(--warning)' }}>{medRisk.length}</span></div></div>
                <div className="card stat-card"><div className="stat-icon green">🟢</div><div className="stat-info"><span className="stat-label">Low Risk</span><span className="stat-value" style={{ color: 'var(--success)' }}>{students.length - highRisk.length - medRisk.length}</span></div></div>
            </div>

            <div className="card table-card" style={{ marginBottom: 20 }}>
                <h3>⚠️ Students Requiring Intervention</h3>
                <table className="data-table">
                    <thead><tr><th>Student</th><th>Class</th><th>Attendance</th><th>Avg Score</th><th>Fee Status</th><th>Risk</th><th>Recommended Action</th></tr></thead>
                    <tbody>
                        {[...highRisk, ...medRisk].map(s => (
                            <tr key={s.id}>
                                <td className="name-cell">{s.first_name} {s.last_name}</td><td>{s.class_name}-{s.section}</td>
                                <td><span style={{ color: s.attendance < 75 ? 'var(--danger)' : 'var(--text-secondary)' }}>{s.attendance}%</span></td>
                                <td><span style={{ color: s.avgScore < 50 ? 'var(--danger)' : s.avgScore < 70 ? 'var(--warning)' : 'var(--text-secondary)' }}>{s.avgScore}%</span></td>
                                <td><span className={`badge ${s.feeStatus === 'overdue' ? 'absent' : s.feeStatus === 'pending' ? 'pending' : 'paid'}`}>{s.feeStatus}</span></td>
                                <td><span className={`badge ${s.risk === 'high' ? 'absent' : 'pending'}`}>{s.risk}</span></td>
                                <td style={{ fontSize: 12 }}>{s.risk === 'high' ? '🚨 Parent meeting + counseling' : '📞 Monitor & follow-up'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="card" style={{ padding: 24 }}>
                <h3 style={{ marginBottom: 16 }}>📊 Risk Heatmap by Class</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
                    {demoData.classes.map((c, i) => {
                        const cls = students.filter(s => s.class_name === c.name);
                        const hr = cls.filter(s => s.risk === 'high').length;
                        const mr = cls.filter(s => s.risk === 'medium').length;
                        const bg = hr > 0 ? 'rgba(239,68,68,0.2)' : mr > 0 ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)';
                        const border = hr > 0 ? 'var(--danger)' : mr > 0 ? 'var(--warning)' : 'var(--success)';
                        return (
                            <div key={i} style={{ padding: 20, background: bg, borderRadius: 'var(--radius-sm)', border: `1px solid ${border}`, textAlign: 'center' }}>
                                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{c.name.replace('Class ', 'C')}</div>
                                <div style={{ fontSize: 24, fontWeight: 800, color: hr > 0 ? 'var(--danger)' : mr > 0 ? 'var(--warning)' : 'var(--success)' }}>
                                    {hr > 0 ? `${hr}🔴` : mr > 0 ? `${mr}🟡` : '✅'}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
