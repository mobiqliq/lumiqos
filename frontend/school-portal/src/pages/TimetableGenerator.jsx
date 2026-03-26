import { useState } from 'react';
import InsightCard from '../components/InsightCard';

export default function TimetableGenerator() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [timetable, setTimetable] = useState(null);

    const handleGenerate = () => {
        setIsGenerating(true);
        setTimetable(null);
        setTimeout(() => {
            setTimetable({
                status: 'Optimal',
                conflictsResolved: 142,
                timeSaved: '~18 Hours',
                grid: [
                    { day: 'Monday', p1: 'Math', p2: 'Science', p3: 'English', p4: 'Break', p5: 'PE', p6: 'History' },
                    { day: 'Tuesday', p1: 'Science', p2: 'Math', p3: 'Art', p4: 'Break', p5: 'English', p6: 'Geography' },
                    { day: 'Wednesday', p1: 'English', p2: 'History', p3: 'Math', p4: 'Break', p5: 'Science Lab', p6: 'Science Lab' },
                    { day: 'Thursday', p1: 'Math', p2: 'English', p3: 'PE', p4: 'Break', p5: 'Computer', p6: 'Science' },
                    { day: 'Friday', p1: 'History', p2: 'Science', p3: 'Math', p4: 'Break', p5: 'Art', p6: 'English' }
                ]
            });
            setIsGenerating(false);
        }, 3000);
    };

    return (
        <div className="page-content">
            <div className="page-header" style={{ marginBottom: 24 }}>
                <div>
                    <h2>⏱️ AI Timetable Generator</h2>
                    <p>Resolve thousands of scheduling constraints in seconds to generate the optimal school-wide timetable.</p>
                </div>
            </div>

            <div className="charts-grid" style={{ gridTemplateColumns: '300px 1fr', alignItems: 'start' }}>
                <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ marginBottom: 16 }}>Constraints & Rules</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                            <input type="checkbox" defaultChecked style={{ marginTop: 4 }} />
                            <span style={{ fontSize: 13 }}><strong>Teacher Availability</strong><br />Respect part-time hours and requested days off.</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                            <input type="checkbox" defaultChecked style={{ marginTop: 4 }} />
                            <span style={{ fontSize: 13 }}><strong>Lab/Resource Limits</strong><br />Ensure only one class uses the Science Lab or Computer Room at a time.</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                            <input type="checkbox" defaultChecked style={{ marginTop: 4 }} />
                            <span style={{ fontSize: 13 }}><strong>Pedagogical Spread</strong><br />Avoid scheduling double periods of heavy subjects (e.g., Math) back-to-back unless requested.</span>
                        </label>

                        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={handleGenerate} disabled={isGenerating}>
                            {isGenerating ? '⏱️ Solving Constraints...' : '✨ Auto-Generate Timetable'}
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {isGenerating && (
                        <div className="card" style={{ padding: 64, textAlign: 'center', background: 'var(--bg-primary)' }}>
                            <div style={{ fontSize: 48, marginBottom: 16 }} className="spin-animation">⚙️</div>
                            <h3>Running Constraint Satisfaction Algorithm...</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Evaluating 150,000+ permutations across 40 teachers and 25 classrooms.</p>
                        </div>
                    )}

                    {!isGenerating && !timetable && (
                        <div className="card" style={{ padding: 48, textAlign: 'center', border: '2px dashed var(--border)' }}>
                            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>📅</div>
                            <h3 style={{ color: 'var(--text-secondary)' }}>Ready to Generate</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Select your constraints and click generate to build the master schedule.</p>
                        </div>
                    )}

                    {timetable && (
                        <>
                            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                                <div className="card stat-card"><div className="stat-icon green">✅</div><div className="stat-info"><span className="stat-label">Status</span><span className="stat-value">{timetable.status}</span></div></div>
                                <div className="card stat-card"><div className="stat-icon purple">🧩</div><div className="stat-info"><span className="stat-label">Conflicts Resolved</span><span className="stat-value">{timetable.conflictsResolved}</span></div></div>
                                <div className="card stat-card"><div className="stat-icon blue">⏳</div><div className="stat-info"><span className="stat-label">Est. Time Saved</span><span className="stat-value">{timetable.timeSaved}</span></div></div>
                            </div>

                            <div className="card" style={{ padding: 24, overflowX: 'auto' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                    <h3>Class 10-A Master Schedule</h3>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <select className="form-input" style={{ width: 'auto', padding: '4px 8px', fontSize: 13 }}>
                                            <option>Class 10-A</option>
                                            <option>Class 10-B</option>
                                        </select>
                                        <button className="btn btn-sm btn-primary">Export to PDF / Calendar</button>
                                    </div>
                                </div>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Day</th>
                                            <th>P1 (8:00)</th>
                                            <th>P2 (8:45)</th>
                                            <th>P3 (9:30)</th>
                                            <th style={{ background: 'var(--bg-secondary)', textAlign: 'center' }}>Break</th>
                                            <th>P4 (11:00)</th>
                                            <th>P5 (11:45)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {timetable.grid.map((row, i) => (
                                            <tr key={i}>
                                                <td style={{ fontWeight: 600 }}>{row.day}</td>
                                                <td>{row.p1}</td>
                                                <td>{row.p2}</td>
                                                <td>{row.p3}</td>
                                                <td style={{ background: 'var(--bg-secondary)', textAlign: 'center', color: 'var(--text-muted)' }}>☕</td>
                                                <td style={row.p5.includes('Lab') ? { background: 'rgba(59,130,246,0.1)', color: 'var(--accent)', fontWeight: 600 } : {}}>{row.p5}</td>
                                                <td style={row.p6.includes('Lab') ? { background: 'rgba(59,130,246,0.1)', color: 'var(--accent)', fontWeight: 600 } : {}}>{row.p6}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
