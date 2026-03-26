import { useState } from 'react';
import { demoData } from '../api/client';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ReportCards() {
    const { t } = useTranslation();
    const role = localStorage.getItem('school_role');
    const isPrincipal = role === 'principal';
    const isReadOnly = role === 'parent' || role === 'student' || isPrincipal;
    const [generated, setGenerated] = useState(isReadOnly || isPrincipal);
    const [isSigned, setIsSigned] = useState(false);
    
    const fallbackCards = [
        { subject: 'Physics', midterm: 88, final: 94, grade: 'A1', remarks: 'Exceptional analytical skills. Top 1% of class.' },
        { subject: 'Mathematics', midterm: 82, final: 91, grade: 'A1', remarks: 'Strong problem solving. Advanced Algebra gap closed.' },
        { subject: 'Chemistry', midterm: 78, final: 85, grade: 'A2', remarks: 'Consistent growth. Lab work is excellent.' },
        { subject: 'English', midterm: 85, final: 88, grade: 'A2', remarks: 'Creative writing is a core strength.' },
        { subject: 'Hindi', midterm: 72, final: 76, grade: 'B1', remarks: 'Grammar alignment module active.' }
    ];

    const cards = demoData.reportCards?.length > 0 ? demoData.reportCards : fallbackCards;
    const total = cards.reduce((s, c) => s + c.final, 0);
    const avg = Math.round(total / (cards.length || 1));

    const longitudinalData = [
        { term: 'Grade 8 (Final)', score: 72 },
        { term: 'Grade 9 (Final)', score: 78 },
        { term: 'Grade 10 (Term 1)', score: 82 },
        { term: 'Current Baseline', score: 84 },
        { term: 'Board Prediction', score: 89, isFuture: true },
    ];

    return (
        <div className="page-container" style={{ maxWidth: '1400px', padding: '0 40px 40px' }}>
            <header style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '40px',
                paddingTop: '32px'
            }}>
                <div style={{ position: 'relative', width: '400px' }}>
                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                    <input 
                        type="text" 
                        placeholder="Search or command...  ⌘K" 
                        style={{ 
                            width: '100%', 
                            padding: '12px 16px 12px 48px', 
                            background: '#0b1120', 
                            border: '1px solid var(--border)', 
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '14px'
                        }} 
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px' }}>
                        <span style={{ position: 'relative' }}>
                            🔔
                            <div style={{ position: 'absolute', top: '2px', right: '2px', width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '50%', border: '2px solid var(--bg-primary)' }}></div>
                        </span>
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--border)' }}>
                            <img src={isPrincipal ? "https://ui-avatars.com/api/?name=Principal&background=8b5cf6&color=fff" : "https://ui-avatars.com/api/?name=User&background=3b82f6&color=fff"} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    </div>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
                <div className="card card-glow-blue" style={{ padding: '24px', borderRadius: '16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: '4px' }}>Total Marks</div>
                    <div style={{ fontSize: '24px', fontWeight: 800 }}>{total}/{cards.length * 100}</div>
                </div>
                <div className="card card-glow-amber" style={{ padding: '24px', borderRadius: '16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: '4px' }}>Average</div>
                    <div style={{ fontSize: '24px', fontWeight: 800 }}>{avg}%</div>
                </div>
                <div className="card card-glow-purple" style={{ padding: '24px', borderRadius: '16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: '4px' }}>Attendance</div>
                    <div style={{ fontSize: '24px', fontWeight: 800 }}>96%</div>
                </div>
                <div className="card card-glow-emerald" style={{ padding: '24px', borderRadius: '16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: '4px' }}>Class Rank</div>
                    <div style={{ fontSize: '24px', fontWeight: 800 }}>#2 of 32</div>
                </div>
            </div>

            {!generated ? (
                <div className="card card-glow-purple" style={{ padding: 64, textAlign: 'center', margin: '40px auto', maxWidth: '600px' }}>
                    <div style={{ fontSize: 64, marginBottom: 24 }}>🤖</div>
                    <h3 style={{ marginBottom: 12, fontSize: '24px' }}>{t("Auto-Generate Report Cards")}</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 32, lineHeight: '1.6' }}>
                        {t("LumiqOS AI will compile grades, attendance data, and teacher remarks into professional report cards for all students across Greenfield Academy.")}
                    </p>
                    <button className="btn btn-primary btn-lg" onClick={() => setGenerated(true)} style={{ padding: '16px 32px' }}>{t("Generate for Class 10A")}</button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
                    <div className="card" style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                            <div>
                                <h3 style={{ fontSize: 20, margin: 0 }}>Greenfield Academy</h3>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Academic Year 2025-26 | Term 2</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 15, fontWeight: 700 }}>Aarav Sharma</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Class 10-A | Roll No: 1</div>
                            </div>
                        </div>

                        <table className="data-table">
                            <thead><tr><th>{t("Subject")}</th><th>{t("Mid-Term")}</th><th>{t("Final")}</th><th>{t("Grade")}</th></tr></thead>
                            <tbody>
                                {cards.map((c, i) => (
                                    <tr key={i}>
                                        <td className="name-cell">{t(c.subject)}</td>
                                        <td>{c.midterm}</td>
                                        <td style={{ fontWeight: 600, color: c.final >= 85 ? 'var(--success)' : 'var(--text-primary)' }}>{c.final}</td>
                                        <td><span className={`badge ${c.final >= 85 ? 'active' : 'pending'}`}>{c.grade}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                            <button className="btn btn-primary">📥 {t("Download PDF")}</button>
                            <button className="btn btn-secondary">🖨️ {t("Print")}</button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div className="card card-glow-purple" style={{ padding: '24px' }}>
                            <h4 style={{ margin: '0 0 16px', fontSize: '14px', textTransform: 'uppercase', color: 'var(--accent)' }}>🤖 AI Summary</h4>
                            <p style={{ fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                                Aarav demonstrates consistent academic excellence. Strong in STEM (Avg 94%). Recommend Science Olympiad.
                            </p>
                        </div>

                        <div className="card" style={{ padding: '24px' }}>
                            <h4 style={{ margin: '0 0 16px', fontSize: '14px', textTransform: 'uppercase' }}>📈 Longitudinal Progression</h4>
                            <div style={{ height: '200px', width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={longitudinalData}>
                                        <Line type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={3} dot={{ r: 4 }} />
                                        <XAxis dataKey="term" hide />
                                        <YAxis hide domain={[60, 100]} />
                                        <RechartsTooltip contentStyle={{ background: '#0b1120', border: 'none', borderRadius: '8px' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
