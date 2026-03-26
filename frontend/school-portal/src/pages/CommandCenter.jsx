import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function CommandCenter() {
    const { t } = useTranslation();
    const role = (localStorage.getItem('school_role') || 'principal').toLowerCase();
    
    // Premium Glow Metrics (Refined)
    const metrics = [
        { label: 'Attendance', value: '94.2%', trend: '+0.4%', grad: 'kpi-blue' },
        { label: 'Revenue', value: '₹4.2M', trend: 'STABLE', grad: 'kpi-amber' },
        { label: 'Academic Health', value: '88/100', trend: 'AUDIT_READY', grad: 'kpi-purple' },
        { label: 'Staff Load', value: '82%', trend: '-2.1%', grad: 'kpi-emerald' }
    ];

    return (
        <div style={{ animation: 'reveal 0.6s ease-out' }}>
            {/* Header: Institutional Context */}
            <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="h1" style={{ marginBottom: '8px' }}>Command Cockpit</h1>
                    <div className="label" style={{ color: 'var(--text-secondary)' }}>Institutional Overview // Tier_1 Analytics</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div className="mono" style={{ fontSize: '11px', color: '#fbbf24', fontWeight: '700' }}>SESSION_ACTIVE_V2.4</div>
                    <div className="label" style={{ marginTop: '4px' }}>Academic Year 2026-27</div>
                </div>
            </header>

            {/* KPI Grid: Radiant HUD Units */}
            <div className="grid-4" style={{ marginBottom: '48px' }}>
                {metrics.map((m, i) => (
                    <div key={i} className={`kpi-gradient ${m.grad}`}>
                        <div className="aura" />
                        <div className="label">{m.label}</div>
                        <div className="value">{m.value}</div>
                        <div className="mono" style={{ fontSize: '9px', fontWeight: '800', marginTop: '12px', opacity: 0.7 }}>
                            TREND_{m.trend}
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Operational View */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '40px' }}>
                {/* Left: Performance Visualization */}
                <section>
                    <div className="card-glow" style={{ height: '440px', display: 'flex', flexDirection: 'column' }}>
                        <div className="flex-between" style={{ marginBottom: '32px' }}>
                             <div>
                                <h2 className="h2" style={{ marginBottom: '4px' }}>Baseline Trajectory</h2>
                                <div className="label" style={{ opacity: 0.4 }}>Academic Performance Streams</div>
                             </div>
                             <button style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: '#fff', fontSize: '11px', fontWeight: '800' }}>EXPORT_DATA</button>
                        </div>
                        <div style={{ flex: 1, position: 'relative', background: 'rgba(0,0,0,0.15)', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                             <div className="mono" style={{ opacity: 0.1, fontSize: '10px', textAlign: 'center', lineHeight: '1.8' }}>
                                [ NEURAL_CORE_READY ]<br/>
                                RENDERING_ACADEMIC_DATA_STREAM...<br/>
                                /VOL/ACADEMIC/V17_TRAJECTORY_STABLE
                             </div>
                        </div>
                    </div>
                </section>

                {/* Right: Operational Insights */}
                <section style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div className="card-glow" style={{ padding: '24px' }}>
                        <div className="label" style={{ marginBottom: '24px' }}>Compliance Status</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                            <div style={{ width: '88px', height: '88px', filter: 'drop-shadow(0 0 12px rgba(59, 130, 246, 0.4))' }}>
                                <Doughnut 
                                    data={{
                                        datasets: [{
                                            data: [88, 12],
                                            backgroundColor: ['#3b82f6', 'rgba(255,255,255,0.03)'],
                                            borderWidth: 0, cutout: '80%'
                                        }]
                                    }}
                                    options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }}
                                />
                            </div>
                            <div>
                                <div className="mono" style={{ fontSize: '28px', fontWeight: '800', color: '#fff' }}>88%</div>
                                <div className="label" style={{ opacity: 0.5, marginTop: '2px' }}>NEP Compliance</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ background: 'rgba(251, 191, 36, 0.02)', border: '1px solid rgba(251, 191, 36, 0.15)', borderRadius: '20px', padding: '24px', position: 'relative' }}>
                        <div className="label" style={{ color: '#fbbf24', marginBottom: '16px' }}>Intelligence Signal</div>
                        <h3 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '8px', color: '#fff' }}>Velocity Divergence</h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                            Grade 10 Physics tracking -12% below baseline. Syllabus bottleneck detected in Unit 4.
                        </p>
                        <button style={{ marginTop: '24px', width: '100%', padding: '12px', borderRadius: '10px', background: '#fbbf24', color: '#000', fontWeight: '900', fontSize: '11px', border: 'none', cursor: 'pointer', boxShadow: '0 0 20px rgba(251, 191, 36, 0.2)' }}>
                            RESOLVE_PATH
                        </button>
                    </div>
                </section>
            </div>

            {/* Health Matrix: Multi-Institutional View */}
            <div className="card-glow" style={{ marginTop: '40px', padding: '0' }}>
                <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)' }}>
                    <h3 className="h2" style={{ fontSize: '16px' }}>Executive Institutional Matrix</h3>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'rgba(0,0,0,0.1)' }}>
                            <th className="label" style={{ textAlign: 'left', padding: '14px 32px', opacity: 0.4 }}>Institution</th>
                            <th className="label" style={{ textAlign: 'left', padding: '14px 32px', opacity: 0.4 }}>Principal</th>
                            <th className="label" style={{ textAlign: 'left', padding: '14px 32px', opacity: 0.4 }}>Health_Score</th>
                            <th className="label" style={{ textAlign: 'right', padding: '14px 32px', opacity: 0.4 }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            { name: 'Greenfield Academy', lead: 'Sarah Ahmed', score: '92.4%', status: 'STABLE', color: '#10b981' },
                            { name: 'Silicon Valley Public', lead: 'David Chen', score: '88.1%', status: 'LIVE', color: '#3b82f6' },
                            { name: 'Heritage Academy', lead: 'Indu Rao', score: '85.6%', status: 'REVIEW', color: '#f59e0b' }
                        ].map((row, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '18px 32px', fontWeight: '700', fontSize: '14px' }}>{row.name}</td>
                                <td style={{ padding: '18px 32px', color: 'var(--text-secondary)', fontSize: '13px' }}>{row.lead}</td>
                                <td style={{ padding: '18px 32px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ flex: 1, width: '120px', height: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '2px' }}>
                                            <div style={{ width: row.score, height: '100%', background: row.color, borderRadius: '2px', boxShadow: `0 0 8px ${row.color}66` }} />
                                        </div>
                                        <span className="mono" style={{ fontSize: '11px', color: row.color, fontWeight: '700' }}>{row.score}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '18px 32px', textAlign: 'right' }}>
                                    <span className="mono" style={{ 
                                        fontSize: '10px', fontWeight: '800', padding: '4px 10px', 
                                        borderRadius: '6px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
                                        color: row.color
                                    }}>{row.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
