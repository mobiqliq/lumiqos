import { demoData } from '../api/client';
import { useTranslation } from 'react-i18next';

export default function AdminDashboard() {
    const { t } = useTranslation();
    const pipeline = demoData?.admissionsPipeline || [];
    return (
        <div className="page-content">
            <div className="page-header"><div><h2>🏢 {t("Operations Hub")}</h2><p>{t("School administration at a glance")}</p></div></div>

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className="card stat-card"><div className="stat-icon blue">🎓</div><div className="stat-info"><span className="stat-label">{t("Enrolled")}</span><span className="stat-value">342</span></div></div>
                <div className="card stat-card"><div className="stat-icon purple">👨‍🏫</div><div className="stat-info"><span className="stat-label">{t("Staff")}</span><span className="stat-value">28</span></div></div>
                <div className="card stat-card"><div className="stat-icon orange">📝</div><div className="stat-info"><span className="stat-label">{t("Applications")}</span><span className="stat-value">48</span></div></div>
                <div className="card stat-card"><div className="stat-icon green">✅</div><div className="stat-info"><span className="stat-label">{t("Compliance")}</span><span className="stat-value">96%</span></div></div>
            </div>

            <div className="charts-grid">
                <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ marginBottom: 16 }}>📋 {t("Admissions Pipeline")}</h3>
                    <div style={{ display: 'flex', gap: 12 }}>
                        {pipeline.map((s, i) => (
                            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                                <div style={{ fontSize: 36, fontWeight: 700, color: s.color }}>{s.count}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{t(s.stage)}</div>
                                <div style={{ height: 4, background: 'var(--bg-primary)', borderRadius: 2, marginTop: 8 }}>
                                    <div style={{ height: '100%', width: `${(s.count / 48) * 100}%`, background: s.color, borderRadius: 2 }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ marginBottom: 16 }}>🔑 {t("Compliance Checklist")}</h3>
                    {[t('Fire Safety Audit ✅'), t('CBSE Affiliation ✅'), t('Health Inspection ✅'), t('Staff Background Checks ✅'), t('Building Safety — Due Apr 15 ⏳')].map((c, i) => (
                        <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 14, color: c.includes('⏳') ? 'var(--warning)' : 'var(--text-secondary)' }}>{c}</div>
                    ))}
                </div>
            </div>

            <div className="card table-card">
                <h3>🚗 {t("Transport Overview")}</h3>
                <table className="data-table">
                    <thead><tr><th>{t("Route")}</th><th>{t("Bus No")}</th><th>{t("Driver")}</th><th>{t("Students")}</th><th>{t("Status")}</th></tr></thead>
                    <tbody>
                        {[{ route: t('Route A – Nehru Nagar'), bus: 'KA-01-1234', driver: 'Raju P.', students: 38, status: t('active') },
                        { route: t('Route B – MG Road'), bus: 'KA-01-5678', driver: 'Suresh K.', students: 42, status: t('active') },
                        { route: t('Route C – Koramangala'), bus: 'KA-01-9012', driver: 'Ahmed S.', students: 35, status: t('active') }
                        ].map((r, i) => (
                            <tr key={i}><td className="name-cell">{r.route}</td><td>{r.bus}</td><td>{r.driver}</td><td>{r.students}</td><td><span className="badge active">{r.status}</span></td></tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
