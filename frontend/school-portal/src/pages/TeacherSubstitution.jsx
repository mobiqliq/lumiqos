import { useState, useEffect } from 'react';
import InsightCard from '../components/InsightCard';

export default function TeacherSubstitution() {
    const [absences, setAbsences] = useState([]);
    const [allocations, setAllocations] = useState([]);
    const [isAllocating, setIsAllocating] = useState(false);
    const [isNotifying, setIsNotifying] = useState(false);
    const [notificationSuccess, setNotificationSuccess] = useState(false);

    useEffect(() => {
        // Mock fetch from backend GET /substitution/absences
        setAbsences([
            {
                id: 'abs_001',
                teacher_id: 'usr_t_004',
                teacher_name: 'Mr. Brown',
                reason: 'Sick Leave',
                status: 'pending_allocation',
                impacted_periods: [
                    { period: 1, class: 'Class 10A', subject: 'Social Studies', time: '09:00 AM - 09:45 AM' },
                    { period: 2, class: 'Class 9B', subject: 'Social Studies', time: '09:45 AM - 10:30 AM' },
                    { period: 6, class: 'Class 8A', subject: 'History', time: '01:00 PM - 01:45 PM' }
                ]
            }
        ]);
    }, []);

    const handleAllocate = () => {
        setIsAllocating(true);
        // Mock API call to POST /substitution/allocate
        setTimeout(() => {
            setAllocations([
                { period: 1, class: 'Class 10A', subject: 'Social Studies', original_teacher: 'Mr. Brown', allocated_substitute: 'Mrs. Davis', substitute_id: 'usr_t_002', match_confidence: 'High' },
                { period: 2, class: 'Class 9B', subject: 'Social Studies', original_teacher: 'Mr. Brown', allocated_substitute: 'Mr. Smith', substitute_id: 'usr_t_003', match_confidence: 'Medium' },
                { period: 6, class: 'Class 8A', subject: 'History', original_teacher: 'Mr. Brown', allocated_substitute: 'Ms. Johnson', substitute_id: 'usr_t_005', match_confidence: 'High' }
            ]);
            setIsAllocating(false);
        }, 1500);
    };

    const handleNotify = () => {
        setIsNotifying(true);
        // Mock API call to POST /substitution/notify
        setTimeout(() => {
            setIsNotifying(false);
            setNotificationSuccess(true);
            setTimeout(() => setNotificationSuccess(false), 3000);
        }, 1000);
    };

    if (absences.length === 0) return <div className="page-content">Loading...</div>;

    const currentAbsence = absences[0]; // Focusing on the first one for demo

    return (
        <div className="page-content">
            <div className="page-header">
                <div>
                    <h2>🔄 Smart Teacher Substitution</h2>
                    <p>Real-time absence tracking and AI-driven substitute allocation.</p>
                </div>
            </div>

            <div className="charts-grid" style={{ gridTemplateColumns: '1fr 2fr', alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div className="card" style={{ padding: 24, borderLeft: '4px solid var(--danger)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3 style={{ margin: 0 }}>🚨 Immediate Attention</h3>
                            <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>1 Absence Today</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👨‍🏫</div>
                            <div>
                                <div style={{ fontWeight: 600 }}>{currentAbsence.teacher_name}</div>
                                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Reason: {currentAbsence.reason}</div>
                            </div>
                        </div>

                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                            <strong>{currentAbsence.impacted_periods.length} Periods Impacted:</strong>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {currentAbsence.impacted_periods.map((p, i) => (
                                <div key={i} style={{ padding: 12, background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>Period {p.period} • <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>{p.class}</span></div>
                                        <div style={{ color: 'var(--text-secondary)' }}>{p.subject}</div>
                                    </div>
                                    <div style={{ color: 'var(--text-secondary)', textAlign: 'right' }}>
                                        {p.time}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', marginTop: 24 }}
                            onClick={handleAllocate}
                            disabled={isAllocating || allocations.length > 0}
                        >
                            {isAllocating ? '🧠 AI Calculating Logistics...' : '✨ Find Available Substitutes'}
                        </button>
                    </div>

                    <InsightCard
                        type="action"
                        icon="🤖"
                        title="How AI Allocation Works"
                        body="XceliQOS scans the school-wide timetable for teachers who have a 'free period' during the impacted times, prioritizing those who teach related subjects."
                    />
                </div>

                <div className="card" style={{ padding: 32, minHeight: 400 }}>
                    <h3 style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>✅</span> Proposed Substitution Roster
                    </h3>

                    {allocations.length === 0 && !isAllocating && (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px 0' }}>
                            <div style={{ fontSize: 48, marginBottom: 16 }}>🗓️</div>
                            <p>Click "Find Available Substitutes" to let AI calculate the optimal replacements for Mr. Brown.</p>
                        </div>
                    )}

                    {isAllocating && (
                        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '60px 0' }}>
                            <div style={{ fontSize: 48, marginBottom: 16 }} className="spin-animation">⚙️</div>
                            <p>Analyzing master timetable and teacher schedules...</p>
                        </div>
                    )}

                    {allocations.length > 0 && (
                        <div className="fade-in">
                            <table className="data-table" style={{ marginBottom: 24 }}>
                                <thead>
                                    <tr>
                                        <th>Period</th>
                                        <th>Class / Subject</th>
                                        <th>Assigned Substitute</th>
                                        <th>Subject Match</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allocations.map((a, i) => (
                                        <tr key={i}>
                                            <td style={{ fontWeight: 600 }}>{a.period}</td>
                                            <td>
                                                <div>{a.class}</div>
                                                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{a.subject}</div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>👤</div>
                                                    <span style={{ fontWeight: 500 }}>{a.allocated_substitute}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge active`} style={{
                                                    background: a.match_confidence === 'High' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                                    color: a.match_confidence === 'High' ? 'var(--success)' : 'var(--warning)'
                                                }}>
                                                    {a.match_confidence}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16, borderTop: '1px solid var(--border)', paddingTop: 24 }}>
                                {notificationSuccess && (
                                    <span style={{ color: 'var(--success)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <span>🟢</span> Push notifications sent directly to teachers' phones!
                                    </span>
                                )}
                                <button className="btn btn-secondary" onClick={() => setAllocations([])}>Reset</button>
                                <button
                                    className="btn btn-primary"
                                    style={{ background: 'var(--success)' }}
                                    onClick={handleNotify}
                                    disabled={isNotifying || notificationSuccess}
                                >
                                    {isNotifying ? 'Sending Alerts...' : 'Confirm & Notify Teachers 📱'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
