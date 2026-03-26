import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { demoData } from '../api/client';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Attendance() {
    const { t } = useTranslation();
    const userRole = localStorage.getItem('school_role') || 'teacher';
    const isPrincipal = userRole === 'principal';
    
    const [role, setRole] = useState(isPrincipal ? 'admin' : 'teacher'); 
    const [selectedClass, setSelectedClass] = useState('Class 10');
    const [attendance, setAttendance] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    
    // Mock data for AI Insights
    const aiInsight = {
        summary: "Attendance is currently improving with a monthly average of 92%.",
        insight: "Alert: Tuesdays showing a persistent 12% dip. LUMIQ AI suggests scheduling high-engagement activities like 'Lab Practical' on these days.",
        prediction: "Predicted attendance for next week: 94% based on current engagement patterns."
    };

    const schoolOverview = {
        todayPresence: "94%",
        monthlyAvg: "91.5%",
        criticalClasses: [
            { class: "Grade 10A", attendance: 82, status: "low" },
            { class: "Grade 12B", attendance: 98, status: "excellent" },
            { class: "Grade 7C", attendance: 85, status: "low" }
        ],
        schoolWideTrend: [
            { day: 'Mon', val: 90 }, { day: 'Tue', val: 92 }, { day: 'Wed', val: 88 }, 
            { day: 'Thu', val: 94 }, { day: 'Fri', val: 95 }
        ]
    };

    const students = demoData.students.filter(s => s.class_name === selectedClass);
    const classes = [...new Set(demoData.students.map(s => s.class_name))];

    const toggle = (id, status) => {
        if (role === 'admin' || isPrincipal) return;
        setAttendance(prev => ({ ...prev, [id]: status }));
    };


    const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="page-content">
            <div className="page-header" style={{ marginBottom: 24 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <h2>📉 Attendance Intelligence</h2>
                        {!isPrincipal && (
                            <div style={{ background: 'var(--bg-secondary)', padding: '4px 12px', borderRadius: 20, display: 'flex', gap: 4 }}>
                                <button className={`btn btn-sm ${role === 'teacher' ? 'btn-primary' : ''}`} style={{ border: 'none', background: role === 'teacher' ? 'var(--accent)' : 'transparent', color: role === 'teacher' ? 'white' : 'var(--text-secondary)' }} onClick={() => setRole('teacher')}>Teacher View</button>
                                <button className={`btn btn-sm ${role === 'admin' ? 'btn-primary' : ''}`} style={{ border: 'none', background: role === 'admin' ? 'var(--accent)' : 'transparent', color: role === 'admin' ? 'white' : 'var(--text-secondary)' }} onClick={() => setRole('admin')}>Admin View</button>
                            </div>
                        )}
                        {isPrincipal && (
                            <span className="badge info" style={{ padding: '6px 12px' }}>{t ? t('Principal Overview') : 'Principal Overview'}</span>
                        )}
                    </div>
                    <p style={{ marginTop: 4 }}>{today}</p>
                </div>
                {role === 'teacher' && !isPrincipal && (
                    <button className="btn btn-primary" onClick={() => alert('Attendance saved!')}>💾 Save Attendance</button>
                )}
            </div>


            {role === 'admin' ? (
                /* Principal / Administrator View (Numerical & Graphical Overview) */
                <div style={{ display: 'grid', gap: 24 }}>
                    <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                        <div className="card stat-card">
                            <div className="stat-icon blue">👥</div>
                            <div className="stat-info">
                                <span className="stat-label">Today's Presence</span>
                                <span className="stat-value">{schoolOverview.todayPresence}</span>
                            </div>
                        </div>
                        <div className="card stat-card">
                            <div className="stat-icon purple">📊</div>
                            <div className="stat-info">
                                <span className="stat-label">Monthly Average</span>
                                <span className="stat-value">{schoolOverview.monthlyAvg}</span>
                            </div>
                        </div>
                        <div className="card stat-card">
                            <div className="stat-icon cyan">📅</div>
                            <div className="stat-info">
                                <span className="stat-label">Working Days</span>
                                <span className="stat-value">22</span>
                            </div>
                        </div>
                    </div>

                    <div className="charts-grid">
                        <div className="card" style={{ padding: 24 }}>
                            <h3 style={{ marginBottom: 20 }}>School-Wide Attendance Trend (Week)</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={schoolOverview.schoolWideTrend}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                                    <YAxis domain={[80, 100]} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="val" stroke="var(--accent)" strokeWidth={3} dot={{ r: 6, fill: 'var(--accent)', strokeWidth: 2, stroke: 'white' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="card" style={{ padding: 24 }}>
                            <h3 style={{ marginBottom: 20 }}>Critical Classes (Attention Required)</h3>
                            <div style={{ display: 'grid', gap: 16 }}>
                                {schoolOverview.criticalClasses.map((c, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 12, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                                        <div style={{ fontSize: 24 }}>{c.status === 'low' ? '⚠️' : '✅'}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600 }}>{c.class}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Status: {c.status.toUpperCase()}</div>
                                        </div>
                                        <div style={{ fontWeight: 800, color: c.status === 'low' ? 'var(--danger)' : 'var(--success)', fontSize: 20 }}>{c.attendance}%</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* Teacher View (Interactive Marking & AI Insights) */
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
                    <div>
                        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <select className="filter-select" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                                    {classes.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{students.length} students enrolled</span>
                            </div>

                            <div className="attendance-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                                {students.map(s => (
                                    <div key={s.id} className="attendance-student" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                                        <span className="student-name" style={{ fontWeight: 500 }}>{s.first_name} {s.last_name}</span>
                                        <div className="attendance-toggles" style={{ display: 'flex', gap: 4 }}>
                                            <button className={`att-toggle ${attendance[s.id] === 'P' ? 'selected-present' : ''}`} style={{ width: 32, height: 32, borderRadius: 16, border: '1px solid var(--border)', cursor: 'pointer', background: attendance[s.id] === 'P' ? 'var(--success)' : 'white', color: attendance[s.id] === 'P' ? 'white' : 'inherit' }} onClick={() => toggle(s.id, 'P')}>P</button>
                                            <button className={`att-toggle ${attendance[s.id] === 'A' ? 'selected-absent' : ''}`} style={{ width: 32, height: 32, borderRadius: 16, border: '1px solid var(--border)', cursor: 'pointer', background: attendance[s.id] === 'A' ? 'var(--danger)' : 'white', color: attendance[s.id] === 'A' ? 'white' : 'inherit' }} onClick={() => toggle(s.id, 'A')}>A</button>
                                            <button className={`att-toggle ${attendance[s.id] === 'L' ? 'selected-late' : ''}`} style={{ width: 32, height: 32, borderRadius: 16, border: '1px solid var(--border)', cursor: 'pointer', background: attendance[s.id] === 'L' ? 'var(--warning)' : 'white', color: attendance[s.id] === 'L' ? 'white' : 'inherit' }} onClick={() => toggle(s.id, 'L')}>L</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: 24 }}>
                        <div className="card" style={{ padding: 20, border: '2px solid var(--accent)', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), transparent)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <span style={{ fontSize: 20 }}>🧠</span>
                                <h3 style={{ fontSize: 16 }}>Lumiq AI Insights</h3>
                            </div>
                            <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                                <p style={{ fontWeight: 600, color: 'var(--accent)', marginBottom: 8 }}>{aiInsight.summary}</p>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>{aiInsight.insight}</p>
                                <div style={{ padding: '8px 12px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: 8, fontSize: 12, border: '1px dashed var(--accent)' }}>
                                    📈 <strong>Forecast:</strong> {aiInsight.prediction}
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ padding: 20 }}>
                            <h3 style={{ fontSize: 15, marginBottom: 16 }}>Weekly Class Trend</h3>
                            <ResponsiveContainer width="100%" height={150}>
                                <BarChart data={schoolOverview.schoolWideTrend}>
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                    <Tooltip cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                                        {schoolOverview.schoolWideTrend.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.val < 90 ? 'var(--danger)' : 'var(--accent)'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
