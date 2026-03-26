import { demoData } from '../api/client';
import InsightCard from '../components/InsightCard';
import { useTranslation } from 'react-i18next';

export default function FinanceDashboard() {
    const { t } = useTranslation();
    const insights = demoData?.insights?.finance || [];
    return (
        <div className="page-content">
            <div className="page-header"><div><h2>💰 {t("Revenue Intelligence")}</h2><p>{t("Financial overview and AI-powered projections")}</p></div></div>

            <div className="section-label">🧠 {t("Financial Insights")}</div>
            <div className="insights-grid">
                {insights.map((ins, i) => <InsightCard key={i} {...ins} />)}
            </div>

            <div className="fee-summary">
                <div className="card fee-item"><div className="fee-label">{t("Total Collected")}</div><div className="fee-amount" style={{ color: 'var(--success)' }}>₹5,10,000</div></div>
                <div className="card fee-item"><div className="fee-label">{t("Pending")}</div><div className="fee-amount" style={{ color: 'var(--warning)' }}>₹2,41,000</div></div>
                <div className="card fee-item"><div className="fee-label">{t("Overdue (>30d)")}</div><div className="fee-amount" style={{ color: 'var(--danger)' }}>₹1,80,000</div></div>
            </div>

            <div className="charts-grid">
                <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ marginBottom: 16 }}>📊 {t("Expense Breakdown")}</h3>
                    {(demoData?.expenses || []).map((e, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                            <span style={{ width: 100, fontSize: 13, fontWeight: 500 }}>{e.category}</span>
                            <div style={{ flex: 1, background: 'var(--bg-primary)', borderRadius: 4, height: 20, overflow: 'hidden' }}>
                                <div style={{ width: `${e.pct}%`, height: '100%', background: 'var(--accent)', borderRadius: 4 }} />
                            </div>
                            <span style={{ fontSize: 13, color: 'var(--text-muted)', width: 80, textAlign: 'right' }}>{e.amount}</span>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 32 }}>{e.pct}%</span>
                        </div>
                    ))}
                </div>
                <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ marginBottom: 16 }}>📈 {t("Monthly Collection Trend")}</h3>
                    {[t('Jan ₹7.2L ✅'), t('Feb ₹6.8L ✅'), t('Mar ₹5.1L (in progress)')].map((m, i) => (
                        <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', fontSize: 14, color: i === 2 ? 'var(--warning)' : 'var(--text-secondary)' }}>{m}</div>
                    ))}
                    <div style={{ marginTop: 16, padding: 16, background: 'rgba(59,130,246,0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(59,130,246,0.2)' }}>
                        <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, marginBottom: 4 }}>{t("AI FORECAST")}</div>
                        <div style={{ fontSize: 14, color: 'var(--text-primary)' }} dangerouslySetInnerHTML={{ __html: t("March projected: <strong>₹8.2L</strong> (85% of target)") }} />
                    </div>
                </div>
            </div>

            <div className="card table-card">
                <h3>{t("Salary Disbursement — March")}</h3>
                <table className="data-table">
                    <thead><tr><th>{t("Department")}</th><th>{t("Staff")}</th><th>{t("Gross")}</th><th>{t("Status")}</th></tr></thead>
                    <tbody>
                        {[{ dept: t('Teaching Staff'), staff: 18, gross: '₹3,20,000', s: t('pending') }, { dept: t('Admin Staff'), staff: 6, gross: '₹72,000', s: t('pending') }, { dept: t('Support Staff'), staff: 4, gross: '₹28,000', s: t('pending') }].map((r, i) => (
                            <tr key={i}><td className="name-cell">{r.dept}</td><td>{r.staff}</td><td>{r.gross}</td><td><span className="badge pending">{r.s}</span></td></tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
