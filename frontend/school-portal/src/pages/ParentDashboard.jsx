import { useState } from 'react';
import { demoData } from '../api/client';
import InsightCard from '../components/InsightCard';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import axios from 'axios';

export default function ParentDashboard() {
    const { t } = useTranslation();
    const [pin, setPin] = useState(null);
    const [dynamicInsights, setDynamicInsights] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const child = demoData?.students?.[0] || { admission_number: 'PENDING', avgScore: 0, attendance: 0 }; 
    const insights = demoData?.insights?.parent || [];
    const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
    const attData = [95, 100, 88, 92, 96, 100, 96, 92, 100, 96, 92, 96];


    useEffect(() => {
        const fetchInsights = async () => {
            try {
                // Using hardcoded student ID for Aarav for demo purposes
                // In production, this would come from the logged-in parent's child relation
                const res = await axios.get('/api/curriculum/parent/insights/student-aarav-id');
                setDynamicInsights(res.data);
            } catch (err) {
                console.error("Failed to fetch parent insights", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInsights();
    }, []);

    const skillData = [
        { subject: t('Cognitive'), A: 85, fullMark: 100 },
        { subject: t('Creative'), A: 70, fullMark: 100 },
        { subject: t('Physical'), A: 45, fullMark: 100 },
        { subject: t('EQ (Social)'), A: 60, fullMark: 100 },
        { subject: t('Life Skills'), A: 50, fullMark: 100 },
    ];

    return (
        <div className="page-content">
            <div className="page-header"><div><h2>👪 {t("Aarav's Dashboard")}</h2><p>{t("Class 10A — Admission No")}: {child.admission_number}</p></div></div>

            <div className="section-label">🧠 {t("Insights for Aarav")}</div>
            <div className="insights-grid">
                {insights.map((ins, i) => <InsightCard key={i} {...ins} />)}
            </div>

            <div className="section-label" style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🪪</span> {t("Lumiq ID (Universal Student Passport)")}
            </div>
            <div className="card" style={{ padding: 24, marginBottom: 24, background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: 'white', borderRadius: '16px', border: '1px solid #334155', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, letterSpacing: 1 }}>LUMIQ OS ECOSYSTEM</div>
                        <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4, letterSpacing: 2, fontFamily: 'monospace', color: '#38bdf8' }}>LUMI-9428-A7X9</div>
                        <div style={{ marginTop: 16, display: 'flex', gap: 24 }}>
                            <div>
                                <div style={{ fontSize: 11, color: '#64748b' }}>STUDENT NAME</div>
                                <div style={{ fontSize: 15, fontWeight: 600 }}>Aarav Sharma</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 11, color: '#64748b' }}>CURRENT NODE</div>
                                <div style={{ fontSize: 15, fontWeight: 600 }}>Greenfield Academy</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 11, color: '#64748b' }}>PASSPORT ISSUED</div>
                                <div style={{ fontSize: 15, fontWeight: 600 }}>2021</div>
                            </div>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ width: 80, height: 80, background: 'white', padding: 4, borderRadius: 8, marginBottom: 12 }}>
                            {/* Mock QR Code Pattern */}
                            <div style={{ width: '100%', height: '100%', border: '4px solid black', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: 4, left: 4, width: 12, height: 12, background: 'black' }} />
                                <div style={{ position: 'absolute', top: 4, right: 4, width: 12, height: 12, background: 'black' }} />
                                <div style={{ position: 'absolute', bottom: 4, left: 4, width: 12, height: 12, background: 'black' }} />
                                <div style={{ position: 'absolute', top: 24, left: 24, width: 16, height: 16, background: 'black' }} />
                                <div style={{ position: 'absolute', bottom: 12, right: 12, width: 24, height: 8, background: 'black' }} />
                            </div>
                        </div>
                        {pin ? (
                            <div style={{ fontSize: 18, fontWeight: 700, color: '#10b981', fontFamily: 'monospace', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 12px', borderRadius: 4, border: '1px solid #10b981' }}>
                                PIN: {pin}
                            </div>
                        ) : (
                            <button className="btn btn-sm btn-primary" style={{ background: '#38bdf8', color: '#0f172a', border: 'none', fontWeight: 700 }} onClick={() => setPin('4921')}>
                                Generate Transfer PIN
                            </button>
                        )}
                    </div>
                </div>
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #334155', fontSize: 12, color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Transferring to a new school? Provide this ID and the temporary PIN to instantly migrate Aarav's 5-Axis Profile and medical records.</span>
                    <span style={{ color: '#38bdf8', cursor: 'pointer' }}>Learn More {'>'}</span>
                </div>
            </div>

            <div className="section-label" style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🍽️</span> {t("The Kitchen Table (Daily Conversation Starters)")}
            </div>
            <div className="card" style={{ padding: 24, marginBottom: 24, border: '2px solid var(--accent)', background: 'linear-gradient(to right, rgba(59, 130, 246, 0.05), transparent)' }}>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                    {t("Instead of just asking 'How was school today?', use these AI-generated prompts based on exactly what Aarav learned in class today:")}
                </p>
                <div style={{ display: 'grid', gap: 16 }}>
                    {dynamicInsights.length > 0 ? (
                        dynamicInsights.map((insight, idx) => (
                            <div key={idx} style={{ padding: 16, background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid ' + (idx % 2 === 0 ? 'var(--accent)' : 'var(--purple)') }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>{insight.subject.toUpperCase()} ({insight.topic})</span>
                                    <span style={{ fontSize: 12, color: 'var(--success)' }}>{t("Taught Recently")}</span>
                                </div>
                                <div style={{ display: 'grid', gap: 8 }}>
                                    {insight.hooks.map((hook, hIdx) => (
                                        <div key={hIdx} style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', fontStyle: 'italic', display: 'flex', gap: 8 }}>
                                            <span>💬</span> {hook}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : isLoading ? (
                        <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>Analyzing today's learning...</div>
                    ) : (
                        <div style={{ padding: 16, background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--accent)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>{t("GENERAL ENGAGEMENT")}</span>
                            </div>
                            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', fontStyle: 'italic' }}>
                                {t("What was the most interesting highlight of your day today?")}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="section-label" style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🏡</span> {t("Home Quests (Pending Your Approval)")}
            </div>
            <div className="card" style={{ padding: 24, marginBottom: 24, border: '1px solid var(--border)' }}>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                    {t("Aarav completed the following non-academic 'Life Skills' quests at home. Please verify and award the XP.")}
                </p>
                <div style={{ display: 'grid', gap: 16 }}>
                    <div style={{ padding: 16, background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{t("LIFE SKILLS • WEEKEND QUEST")}</div>
                            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{t("Cooked a Meal for the Family")}</div>
                            <div style={{ fontSize: 12, color: 'var(--warning)' }}>{t("Reward: +100 Life Skills XP")}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-sm btn-secondary" style={{ backgroundColor: 'transparent', border: '1px solid var(--border)' }}>{t("Decline")}</button>
                            <button className="btn btn-sm btn-primary" style={{ backgroundColor: 'var(--accent)', color: 'white' }}>{t("Verify & Award XP")}</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="section-label" style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🌳</span> {t("Holistic Development Profile")}
            </div>
            <div className="card" style={{ padding: 24, marginBottom: 24, display: 'flex', gap: 24, alignItems: 'center' }}>
                <div style={{ flex: 1, minHeight: 300 }}>
                    <ResponsiveContainer width="100%" height={300}>
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillData}>
                            <PolarGrid stroke="var(--border)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar name="Aarav" dataKey="A" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.4} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
                <div style={{ flex: 1, padding: 16, background: 'rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--warning)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 18 }}>⚖️</span>
                        <div style={{ fontSize: 14, color: 'var(--warning)', fontWeight: 600 }}>{t("Balance Recommendation")}</div>
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {t("Aarav is performing exceptionally well in Academics and Analytical Thinking.")}
                        <br /><br />
                        {t("However, his Physical development is trailing behind his peers.")}<br /><br />
                        <strong>{t("Action item:")}</strong> {t("Try encouraging him to complete the \"Yoga for Beginners\" weekend quest that his PE teacher assigned to earn extra Physical XP!")}
                    </div>
                </div>
            </div>

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className="card stat-card"><div className="stat-icon blue">📊</div><div className="stat-info"><span className="stat-label">{t("Overall Score")}</span><span className="stat-value">{child.avgScore}%</span></div></div>
                <div className="card stat-card"><div className="stat-icon green">📋</div><div className="stat-info"><span className="stat-label">{t("Attendance")}</span><span className="stat-value">{child.attendance}%</span></div></div>
                <div className="card stat-card"><div className="stat-icon purple">🏆</div><div className="stat-info"><span className="stat-label">{t("Class Rank")}</span><span className="stat-value">#2</span></div></div>
                <div className="card stat-card"><div className="stat-icon cyan">💰</div><div className="stat-info"><span className="stat-label">{t("Fee Status")}</span><span className="stat-value" style={{ color: 'var(--success)', fontSize: 22 }}>✅ {t("Paid")}</span></div></div>
            </div>

            <div className="charts-grid">
                <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ marginBottom: 16 }}>📊 {t("Subject-wise Performance")}</h3>
                    {(demoData?.reportCards || []).map((r, i) => (

                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                            <span style={{ width: 120, fontSize: 13, fontWeight: 500 }}>{r.subject}</span>
                            <div style={{ flex: 1, background: 'var(--bg-primary)', borderRadius: 4, height: 20, overflow: 'hidden' }}>
                                <div style={{ width: `${r.final}%`, height: '100%', background: r.final >= 85 ? 'var(--success)' : r.final >= 70 ? 'var(--warning)' : 'var(--danger)', borderRadius: 4, transition: 'width 1s ease' }} />
                            </div>
                            <span style={{ width: 40, fontSize: 13, fontWeight: 600, textAlign: 'right' }}>{r.final}%</span>
                            <span className={`badge ${r.final >= 85 ? 'active' : r.final >= 70 ? 'pending' : 'absent'}`}>{r.grade}</span>
                        </div>
                    ))}
                </div>
                <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ marginBottom: 16 }}>📋 {t("Monthly Attendance")}</h3>
                    {months.map((m, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                            <span style={{ width: 32, fontSize: 12, color: 'var(--text-muted)' }}>{m}</span>
                            <div style={{ flex: 1, background: 'var(--bg-primary)', borderRadius: 3, height: 16 }}>
                                <div style={{ width: `${attData[i]}%`, height: '100%', background: attData[i] >= 90 ? 'var(--success)' : 'var(--warning)', borderRadius: 3 }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, width: 36, textAlign: 'right' }}>{attData[i]}%</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card" style={{ padding: 24 }}>
                <h3 style={{ marginBottom: 16 }}>💬 {t("Teacher Remarks")}</h3>
                {[{ teacher: t('Dr. Rajesh Kumar'), subject: t('Math'), remark: t('Aarav shows exceptional analytical thinking. Consistently improving.'), date: t('Mar 5') },
                { teacher: t('Mohammed Ali'), subject: t('Science'), remark: t('Outstanding lab work. Recommend for Science Olympiad.'), date: t('Mar 3') },
                ].map((r, i) => (
                    <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{r.teacher} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({r.subject})</span></div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{r.remark}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{r.date}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
