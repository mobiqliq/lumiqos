import { demoData } from '../api/client';
import InsightCard from '../components/InsightCard';
import { useTranslation } from 'react-i18next';

export default function HRDashboard() {
    const { t } = useTranslation();
    const insights = demoData?.insights?.hr || [];
    const teachers = demoData?.teachers || [];
    return (
        <div className="page-content">
            <div className="page-header"><div><h2>👤 {t("People & Culture")}</h2><p>{t("Staff management and HR intelligence")}</p></div></div>

            <div className="section-label">🧠 {t("HR Insights")}</div>
            <div className="insights-grid">
                {insights.map((ins, i) => <InsightCard key={i} {...ins} />)}
            </div>

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className="card stat-card"><div className="stat-icon purple">👨‍🏫</div><div className="stat-info"><span className="stat-label">{t("Total Staff")}</span><span className="stat-value">28</span></div></div>
                <div className="card stat-card"><div className="stat-icon green">✅</div><div className="stat-info"><span className="stat-label">{t("Present Today")}</span><span className="stat-value">26</span></div></div>
                <div className="card stat-card"><div className="stat-icon orange">🏖️</div><div className="stat-info"><span className="stat-label">{t("On Leave")}</span><span className="stat-value">2</span></div></div>
                <div className="card stat-card"><div className="stat-icon blue">📋</div><div className="stat-info"><span className="stat-label">{t("Vacancies")}</span><span className="stat-value">1</span></div></div>
            </div>

            <div className="card table-card" style={{ marginBottom: 20 }}>
                <h3>{t("Staff Leave Tracker")}</h3>
                <table className="data-table">
                    <thead><tr><th>{t("Name")}</th><th>{t("Subject")}</th><th>{t("Leaves Used")}</th><th>{t("Balance")}</th><th>{t("Status")}</th><th>{t("Rating")}</th></tr></thead>
                    <tbody>
                        {teachers.map(teacher => (
                            <tr key={teacher.id}>
                                <td className="name-cell">{teacher.name}</td><td>{teacher.subject}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 80, height: 6, background: 'var(--bg-primary)', borderRadius: 3 }}>
                                            <div style={{ width: `${(teacher.leavesTaken / teacher.leavesTotal) * 100}%`, height: '100%', borderRadius: 3, background: teacher.leavesTaken > 10 ? 'var(--danger)' : teacher.leavesTaken > 5 ? 'var(--warning)' : 'var(--success)' }} />
                                        </div>
                                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{teacher.leavesTaken}/{teacher.leavesTotal}</span>
                                    </div>
                                </td>
                                <td>{teacher.leavesTotal - teacher.leavesTaken}</td>
                                <td><span className={`badge ${teacher.status === 'on-leave' ? 'pending' : 'active'}`}>{t(teacher.status)}</span></td>
                                <td><span style={{ color: 'var(--warning)' }}>{'⭐'.repeat(Math.round(teacher.rating))}</span> <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{teacher.rating}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="card" style={{ padding: 24 }}>
                <h3 style={{ marginBottom: 16 }}>📋 {t("Recruitment Pipeline")}</h3>
                <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{t("Physics Teacher — Senior Position")}</div>
                    <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--text-secondary)' }}>
                        <span>{t("📅 Open: 45 days")}</span><span>{t("📩 Applications: 12")}</span><span>{t("✅ Shortlisted: 3")}</span><span>{t("📞 Interviewed: 1")}</span>
                    </div>
                    <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                        <button className="btn btn-sm btn-primary">{t("Review Applications")}</button>
                        <button className="btn btn-sm btn-secondary">{t("Schedule Interview")}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
