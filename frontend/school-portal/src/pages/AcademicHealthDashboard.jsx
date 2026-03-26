import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export default function AcademicHealthDashboard() {
    const { t } = useTranslation();
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const schoolId = localStorage.getItem('school_id') || 'd4c837bd-ea38-42ca-a99f-ffddf2e148a8';
    const academicYearId = localStorage.getItem('academic_year_id') || '6d8d8542-d7bd-40f9-b7e6-3073bc55d741';

    const [dailyInsights, setDailyInsights] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [healthRes, insightsRes] = await Promise.all([
                    axios.get(`/api/academic-planning/health-summary?school_id=${schoolId}&academic_year_id=${academicYearId}`),
                    axios.get(`/api/academic-planning/daily-insights?school_id=${schoolId}&academic_year_id=${academicYearId}`)
                ]);
                setData(healthRes.data);
                setDailyInsights(insightsRes.data);
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [schoolId, academicYearId]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'ON_TRACK': return 'var(--success)';
            case 'NOT_STARTED': return '#64748b'; // Slate
            case 'AT_RISK': return 'var(--warning)';
            case 'DELAYED': return 'var(--danger)';
            default: return 'var(--text-muted)';
        }
    };

    if (isLoading) return <div className="page-content"><div className="spinner"></div> {t("Analyzing academic health...")}</div>;

    if (data?.status === 'NO_BASELINE') {
        return (
            <div className="page-content">
                <div className="card empty-state" style={{ textAlign: 'center', padding: '80px 40px', marginTop: 40 }}>
                    <div style={{ fontSize: 64, marginBottom: 24 }}>🏁</div>
                    <h3>{t("No approved academic plans yet.")}</h3>
                    <p style={{ color: 'var(--text-muted)', maxWidth: 500, margin: '16px auto 24px' }}>
                        {t("Academic health tracking requires baseline plans to be approved. Generate and approve an academic plan to start tracking progress.")}
                    </p>
                    <button 
                        className="btn btn-primary"
                        onClick={() => window.location.href = '/curriculum'}
                    >
                        {t("Go to Curriculum Portal")}
                    </button>
                </div>
            </div>
        );
    }

    if (data?.status === 'NO_EXECUTION_DATA') {
        return (
            <div className="page-content">
                <div className="card empty-state" style={{ textAlign: 'center', padding: '80px 40px', marginTop: 40 }}>
                    <div style={{ fontSize: 64, marginBottom: 24 }}>📊</div>
                    <h3>{t("Tracking has not started yet.")}</h3>
                    <p style={{ color: 'var(--text-muted)', maxWidth: 500, margin: '16px auto 24px' }}>
                        {t("Baseline plans are approved, but teachers have not recorded lesson progress yet. Tracking will begin once topics are marked complete in the classroom.")}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-content">
            <div className="page-header">
                <div>
                    <h2>📈 {t("Academic Health Dashboard")}</h2>
                    <p>{t("School-wide syllabus completion and risk monitoring")}</p>
                </div>
            </div>

            {/* 0. Today's Guidance Section */}
            {dailyInsights.length > 0 && (
                <div style={{ marginBottom: 32 }}>
                    <h3 style={{ fontSize: 18, marginBottom: 16 }}>🎯 {t("Today's Guidance")}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                        {dailyInsights.map((insight, idx) => (
                            <div key={idx} className="card" style={{ 
                                padding: 20, 
                                borderTop: `4px solid ${insight.risk_status === 'HIGH' ? 'var(--danger)' : insight.risk_status === 'MEDIUM' ? 'var(--warning)' : 'var(--success)'}`,
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 700 }}>{insight.class_name}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{insight.subject_name}</div>
                                    </div>
                                    <span style={{ 
                                        fontSize: 10, 
                                        fontWeight: 800, 
                                        padding: '4px 8px', 
                                        borderRadius: 4, 
                                        backgroundColor: insight.risk_status === 'HIGH' ? '#fee2e2' : insight.risk_status === 'MEDIUM' ? '#fef3c7' : '#dcfce7',
                                        color: insight.risk_status === 'HIGH' ? '#991b1b' : insight.risk_status === 'MEDIUM' ? '#92400e' : '#166534'
                                    }}>
                                        {insight.risk_status} RISK
                                    </span>
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                                    <div style={{ backgroundColor: '#f8fafc', padding: 8, borderRadius: 6 }}>
                                        <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Today's Plan</div>
                                        <div style={{ fontSize: 14, fontWeight: 700 }}>{insight.today_plan}</div>
                                    </div>
                                    <div style={{ backgroundColor: insight.pending_topics > 0 ? '#fff1f2' : '#f8fafc', padding: 8, borderRadius: 6 }}>
                                        <div style={{ fontSize: 10, color: insight.pending_topics > 0 ? '#991b1b' : 'var(--text-muted)', textTransform: 'uppercase' }}>Pending</div>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: insight.pending_topics > 0 ? 'var(--danger)' : 'inherit' }}>{insight.pending_topics}</div>
                                    </div>
                                </div>

                                <div style={{ 
                                    padding: '12px', 
                                    backgroundColor: 'var(--accent)', 
                                    color: 'white', 
                                    borderRadius: 8,
                                    fontSize: 13,
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10
                                }}>
                                    <span>⚡</span>
                                    {insight.action}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 1. Overall Progress Card */}
            <div className="card" style={{ padding: 24, marginBottom: 24, background: 'linear-gradient(135deg, var(--accent) 0%, #1e293b 100%)', color: 'white' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 40, alignItems: 'center' }}>
                    <div style={{ textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ fontSize: 48, fontWeight: 900 }}>{data?.overall_completion_percentage}%</div>
                        <div style={{ fontSize: 13, opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1 }}>{t("Overall Completion")}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 24, fontWeight: 800 }}>{data?.on_track_count}</div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--success-bg)' }}>{t("ON TRACK")}</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 24, fontWeight: 800 }}>{data?.at_risk_count}</div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--warning-bg)' }}>{t("AT RISK")}</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 24, fontWeight: 800, color: '#fca5a5' }}>{data?.delayed_count}</div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#fca5a5' }}>{t("DELAYED / NOT STARTED")}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
                {/* 2. Class-wise Table */}
                <div className="card" style={{ padding: 20 }}>
                    <h3 style={{ fontSize: 16, marginBottom: 16 }}>{t("Class-wise Academic Status")}</h3>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>{t("Class")}</th>
                                <th>{t("Subject")}</th>
                                <th>{t("Expected")}</th>
                                <th>{t("Completed")}</th>
                                <th>{t("Gap")}</th>
                                <th>{t("Progress")}</th>
                                <th>{t("Status")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.class_summary?.map((c, idx) => (
                                <tr key={idx}>
                                    <td style={{ fontWeight: 700 }}>{c.class_name}</td>
                                    <td>{c.subject_name}</td>
                                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{c.expected_topics_by_today}</td>
                                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{c.completed_topics}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span style={{ 
                                            fontWeight: 800, 
                                            color: c.gap > 2 ? 'var(--danger)' : c.gap > 0 ? 'var(--warning)' : 'var(--success)'
                                        }}>
                                            {c.gap > 0 ? `-${c.gap}` : '0'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ flex: 1, height: 6, backgroundColor: '#eee', borderRadius: 3, overflow: 'hidden' }}>
                                                <div style={{ width: `${c.completion_percentage}%`, height: '100%', backgroundColor: getStatusColor(c.status) }}></div>
                                            </div>
                                            <span style={{ fontSize: 12, fontWeight: 600 }}>{c.completion_percentage}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge`} style={{ 
                                            backgroundColor: `${getStatusColor(c.status)}20`, 
                                            color: getStatusColor(c.status),
                                            border: `1px solid ${getStatusColor(c.status)}`
                                        }}>
                                            {t(c.status)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 3. Attention Required */}
                <div className="card" style={{ padding: 20 }}>
                    <h3 style={{ fontSize: 16, marginBottom: 16, color: 'var(--danger)' }}>{t("Attention Required")}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {data?.class_summary?.filter(c => c.status !== 'ON_TRACK').length > 0 ? (
                            data.class_summary.filter(c => c.status !== 'ON_TRACK').map((c, idx) => (
                                <div key={idx} style={{ padding: 12, borderLeft: `4px solid ${getStatusColor(c.status)}`, backgroundColor: `${getStatusColor(c.status)}05`, borderRadius: '0 8px 8px 0' }}>
                                    <div style={{ fontSize: 13, fontWeight: 700 }}>{c.class_name} - {c.subject_name}</div>
                                    <div style={{ fontSize: 12, color: getStatusColor(c.status), marginTop: 4 }}>
                                        {c.status === 'NOT_STARTED' ? t("No topics completed yet") : c.delay?.label}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                                <p>{t("All classes are currently on track.")}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
